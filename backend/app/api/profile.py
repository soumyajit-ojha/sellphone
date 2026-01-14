from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, Profile, Address
from app.schemas.user import (
    ProfileUpdate,
    AddressCreate,
    AddressResponse,
    UserResponse,
)
from typing import List

router = APIRouter(prefix="/user", tags=["User Profile & Addresses"])


# Helper to get current user from header
def get_current_user_id(user_id: int = Header(...)):
    return user_id


@router.get("/profile", response_model=UserResponse)
async def get_profile(
    uid: int = Depends(get_current_user_id), db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/profile")
async def update_profile(
    data: ProfileUpdate,
    uid: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == uid).first()
    if data.gender:
        profile.gender = data.gender
    if data.profile_picture:
        profile.profile_picture = data.profile_picture
    db.commit()
    return {"message": "Profile updated"}


@router.post("/address", response_model=AddressResponse)
async def add_address(
    address_in: AddressCreate,
    uid: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    new_address = Address(**address_in.model_dump(), user_id=uid)
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return new_address


@router.get("/addresses", response_model=List[AddressResponse])
async def list_addresses(
    uid: int = Depends(get_current_user_id), db: Session = Depends(get_db)
):
    return db.query(Address).filter(Address.user_id == uid).all()


@router.delete("/address/{address_id}")
async def delete_address(
    address_id: int,
    uid: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    address = (
        db.query(Address)
        .filter(Address.id == address_id, Address.user_id == uid)
        .first()
    )
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    db.delete(address)
    db.commit()
    return {"message": "Address deleted"}
