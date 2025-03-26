from typing import List, Optional
from pydantic import BaseModel, EmailStr, validator, constr
from datetime import datetime


# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    region_name: Optional[str] = None
    alert_threshold: Optional[float] = 0.7
    email_alerts: Optional[bool] = True
    sms_alerts: Optional[bool] = False
    phone_number: Optional[str] = None


# Properties to receive via API on creation
class UserCreate(UserBase):
    email: EmailStr
    username: str
    password: str

    @validator('alert_threshold')
    def validate_threshold(cls, v):
        if v is not None and (v < 0 or v > 1):
            raise ValueError('Threshold must be between 0 and 1')
        return v


# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None


class UserInDBBase(UserBase):
    id: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True


# Additional properties to return via API
class User(UserInDBBase):
    pass


# Additional properties stored in DB
class UserInDB(UserInDBBase):
    hashed_password: str 