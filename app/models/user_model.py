from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class CreateUserModel(BaseModel):
    uid: str
    display_name: str = Field(..., alias="display_name")
    email: EmailStr
    user_role: str = Field(..., alias="user_role")
    PIN: Optional[str] = Field(..., alias="pin")
    created_time: datetime
    last_login: Optional[datetime] = None

    def to_dict(self):
        return self.model_dump(by_alias=True)
