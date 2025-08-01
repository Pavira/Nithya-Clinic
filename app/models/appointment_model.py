from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class AppointmentModel(BaseModel):
    PatientRegistrationNumber: str = Field(..., alias="patient_id")
    FullName: str = Field(..., alias="full_name")
    # PhoneNumber: int = Field(..., alias="phone_number")
    Department: str = Field(..., alias="consultation_category")
    AppointmentCategory: str = Field(..., alias="appointment_category")
    AppointmentInformation: str = Field(..., alias="description")
    AppointmentDateTime: datetime = Field(..., alias="appointment_datetime")
    User: str = Field(..., alias="user")

    AppointmentRegNum: str
    AppointmentNumber: int
    AppointmentStatus: str
    DoctorFees: int
    LogDateTime: datetime


class VitalsModel(BaseModel):
    Height: Optional[float] = Field(..., alias="height")
    Weight: Optional[float] = Field(..., alias="weight")
    BMI: Optional[float] = Field(..., alias="bmi")
    BP: Optional[float] = Field(..., alias="blood_pressure")
    Pulse: Optional[float] = Field(..., alias="pulse")

    def to_dict(self):
        return self.model_dump()


class UpdateAppointmentModel(BaseModel):
    ConsultationCategory: str = Field(..., alias="consultation_category")
    AppointmentCategory: str = Field(..., alias="appointment_category")
    Description: str = Field(..., alias="description")
    Height: Optional[float] = Field(0, alias="height")
    Weight: Optional[float] = Field(0, alias="weight")
    BMI: Optional[float] = Field(0, alias="bmi")
    BP: Optional[float] = Field(0, alias="blood_pressure")
    Pulse: Optional[float] = Field(0, alias="pulse")
    History: Optional[str] = Field("", alias="history")
    ClinicalFeature: Optional[str] = Field("", alias="clinical_feature")
    Investigation: Optional[str] = Field("", alias="investigation")
    Diagnosis: Optional[str] = Field("", alias="diagnosis")
    DoctorFees: float = Field(..., alias="doctor_fees")
    ReviewDate: Optional[datetime] = Field(None, alias="review_datetime")
    Prescription: Optional[list] = Field(default_factory=list, alias="allPrescriptions")
    # ImageURLs: Optional[list] = Field(default_factory=list, alias="images")
    # MedPrescImages: Optional[list] = Field(
    #     default_factory=list, alias="prescription_images"
    # )
    NoOfImages: Optional[int] = Field(0, alias="noOfImages")
    NoOfMedImages: Optional[int] = Field(0, alias="noOfPrescriptions")

    AppointmentStatus: str

    def to_dict(self):
        return self.model_dump()

    class Config:
        populate_by_name = True  # allow access by Python aliases
        allow_population_by_field_name = True  # allows dict(by_alias=True) to work
