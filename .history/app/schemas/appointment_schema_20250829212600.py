from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class AppointmentSchema(BaseModel):
    patient_id: str
    full_name: str
    # phone_number: int
    consultation_category: str
    appointment_category: str
    description: Optional[str] = ""
    appointment_datetime: str
    user: str


class VitalsSchema(BaseModel):
    height: Optional[float] = 0
    weight: Optional[float] = 0
    bmi: Optional[float] = 0
    blood_pressure: Optional[str] = ""
    pulse: Optional[float] = 0

    def to_dict(self):
        return self.model_dump()


class UpdateAppointmentSchema(BaseModel):
    consultation_category: str
    appointment_category: str
    description: Optional[str] = ""
    height: Optional[float] = 0
    weight: Optional[float] = 0
    bmi: Optional[float] = 0
    blood_pressure: Optional[str] = ""
    pulse: Optional[float] = 0
    history: Optional[str] = ""
    clinical_feature: Optional[str] = ""
    investigation: Optional[str] = ""
    diagnosis: Optional[str] = ""
    doctor_fees: float
    review_datetime: Optional[datetime] = None
    allPrescriptions: Optional[list] = []
    noOfImages: Optional[int] = 0
    noOfPrescriptions: Optional[int] = 0

    def to_dict(self):
        return self.model_dump()
