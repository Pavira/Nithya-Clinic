from typing import List, Optional
import uuid
from zoneinfo import ZoneInfo

from fastapi import File, Query, UploadFile
import pytz
from app.db.firebase_client import db, bucket
from fastapi import HTTPException
from random import random
from app.models.patient_model import PatientCreateModel, PatientUpdateModel
from datetime import datetime, timedelta, timezone
from app.utils.logger import logger
import time

from app.utils.exceptions import UserNotFoundError
from app.schemas.appointment_schema import (
    AppointmentSchema,
    UpdateAppointmentSchema,
    VitalsSchema,
)
from app.models.appointment_model import (
    AppointmentModel,
    UpdateAppointmentModel,
    VitalsModel,
)
from app.utils.response import not_found_response


# -------------------------Create Appointment-------------------------
async def create_appointment_service(appointment_data: AppointmentSchema):
    try:
        patient_id = appointment_data.patient_id

        raw_appointment_datetime = appointment_data.appointment_datetime

        ist = pytz.timezone("Asia/Kolkata")

        # Parse input string as naive datetime (no timezone)
        naive_datetime = datetime.fromisoformat(raw_appointment_datetime)

        # Localize it to IST (correct way to add timezone)
        appointment_datetime = ist.localize(naive_datetime)

        print("✅ Final Appointment datetime (IST):", appointment_datetime)

        # 🔍 STEP 1: Count existing appointments for this patient
        patient_appointments_query = db.collection(
            "collection_PatientAppointment"
        ).where("PatientRegistrationNumber", "==", patient_id)

        patient_appointments = list(patient_appointments_query.stream())
        appointment_count = len(patient_appointments) + 1

        # 📆 STEP 2: Check for duplicate date + time
        conflict_query = db.collection("collection_PatientAppointment").where(
            "AppointmentDateTime", "==", appointment_datetime
        )

        conflicting_appointments = list(conflict_query.stream())

        if conflicting_appointments:
            logger.error(
                f"❌ Appointment already exists for this date and time: {appointment_datetime}"
            )
            return {
                "success": False,
                "message": "Appointment already exists for this date and time.",
            }

        # Extra Model Data
        # created_by = current_user.get("email") if current_user else "Unknown"
        # print("👤 Created by:===", created_by)
        created_at = datetime.now(timezone.utc)
        status = "Active"
        appointment_no = appointment_count
        doctor_fees = 0
        appointment_id = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S.%f")

        data = appointment_data.model_dump()
        data["appointment_datetime"] = (
            appointment_datetime  # Overwrite with parsed datetime
        )

        # Create the model instance from incoming schema
        appointment_model = AppointmentModel(
            **data,
            AppointmentRegNum=appointment_id,
            AppointmentNumber=appointment_no,
            DoctorFees=doctor_fees,
            LogDateTime=created_at,
            AppointmentStatus=status,
        )

        # Store in Firestore
        doc_ref = db.collection("collection_PatientAppointment").document()
        doc_ref.set(appointment_model.model_dump())

        logger.info(
            f"✅ Appointment created successfully for {appointment_model.FullName} ."
        )
        return {"success": True}

    except Exception as e:
        logger.error(f"❌ Failed to create Appointment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create Appointment")


# -------------------------View Appointment-------------------------

# -----------------------------Final version----------------------
# async def get_appointment_service(
#     status: str = None,
#     date: str = None,
#     search_type: str = None,
#     search_value: str = None,
# ):
#     global db
#     try:
#         tz = pytz.timezone("Asia/Kolkata")

#         # ✅ Base collection
#         appointment_ref = db.collection("collection_PatientAppointment")

#         # ✅ Date filter (indexed range query)
#         if date:
#             date_obj = datetime.strptime(date, "%Y-%m-%d")
#             start_dt = tz.localize(date_obj)
#             end_dt = start_dt + timedelta(days=1)
#             appointment_ref = appointment_ref.where(
#                 "AppointmentDateTime", ">=", start_dt
#             ).where("AppointmentDateTime", "<", end_dt)

