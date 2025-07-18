from typing import Optional

from fastapi import Query
from app.db.firebase_client import db
from http.client import HTTPException
from random import random
from app.models.patient_model import PatientCreateModel, PatientUpdateModel
from datetime import datetime, timezone
from app.utils.logger import logger
from app.schemas.patient_schema import PatientCreateSchema
import time

from app.utils.exceptions import UserNotFoundError


# -------------------------Create Patient-------------------------
async def create_patient_service(
    patient_data: PatientCreateSchema, current_user: dict = None
):
    try:
        # Generate a patient ID (fixed prefix "1751" + 10-digit random number)
        patient_id = str(int(time.time() * 1000))

        # Extract user email from Firebase decoded token (if available)
        created_by = current_user.get("email") if current_user else "Unknown"

        # Create the model instance from incoming schema
        patient_model = PatientCreateModel(
            **patient_data.model_dump(),
            PatientRegistrationNumber=patient_id,
            LogDateTime=datetime.now(timezone.utc),
            User=created_by,
        )

        # Store in Firestore
        doc_ref = db.collection("collection_PatientRegistration").document()
        doc_ref.set(patient_model.model_dump())

        logger.info(f"✅ Patient {patient_model.FullName} created successfully.")

        return {"id": patient_id, **patient_model.model_dump()}

    except Exception as e:
        logger.error(f"❌ Failed to create patient: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create patient")


# -------------------------Check Duplicate Patient-------------------------
async def check_duplicate_patient_service(full_name: str, phone_number: int):

    logger.info(f"Querying for name={full_name.upper()} phone={phone_number}")

    try:
        query = (
            db.collection("collection_PatientRegistration")
            .where("FullName", "==", full_name.upper())
            .where("PhoneNumber", "==", phone_number)
            .get()
        )

        # Check if any documents match
        if len(query) > 0:
            return True  # Duplicate exists
        else:
            return False  # No duplicate

    except Exception as e:
        logger.error(f"❌ Failed to check duplicate patient: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to check duplicate patient")


# -------------------------View Patients-------------------------
async def view_and_search_patients_service(
    search_type: Optional[str] = Query(None),  # 'full_name' or 'phone_number'
    search_value: Optional[str] = Query(None),  # value to search
    cursor: Optional[str] = Query(None),  # document ID for cursor
    limit: int = 10,
):
    try:
        collection_ref = db.collection("collection_PatientRegistration")

        if search_type == "full_name" and search_value:
            query = (
                collection_ref.order_by("FullName")
                .start_at([search_value.upper()])
                .end_at([search_value.upper() + "\uf8ff"])
            )
        elif search_type == "phone_number" and search_value:
            query = collection_ref.where("PhoneNumber", "==", int(search_value))
        elif search_type == "registration_id" and search_value:
            query = collection_ref.where(
                "PatientRegistrationNumber", "==", str(search_value)
            )
        else:
            query = collection_ref.order_by("LogDateTime", direction="DESCENDING")

        # Add cursor if present
        if cursor:
            cursor_doc = collection_ref.document(cursor).get()
            if cursor_doc.exists:
                query = query.start_after(cursor_doc)

        query = query.limit(limit)
        docs = query.get()

        next_cursor = docs[-1].id if len(docs) == limit else None

        results = [doc.to_dict() | {"doc_id": doc.id} for doc in docs]

        return {
            "success": True,
            "data": results,
            "next_cursor": next_cursor,
        }

    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------Get Patient By Id-------------------------
async def get_patient_by_id_service(patientId: str):
    global db
    try:
        # Query the collection for the patient registration number
        query = db.collection("collection_PatientRegistration").where(
            "PatientRegistrationNumber", "==", patientId
        )

        docs = query.stream()
        result = next(docs, None)  # Get the first matching document

        if not result or not result.exists:
            logger.error(f"❌ Patient not found with ID: {patientId}")
            raise UserNotFoundError()

        return result.to_dict()
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------Update Patient---------------------------
async def update_patient_service(
    patientId: str, patient_data: PatientCreateSchema, current_user: dict = None
):
    try:
        # Extract user email from Firebase decoded token (if available)
        created_by = current_user.get("email") if current_user else "Unknown"

        # Create the model instance from incoming schema
        patient_model = PatientUpdateModel(
            **patient_data.model_dump(),
            ModifiedDateTime=datetime.now(timezone.utc),
            ModifiedUser=created_by,
        )
        # Query the collection for the patient registration number
        query = db.collection("collection_PatientRegistration").where(
            "PatientRegistrationNumber", "==", patientId
        )
        docs = query.stream()
        existing_doc = next(docs, None)

        if not existing_doc:
            logger.error(f"❌ Patient not found with ID: {patientId}")
            raise UserNotFoundError()

        # ✅ Update only the matched document
        existing_doc.reference.update(patient_model.model_dump())

        # 🔁 Return updated data (optional: merge with new data)
        updated_snapshot = existing_doc.reference.get()
        return updated_snapshot.to_dict()

    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------Delete Patient---------------------------
async def delete_patient_service(patientId: str):
    try:
        # Query the collection for the patient registration number
        query = db.collection("collection_PatientRegistration").where(
            "PatientRegistrationNumber", "==", patientId
        )
        docs = query.stream()
        existing_doc = next(docs, None)

        if not existing_doc:
            logger.error(f"❌ Patient not found with ID: {patientId}")
            raise UserNotFoundError()

        # ✅ Delete only the matched document
        existing_doc.reference.delete()

        return {"success": True, "message": "Patient deleted successfully."}

    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
