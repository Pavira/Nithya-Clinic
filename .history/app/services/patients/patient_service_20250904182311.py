import logging
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

from firebase_admin import firestore


# -------------------------Create Patient-------------------------
async def create_patient_service(
    patient_data: PatientCreateSchema,
):
    try:
        patient_id = str(int(time.time() * 1000))

        # Extract user email from Firebase decoded token (if available)
        # created_by = current_user.get("email") if current_user else "Unknown"
        # print("created_by===", current_user.get("email"))

        # Create the model instance from incoming schema
        patient_model = PatientCreateModel(
            **patient_data.model_dump(),
            PatientRegistrationNumber=patient_id,
            LogDateTime=datetime.now(timezone.utc),
            # User=created_by,
        )

        # Store in Firestore
        doc_ref = db.collection("collection_PatientRegistration").document()
        doc_ref.set(patient_model.model_dump())

        db.collection("Count").document("count").update(
            {"patient_count": firestore.Increment(1)}
        )

        logger.info(f"✅ Patient {patient_model.FullName} created successfully.")

        return {"id": patient_id, **patient_model.model_dump()}

    except Exception as e:
        logger.error(f"❌ Failed to create patient: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create patient")


# async def create_patient_service(
#     patient_data: PatientCreateSchema, current_user: dict = None
# ):
#     try:
#         patient_id = str(int(time.time() * 1000))
#         created_by = current_user.get("email") if current_user else "Unknown"

#         patient_model = PatientCreateModel(
#             **patient_data.model_dump(),
#             PatientRegistrationNumber=patient_id,
#             LogDateTime=datetime.now(timezone.utc),
#             User=created_by,
#         )

#         # Create Firestore references
#         patient_doc_ref = db.collection("collection_PatientRegistration").document()
#         count_doc_ref = db.collection("Count").document("count")

#         def transaction_function(transaction):
#             # Read the current count safely inside the transaction
#             snapshot = count_doc_ref.get(transaction=transaction)
#             current_count = snapshot.get("patient_count") or 0

#             # Increment count
#             new_count = current_count + 1
#             transaction.update(count_doc_ref, {"patient_count": new_count})

#             # Create patient document
#             transaction.set(patient_doc_ref, patient_model.model_dump())

#         # Run Firestore transaction
#         db.run_transaction(transaction_function)

#         logger.info(f"✅ Patient {patient_model.FullName} created successfully.")
#         return {"id": patient_id, **patient_model.model_dump()}

#     except Exception as e:
#         logger.error(f"❌ Failed to create patient: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to create patient")


# -------------------------Check Duplicate Patient-------------------------
async def check_duplicate_patient_service(
    full_name: str, phone_number: int, patient_id: str = None
):

    logger.info(f"Querying for name={full_name.upper()} phone={phone_number}")

    try:
        query = (
            db.collection("collection_PatientRegistration")
            .where("FullName", "==", full_name.upper())
            .where("PhoneNumber", "==", phone_number)
            .get()
        )

        for doc in query:
            if (
                doc.PatientRegistrationNumber != patient_id
            ):  # ✅ exclude current patient by ID
                return True  # Duplicate exists

        return False  # No duplicates (or only the same patient)

        # # Check if any documents match
        # if len(query) > 0:
        #     return True  # Duplicate exists
        # else:
        #     return False  # No duplicate

    except Exception as e:
        logger.error(f"❌ Failed to check duplicate patient: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to check duplicate patient")