#         # ✅ Status filter (combine with date in index)
#         if status:
#             appointment_ref = appointment_ref.where("AppointmentStatus", "==", status)

#         # ✅ Hard limit for safety (max per day is ~100, but keeping 200 buffer)
#         docs = appointment_ref.limit(200).stream()

#         appointments = []
#         active_count = closed_count = cancelled_count = 0

#         # ✅ Single pass for counting + optional search filtering
#         for doc in docs:
#             data = doc.to_dict()
#             data["id"] = doc.id

#             # Count statuses
#             status_val = data.get("AppointmentStatus")
#             if status_val == "Active":
#                 active_count += 1
#             elif status_val == "Closed":
#                 closed_count += 1
#             elif status_val == "Cancelled":
#                 cancelled_count += 1

#             # Search filtering
#             if search_type and search_value:
#                 val = str(search_value).strip().upper()
#                 match = False

#                 if search_type == "full_name":
#                     match = val in str(data.get("FullName", "")).upper()
#                 elif search_type == "registration_id":
#                     match = (
#                         val in str(data.get("PatientRegistrationNumber", "")).upper()
#                     )

#                 if not match:
#                     continue

#             appointments.append(data)

#         print("🎯 Active appointments count:", active_count)
#         print("🎯 Closed appointments count:", closed_count)
#         print("🎯 Cancelled appointments count:", cancelled_count)

#         return {
#             "appointments": appointments,
#             "active_count": active_count,
#             "closed_count": closed_count,
#             "cancelled_count": cancelled_count,
#         }

#     except Exception as e:
#         logger.error(f"❌ Error fetching appointments: {e}")
#         raise HTTPException(status_code=500, detail="Error fetching appointments")


async def get_appointment_service(
    status: str = None,
    date: str = None,
    search_type: str = None,
    search_value: str = None,
):
    global db
    try:
        tz = pytz.timezone("Asia/Kolkata")

        # ✅ Base collection
        appointment_ref = db.collection("collection_PatientAppointment")

        # ✅ Date filter (indexed range query)
        if date:
            date_obj = datetime.strptime(date, "%Y-%m-%d")
            start_dt = tz.localize(date_obj)
            end_dt = start_dt + timedelta(days=1)
            appointment_ref = appointment_ref.where(
                "AppointmentDateTime", ">=", start_dt
            ).where("AppointmentDateTime", "<", end_dt)

        # ✅ Hard limit for safety
        docs = appointment_ref.limit(200).stream()

        all_docs = list(docs)  # materialize so we can iterate twice

        appointments = []
        active_count = closed_count = cancelled_count = 0

        for doc in all_docs:
            data = doc.to_dict()
            status_val = data.get("AppointmentStatus")

            # Count statuses (✅ independent of filter)
            if status_val == "Active":
                active_count += 1
            elif status_val == "Closed":
                closed_count += 1
            elif status_val == "Cancelled":
                cancelled_count += 1

        # ✅ Now apply status filter only for returned appointments
        for doc in all_docs:
            data = doc.to_dict()
            data["id"] = doc.id

            # Filter by status (only for list, not counts)
            if status and data.get("AppointmentStatus") != status:
                continue

            # Search filtering
            if search_type and search_value:
                val = str(search_value).strip().upper()
                match = False

                if search_type == "full_name":
                    match = val in str(data.get("FullName", "")).upper()
                elif search_type == "registration_id":
                    match = (
                        val in str(data.get("PatientRegistrationNumber", "")).upper()
                    )

                if not match:
                    continue

            appointments.append(data)

        return {
            "appointments": appointments,
            "active_count": active_count,
            "closed_count": closed_count,
            "cancelled_count": cancelled_count,
        }

    except Exception as e:
        logger.error(f"❌ Error fetching appointments: {e}")
        raise HTTPException(status_code=500, detail="Error fetching appointments")


# ------------------Fetch Vitals --------------------
async def get_vitals_service(appointment_id: str):
    global db
    try:
        doc_ref = db.collection("collection_PatientAppointment").where(
            "AppointmentRegNum", "==", appointment_id
        )

        docs = doc_ref.stream()
        first_doc = next(docs, None)

        if first_doc:
            return {"vitals": first_doc.to_dict()}
        else:
            return {"vitals": None}

    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ------------------Save Vitals --------------------
