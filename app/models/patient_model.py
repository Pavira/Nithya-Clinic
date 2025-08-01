from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import datetime, timezone


class PatientCreateModel(BaseModel):

    FullName: str = Field(..., alias="full_name")

    @field_validator("FullName", mode="before")
    @classmethod
    def uppercase_fullname(cls, v):
        return v.upper() if isinstance(v, str) else v

    PhoneNumber: int = Field(..., alias="phone_number")
    AlternatePhoneNumber: Optional[int] = Field(
        0,
        alias="alt_phone_number",
    )
    DOB: datetime = Field(..., alias="dob")
    Age: int = Field(..., alias="age")
    Gender: str = Field(..., alias="gender")
    MaritialStatus: str = Field(..., alias="marital_status")
    Address: Optional[str] = Field(None, alias="address")
    EmailAddress: Optional[str] = Field(None, alias="email")
    Profession: Optional[str] = Field(None, alias="profession")
    GuardianName: Optional[str] = Field(None, alias="guardian")
    AadharNumber: Optional[int] = Field(None, alias="aadhar")
    PatientType: Optional[str] = Field(None, alias="treatment_type")
    PurposeOfVisit: Optional[str] = Field(None, alias="purpose_of_visit")
    ReferredBy: Optional[str] = Field(None, alias="referred_by")

    PatientRegistrationNumber: Optional[str] = Field(
        default=None, description="System-generated unique patient ID"
    )
    LogDateTime: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp of when the record was logged (UTC)",
    )
    User: Optional[str] = Field(None, alias="user")  # Who created this patient

    def to_dict(self):
        return self.model_dump()


class PatientUpdateModel(BaseModel):

    FullName: str = Field(..., alias="full_name")

    @field_validator("FullName", mode="before")
    @classmethod
    def uppercase_fullname(cls, v):
        return v.upper() if isinstance(v, str) else v

    PhoneNumber: int = Field(..., alias="phone_number")
    AlternatePhoneNumber: Optional[int] = Field(
        0,
        alias="alt_phone_number",
    )
    DOB: datetime = Field(..., alias="dob")
    Age: int = Field(..., alias="age")
    Gender: str = Field(..., alias="gender")
    MaritialStatus: str = Field(..., alias="marital_status")
    Address: Optional[str] = Field(None, alias="address")
    EmailAddress: Optional[str] = Field(None, alias="email")
    Profession: Optional[str] = Field(None, alias="profession")
    GuardianName: Optional[str] = Field(None, alias="guardian")
    AadharNumber: Optional[int] = Field(None, alias="aadhar")
    PatientType: Optional[str] = Field(None, alias="treatment_type")
    PurposeOfVisit: Optional[str] = Field(None, alias="purpose_of_visit")
    ReferredBy: Optional[str] = Field(None, alias="referred_by")

    # ModifiedDateTime: datetime = Field(
    #     default_factory=lambda: datetime.now(timezone.utc),
    #     description="Timestamp of when the record was Updated (UTC)",
    # )
    # ModifiedUser: Optional[str] = None  # Who created this patient

    def to_dict(self):
        return self.model_dump()
