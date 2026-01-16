# Import the Base first
from app.db.session import Base

# Import all models here so SQLAlchemy "sees" them all at once
from app.models.user import User, Profile, Address
from app.models.products import Product
from app.models.ecommerce import Cart, CartItem, Wishlist

# This allows other files to import everything from app.models
__all__ = [
    "Base",
    "User",
    "Profile",
    "Address",
    "Product",
    "Cart",
    "CartItem",
    "Wishlist",
]