async def save_vitals_service(vital_data: VitalsSchema, appointment_id: str):
    global db
    try:
        # Step 1: Query appointment(s) by reg_no
        query = db.collection("collection_PatientAppointment").where(
            "AppointmentRegNum", "==", appointment_id
        )
        docs = query.stream()

        # Step 2: Get the first matching document
        first_doc = next(docs, None)
        if not first_doc:
            raise HTTPException(status_code=404, detail="Appointment not found")

        # Step 3: Create the vitals model and convert to dict
        vital_model = VitalsModel(**vital_data.model_dump())
        vitals_dict = vital_model.to_dict()

        # Step 4: Merge vitals into the existing document
        first_doc.reference.set(vitals_dict, merge=True)
        logger.info(f"✅ Vitals merged successfully for {appointment_id}")
        return {"success": True}

    except Exception as e:
        logger.error(f"❌ Error saving vitals for {appointment_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# -------------------Edit Appointment---------------------
async def update_appointment_service(
    appointment_id: str,
    appointment_data: UpdateAppointmentSchema,
    user: str,
    images: Optional[List[UploadFile]] = File([]),
    prescription_images: Optional[List[UploadFile]] = File([]),
):
    global db, bucket
    image_urls = []
    prescription_image_urls = []

    try:

        # Fetching user ID
        user_query = db.collection("users").where("email", "==", user)
        user_docs = user_query.stream()
        user_id = None
        for doc in user_docs:
            user_id = doc.id
            break

        print("userId:--", user_id)

        # Storing Images
        # images = appointment_data.images
        if images:
            for img in images:
                filename = f"{int(time.time() * 1000)}_{img.filename}"
                blob_path = f"users/{user_id}/uploads/{filename}"
                blob = bucket.blob(blob_path)

                token = str(uuid.uuid4())
                blob.metadata = {"firebaseStorageDownloadTokens": token}
                blob.upload_from_file(img.file, content_type=img.content_type)
                blob.patch()

                image_url = f"https://firebasestorage.googleapis.com/v0/b/{bucket.name}/o/{blob_path.replace('/', '%2F')}?alt=media&token={token}"
                image_urls.append(image_url)
        else:
            image_urls = []

        # prescriptionImages = appointment_data.prescription_images
        if prescription_images:
            for img in prescription_images:
                filename = f"{int(time.time() * 1000)}_{img.filename}"
                blob_path = f"users/{user_id}/uploads/{filename}"
                blob = bucket.blob(blob_path)

                token = str(uuid.uuid4())
                blob.metadata = {"firebaseStorageDownloadTokens": token}
                blob.upload_from_file(img.file, content_type=img.content_type)
                blob.patch()

                pres_image_url = f"https://firebasestorage.googleapis.com/v0/b/{bucket.name}/o/{blob_path.replace('/', '%2F')}?alt=media&token={token}"
                prescription_image_urls.append(pres_image_url)
        else:
            prescription_image_urls = []

        # ImageURLs: Optional[list] = Field(default_factory=list, alias="images")
        # MedPrescImages: Optional[list] = Field(
        #     default_factory=list, alias="prescription_images"
        # )

        query = db.collection("collection_PatientAppointment").where(
            "AppointmentRegNum", "==", appointment_id
        )
        docs = query.stream()

        # Step 2: Get the first matching document
        first_doc = next(docs, None)
        if not first_doc:
            raise HTTPException(status_code=404, detail="Appointment not found")

        # Step 3: Create the vitals model and convert to dict
        appointment_model = UpdateAppointmentModel(
            **appointment_data.model_dump(), AppointmentStatus="Closed"
        )

        appointment_dict = appointment_model.to_dict()
        # Add these URLs to appointment_dict if needed:
        appointment_dict["ImageURLs"] = image_urls
        appointment_dict["MedPrescImages"] = prescription_image_urls

        # Step 4: Merge vitals into the existing document
        first_doc.reference.set(appointment_dict, merge=True)
        logger.info(f"✅ Appointment updated successfully for {appointment_id}")
        return {"success": True}

    except Exception as e:
        logger.error(f"❌ Error updating appointment for {appointment_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# -------------------Cancel Appointment---------------------
async def cancel_appointment_service(appointment_id: str):
    global db
    try:
        query = db.collection("collection_PatientAppointment").where(
            "AppointmentRegNum", "==", appointment_id
        )
        docs = query.stream()

        # Step 2: Get the first matching document
        first_doc = next(docs, None)
        if not first_doc:
            raise HTTPException(status_code=404, detail="Appointment not found")

        # Step 3: Create the vitals model and convert to dict
        first_doc.reference.set({"AppointmentStatus": "Cancelled"}, merge=True)
        logger.info(f"✅ Appointment cancelled successfully for {appointment_id}")
        return {"success": True}

    except Exception as e:
        logger.error(f"❌ Error cancelling appointment for {appointment_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# -------------------Appointment History---------------------
async def get_appointment_history_service(reg_no: str):
    global db
    try:
        query = db.collection("collection_PatientAppointment").where(
            "PatientRegistrationNumber", "==", reg_no
        )
        docs = query.stream()

        appointments = []
        for doc in docs:
            data = doc.to_dict()
            appointments.append(data)

        return {"appointments": appointments}

    except Exception as e:
        logger.error(f"❌ Error fetching appointments: {e}")
        raise not_found_response()


# --------------Check Appointments--------------- check_appointment_service
async def check_appointment_service(reg_no: str):
    global db

    try:
        # Step 1: Get current date range in IST (India time)
        ist = pytz.timezone("Asia/Kolkata")
        now_ist = datetime.now(ist)

        # Start and end of day in IST
        start_of_day = now_ist.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)

        # Step 2: Query for today's appointments for given reg_no
        query = (
            db.collection("collection_PatientAppointment")
            .where("PatientRegistrationNumber", "==", reg_no)
            .where("AppointmentDateTime", ">=", start_of_day)
            .where("AppointmentDateTime", "<", end_of_day)
            .where("AppointmentStatus", "==", "Active")  # ✅ Check for Active status
            .limit(1)
        )

        docs = query.stream()
        first_doc = next(docs, None)

        if first_doc:
            logger.info(f"✅ Appointment found today for {reg_no}")
            return {"appointments": first_doc.to_dict()}
        else:
            # raise HTTPException(status_code=404, detail="No appointment found today")
            return {"appointments": None}

    except Exception as e:
        logger.error(f"❌ Error checking appointment for {reg_no}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# -------------------View Image---------------------
async def view_image_service(appointment_id: str):
    global db, bucket
    try:
        query = db.collection("collection_PatientAppointment").where(
            "AppointmentRegNum", "==", appointment_id
        )
        docs = query.stream()

        first_doc = next(docs, None)
        if not first_doc:
            raise HTTPException(status_code=404, detail="Appointment not found")

        data = first_doc.to_dict()
        image_urls = data.get("ImageURLs", [])

        if not image_urls:
            raise HTTPException(
                status_code=404, detail="No images found for this appointment"
            )

        print("Image URLs service:", image_urls)

        return {"image_urls": image_urls}

    except Exception as e:
        logger.error(f"❌ Error viewing image for {appointment_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# -------------------View prescription image---------------------
async def view_prescription_service(appointment_id: str):
    global db, bucket
    try:
        query = db.collection("collection_PatientAppointment").where(
            "AppointmentRegNum", "==", appointment_id
        )
        docs = query.stream()

        first_doc = next(docs, None)
        if not first_doc:
            raise HTTPException(status_code=404, detail="Appointment not found")

        data = first_doc.to_dict()
        image_urls = data.get("MedPrescImages", [])

        if not image_urls:
            raise HTTPException(
                status_code=404,
                detail="No prescription images found for this appointment",
            )

        print("Image URLs service:", image_urls)

        return {"image_urls": image_urls}

    except Exception as e:
        logger.error(f"❌ Error viewing prescription for {appointment_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
