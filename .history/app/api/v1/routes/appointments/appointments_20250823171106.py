from datetime import datetime
import json
from typing import List, Optional
from fastapi import (
    APIRouter,
    File,
    Form,
    HTTPException,
    Path,
    Query,
    Request,
    UploadFile,
    status,
)
from grpc import Status

from app.schemas.appointment_schema import (
    AppointmentSchema,
    UpdateAppointmentSchema,
    VitalsSchema,
)
from app.utils.response import success_response
from app.utils.middlewares import logger
from app.services.appointments.appointment_service import (
    cancel_appointment_service,
    check_appointment_service,
    create_appointment_service,
    get_appointment_history_service,
    get_appointment_service,
    get_vitals_service,
    save_vitals_service,
    update_appointment_service,
    view_image_service,
    view_prescription_service,
)
from app.db.firebase_client import db

router = APIRouter(tags=["Appointments"])


# -------------Add Appointment----------------
@router.post("/add_appointment")
async def add_appointment(appointment_data: AppointmentSchema):
    """
    API to create a new appointment record.
    """
    try:
        print("Creating appointment with data:", appointment_data)
        result = await create_appointment_service(appointment_data)

        print("Result:", result)
        if result.get("success") is False:
            return result  # or keep just {"success": False, "message": "..."}

        return {
            "success": True,
        }

    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# -------------------View Appointments-------------------
@router.get("/view_appointments")
async def view_appointments(
    status: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    search_type: Optional[str] = Query(None, alias="search_type"),
    search_value: Optional[str] = Query(None, alias="search_value"),
):
    """
    API to list appointments by optional filters: status, date, and search
    """
    result = await get_appointment_service(status, date, search_type, search_value)
    return success_response(data=result, message="Appointments retrieved successfully")


# ------------------Fetch Vitals --------------------
@router.get("/fetch_vitals/{appointment_id}")
async def fetch_vitals(appointment_id: str):
    """
    API to fetch vitals by registration number
    """
    try:
        result = await get_vitals_service(appointment_id)
        if result.get("vitals") is None:
            raise HTTPException(status_code=404, detail="Vitals not found")

        return success_response(data=result, message="Vitals retrieved successfully")

    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ------------------Save Vitals --------------------
@router.post("/save_vitals/{appointment_id}")
async def save_vitals(vital_data: VitalsSchema, appointment_id: str):
    """
    API to save vitals
    """
    try:
        result = await save_vitals_service(vital_data, appointment_id)
        return success_response(data=result, message="Vitals saved successfully")

    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ------------------Edit Appointment --------------------
@router.post("/edit_appointment/{appointment_id}/{user}")
async def edit_appointment(
    appointment_id: str,
    data: str = Form(...),
    user: str = Path(...),
    images: Optional[List[UploadFile]] = File([]),
    prescription_images: Optional[List[UploadFile]] = File([]),
):
    """
    API to update an existing appointment record.
    """
    try:
        # Parse the JSON string into a Pydantic model
        appointment_dict = json.loads(data)
        appointment_data = UpdateAppointmentSchema(**appointment_dict)
        print("Updating appointment with data:", appointment_data)
        result = await update_appointment_service(
            appointment_id, appointment_data, user, images, prescription_images
        )

        print("Result:", result)
        if result.get("success") is False:
            return result  # or keep just {"success": False, "message": "..."}

        logger.info("Appointment updated successfully")
        return {
            "success": True,
        }

    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# -------------------Delete Appointment-------------------
@router.get("/cancel_appointment/{appointment_id}")
async def cancel_appointment(appointment_id: str):
    """
    API to cancel an existing appointment record.
    """
    try:
        result = await cancel_appointment_service(appointment_id)

        print("Result:", result)
        if result.get("success") is False:
            return result  # or keep just {"success": False, "message": "..."}

        logger.info("Appointment cancelled successfully")
        return {
            "success": True,
        }

    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------Appointment History -------------------------
@router.get("/view_appointment_history")
async def view_appointment_history(reg_no: str):
    """
    API to list appointment history
    """
    result = await get_appointment_history_service(reg_no)

    if result.get("appointments") is None:
        raise HTTPException(status_code=404, detail="Appointments not found")

    return success_response(data=result, message="Appointments retrieved successfully")


# ----------------------Check Appointment---------------------
@router.get("/check_appointment/{reg_no}")
async def check_appointment(reg_no: str):
    """
    API to Check appointments
    """
    try:
        result = await check_appointment_service(reg_no)

        print("result:---", result)
        if result is None:
            return {"success": False}

        return success_response(
            data=result, message="Appointments retrieved successfully"
        )

    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------View Image---------------------
@router.get("/view_image/{appointment_id}")
async def view_image(appointment_id: str):
    """
    API to view appointment image
    """
    try:
        # Assuming the service returns a URL or path to the image
        result = await view_image_service(appointment_id)
        if result.get("image_urls") is None or result == []:
            return {"success": False}

        print("Image URL:-", result.get("image_urls"))
        print("Result:-", result)

        return success_response(data=result, message="Image retrieved successfully")

    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------View Prescription Image---------------------
@router.get("/view_prescription_image/{appointment_id}")
async def view_image(appointment_id: str):
    """
    API to view appointment prescription image
    """
    try:
        # Assuming the service returns a URL or path to the image
        result = await view_prescription_service(appointment_id)
        if result.get("image_urls") is None or result == []:
            return {"success": False}

        print("Image URL:-", result.get("image_urls"))
        print("Result:-", result)

        return success_response(data=result, message="Image retrieved successfully")

    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------Fetch Instruction Only---------------------
@router.get("/fetch_instruction")
async def fetch_instruction():
    try:
        # Query only the Description field
        collection_ref = db.collection("Drug_Category").select(["Description"])
        docs = collection_ref.get()

        # Create a list of only Description values
        description = [doc.get("Description") for doc in docs if doc.get("Description")]

        return {"success": True, "data": description}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch drug names: {str(e)}",
        )
