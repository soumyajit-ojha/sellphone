from pydantic import BaseModel
from typing import Optional, List
from app.models.user import UserRole, AddressType


# Address Schemas
class AddressBase(BaseModel):
    name: str
    mobile: str
    pincode: str
    locality: str
    address_line: str
    city: str
    state: str
    landmark: Optional[str] = None
    alternate_phone: Optional[str] = None
    address_type: AddressType = AddressType.HOME


class AddressCreate(AddressBase):
    pass


class AddressResponse(AddressBase):
    id: int

    class Config:
        from_attributes = True


# Profile Schemas
class ProfileResponse(BaseModel):
    gender: Optional[str]
    profile_picture: Optional[str]

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    gender: Optional[str] = None
    profile_picture: Optional[str] = None


# User Schemas
class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    password: str
    user_type: UserRole = UserRole.BUYER


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone: str
    user_type: UserRole
    is_active: bool
    profile: Optional[ProfileResponse]

    class Config:
        from_attributes = True
