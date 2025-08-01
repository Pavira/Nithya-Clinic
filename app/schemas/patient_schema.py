from pydantic import BaseModel
from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import date


class PatientCreateSchema(BaseModel):
    full_name: str
    phone_number: int
    alt_phone_number: Optional[int] = 0
    dob: date
    age: int
    gender: str
    marital_status: str
    address: Optional[str] = None
    email: Optional[str] = None
    profession: Optional[str] = None
    guardian: Optional[str] = None
    aadhar: Optional[int] = 0
    treatment_type: Optional[str] = None
    purpose_of_visit: Optional[str] = None
    referred_by: Optional[str] = None
    user: Optional[str] = None  # Who created this patient

    def to_dict(self):
        return self.model_dump()
