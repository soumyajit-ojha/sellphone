from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum


class UserRole(enum.Enum):
    BUYER = "buyer"
    SELLER = "seller"
    ADMIN = "admin"


class AddressType(enum.Enum):
    HOME = "home"
    WORK = "work"
    TEMPORARY = "temporary"


class User(BaseModel):
    __tablename__ = "users"

    first_name = Column(String(100))
    last_name = Column(String(100))
    email = Column(String(200), unique=True, index=True, nullable=True)
    phone = Column(String(50), unique=True, index=True, nullable=True)
    password = Column(String(250), nullable=False)
    user_type = Column(Enum(UserRole), default=UserRole.BUYER)
    is_active = Column(Boolean, default=True)

    # One-to-one relationship with Profile
    profile = relationship("Profile", back_populates="user", uselist=False)
    addresses = relationship("Address", back_populates="user")


class Profile(BaseModel):
    __tablename__ = "profiles"

    user_id = Column(Integer, ForeignKey("users.id"))
    gender = Column(String(50))
    profile_picture = Column(String(250), nullable=True)

    user = relationship("User", back_populates="profile")


class Address(BaseModel):
    __tablename__ = "addresses"

    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(100))  # Recipient Name
    mobile = Column(String(50))  # Recipient Mobile
    pincode = Column(String(20), nullable=False)
    locality = Column(String(200))
    address_line = Column(String(500))  # House No, Building, Street
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    landmark = Column(String(200))
    alternate_phone = Column(String(50))
    address_type = Column(Enum(AddressType), default=AddressType.HOME)

    user = relationship("User", back_populates="addresses")
