from fastapi import APIRouter, HTTPException, Request
from app.schemas.patient_schema import PatientCreateSchema
from app.services.patients.patient_service import (
    check_duplicate_patient_service,
    create_patient_service,
    delete_patient_service,
    get_patient_by_id_service,
    update_patient_service,
)
from app.utils.response import success_response
from app.services.patients.patient_service import (
    view_and_search_patients_service,
)
from app.utils.logger import logger

router = APIRouter(tags=["Patients"])


# -------------Add Patient----------------
@router.post("/add_patient")
async def add_patient(patient_data: PatientCreateSchema):
    """
    API to create a new patient record.
    """
    try:
        print("Creating patient with data:", patient_data)
        # current_user = getattr(request.state, "current_user", None)
        result = await create_patient_service(patient_data)

        return success_response(message="Patient created successfully", data=result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------Check Duplicate Patient----------------
@router.get("/check_duplicate_patient")
async def check_duplicate_patient(full_name: str, phone_number: int):
    """
    API to check if a patient with the same full name and phone number already exists.
    """
    try:

        result = await check_duplicate_patient_service(full_name, phone_number)
        return success_response(message="Duplicate check successful", data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------View Patients----------------
@router.get("/view_and_search_patients")
async def view_and_search_patients(
    search_type: str = None,
    search_value: str = None,
    cursor: str = None,
    limit: int = None,
):
    """
    API to view and search patients.
    """
    try:
        result = await view_and_search_patients_service(
            search_type=search_type,
            search_value=search_value,
            cursor=cursor,
            limit=limit,
        )
        return success_response(message="Patients retrieved successfully", data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------Update Patient----------------
@router.put("/{patientId}")
async def update_patient(
    patientId: str,
    patient_data: PatientCreateSchema,
):
    """
    API to update a patient record.
    """
    try:
        # print("Creating patient with data:", patient_data)
        # current_user = getattr(request.state, "current_user", None)
        result = await update_patient_service(patientId, patient_data)
        print(result)
        return success_response(message="Patient updated successfully", data=result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------Get Patient By Id----------------
@router.get("/{patientId}")
async def get_patient(patientId: str):
    """
    API to get a patient record by ID.
    """
    try:
        result = await get_patient_by_id_service(patientId)
        # print(result)
        return success_response(message="Patient retrieved successfully", data=result)
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# -------------Delete Patient By Id----------------
@router.delete("/{patientId}")
async def delete_patient(patientId: str):
    """
    API to delete a patient record by ID.
    """
    try:
        result = await delete_patient_service(patientId)
        return success_response(message="Patient deleted successfully", data=result)
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