# -------------------------View Patients-------------------------
async def view_and_search_patients_service(
    search_type: Optional[str] = Query(None),
    search_value: Optional[str] = Query(None),
    cursor: Optional[str] = Query(None),
    # limit: int = 10,
):
    start_time = time.perf_counter()
    try:
        fields = [
            "PatientRegistrationNumber",
            "FullName",
            "PhoneNumber",
            "PatientType",
            "LogDateTime",
        ]

        collection_ref_field = db.collection("collection_PatientRegistration")
        collection_ref = collection_ref_field.select(fields)

        if search_type and search_value:
            # 🔍 Search mode → no pagination, just fetch all
            if search_type == "full_name":
                query = (
                    collection_ref.order_by("FullName")
                    .start_at([search_value])
                    .end_at([search_value + "\uf8ff"])
                )
            elif search_type == "phone_number":
                query = collection_ref.where("PhoneNumber", "==", int(search_value))
            elif search_type == "registration_id":
                query = collection_ref.where(
                    "PatientRegistrationNumber", "==", str(search_value)
                )
            else:
                query = collection_ref

            docs = query.stream()
            results = [doc.to_dict() | {"doc_id": doc.id} for doc in docs]

            return {
                "success": True,
                "data": results,
                # "page_count": len(results),  # all results in one shot
                "next_cursor": None,  # 🚫 no pagination
                "total_count": len(results),
            }

        # 📄 Normal listing with pagination
        else:
            limit = 10

            patient_count_doc = db.collection("Count").document("count").get()
            if patient_count_doc.exists:
                total_docs = patient_count_doc.to_dict().get("patient_count", 0)
            else:
                total_docs = 0

            query = collection_ref.order_by("LogDateTime", direction="DESCENDING")

            if cursor:
                cursor_doc = collection_ref_field.document(cursor).get()
                if cursor_doc.exists:
                    query = query.start_after(cursor_doc)

            query = query.limit(limit)
            docs = query.get()

            results = [doc.to_dict() | {"doc_id": doc.id} for doc in docs]
            next_cursor = docs[-1].id if len(docs) == limit else None

            return {
                "success": True,
                "data": results,
                # "page_count": len(results),
                "next_cursor": next_cursor,
                "total_count": total_docs,
            }

    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# async def view_and_search_patients_service(
#     search_type: Optional[str] = Query(None),
#     search_value: Optional[str] = Query(None),
#     cursor: Optional[str] = Query(None),
#     limit: int = 10,
# ):
#     start_time = time.perf_counter()
#     try:
#         # Get total patient count from count document
#         patient_count_doc = db.collection("Count").document("count").get()
#         if patient_count_doc.exists:
#             total_docs = patient_count_doc.to_dict().get("patient_count", 0)
#         else:
#             total_docs = 0

#         # 1) Build base query with projection (select only what the table needs)
#         fields = [
#             "PatientRegistrationNumber",
#             "FullName",
#             "PhoneNumber",
#             "PatientType",
#             "LogDateTime",
#         ]

#         collection_ref_field = db.collection("collection_PatientRegistration")
#         collection_ref = collection_ref_field.select(fields)

#         # Build query based on search type
#         if search_type == "full_name" and search_value:
#             query = (
#                 collection_ref.order_by("FullName")
#                 .start_at([search_value])
#                 .end_at([search_value + "\uf8ff"])
#             )
#         elif search_type == "phone_number" and search_value:
#             query = collection_ref.where("PhoneNumber", "==", int(search_value))
#         elif search_type == "registration_id" and search_value:
#             query = collection_ref.where(
#                 "PatientRegistrationNumber", "==", str(search_value)
#             )
#         else:
#             query = collection_ref.order_by("LogDateTime", direction="DESCENDING")

#         # Apply cursor for pagination
#         if cursor:
#             cursor_doc = collection_ref_field.document(cursor).get()
#             if cursor_doc.exists:
#                 query = query.start_after(cursor_doc)

#         query = query.limit(limit)
#         docs = query.get()

#         page_count = len(docs)  # ✅ number of results returned in this page
#         next_cursor = docs[-1].id if len(docs) == limit else None
#         results = [doc.to_dict() | {"doc_id": doc.id} for doc in docs]

#         elapsed_time = time.perf_counter() - start_time
#         print(f"⏱ Service execution time: {elapsed_time:.4f} seconds")

#         return {
#             "success": True,
#             "data": results,
#             "page_count": page_count,
#             "next_cursor": next_cursor,
#             "total_count": total_docs,
#         }

#     except Exception as e:
#         logger.error(f"❌ Error: {e}")
#         raise HTTPException(status_code=500, detail=str(e))


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
    patientId: str,
    patient_data: PatientCreateSchema,
):
    try:
        # Extract user email from Firebase decoded token (if available)
        # created_by = current_user.get("email") if current_user else "Unknown"

        # Create the model instance from incoming schema
        patient_model = PatientUpdateModel(
            **patient_data.model_dump(),
            # ModifiedDateTime=datetime.now(timezone.utc),
            # ModifiedUser=created_by,
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

        # ✅ Decrement patient count atomically
        count_doc_ref = db.collection("Count").document("count")
        count_doc_ref.update({"patient_count": firestore.Increment(-1)})

        return {"success": True, "message": "Patient deleted successfully."}

    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
