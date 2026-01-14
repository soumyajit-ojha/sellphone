from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, Profile
from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.core.security import get_hashed_password, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    _existed_user = db.query(User).filter(User.email == user_in.email).first()
    if _existed_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create User
    new_user = User(
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        email=user_in.email,
        phone=user_in.phone,
        password=get_hashed_password(user_in.password),
        user_type=user_in.user_type,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize empty profile
    profile = Profile(user_id=new_user.id)
    db.add(profile)
    db.commit()

    return new_user


@router.post("/login")
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "message": "Login successful",
        "user_id": user.id,
        "user_type": user.user_type,
    }


@router.post("/logout")
async def logout():
    """
    Since we are using simple header auth without sessions,
    logout is primarily handled by the frontend clearing the header.
    We provide this endpoint to confirm the intent.
    """
    return {"message": "Successfully logged out."}


@router.delete("/delete-account")
async def delete_account(user_id: int = Header(...), db: Session = Depends(get_db)):
    """
    Deletes the user account, linked profile, and all associated addresses.
    Requires 'user-id' in the header.
    """
    # 1. Find the user
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    try:
        # 2. Delete the user
        # (If your SQLAlchemy models have cascade="all, delete-orphan",
        # this will automatically delete Profile and Addresses)
        db.delete(user)
        db.commit()

        return {
            "message": "Account and all associated data have been deleted successfully."
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the account.",
        )
