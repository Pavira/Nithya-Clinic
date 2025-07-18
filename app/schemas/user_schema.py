from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class CreateUserSchema(BaseModel):
    display_name: str = Field(..., alias="display_name")
    email: EmailStr
    password: str  # Only used at creation time
    confirm_password: str
    user_role: str = Field(..., alias="user_role")
    pin: Optional[str] = Field(None)  # Optional PIN field
