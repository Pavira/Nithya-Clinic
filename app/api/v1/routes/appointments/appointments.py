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
)

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
)

router = APIRouter(tags=["Appointments"])


# -------------Add Appointment----------------
@router.post("/add_appointment")
async def add_appointment(appointment_data: AppointmentSchema, request: Request):
    """
    API to create a new appointment record.
    """
    try:
        print("Creating appointment with data:", appointment_data)
        current_user = getattr(request.state, "current_user", None)
        result = await create_appointment_service(
            appointment_data, current_user=current_user
        )

        print("Result:", result)
        if result.get("success") is False:
            return result  # or keep just {"success": False, "message": "..."}

        return {
            "success": True,
        }

    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# -------------------Get Appointments-------------------
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
