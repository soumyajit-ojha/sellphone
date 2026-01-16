from pydantic import BaseModel
from typing import List, Optional
from app.models.ecommerce import CartStatus
from app.schemas.product import ProductShort

# --- Cart Item Schemas ---


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemResponse(BaseModel):
    id: int
    cart_id: int
    product_id: Optional[int]
    quantity: int
    product_name_snapshot: str
    price_at_addition: float
    # Include product details if the product still exists
    product: Optional[ProductShort] = None

    class Config:
        from_attributes = True


# --- Cart Schemas ---


class CartResponse(BaseModel):
    id: int
    user_id: int
    status: CartStatus
    total_amount: float
    items: List[CartItemResponse] = []

    class Config:
        from_attributes = True


# --- Wishlist Schemas ---


class WishlistCreate(BaseModel):
    product_id: int


class WishlistResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    product: ProductShort

    class Config:
        from_attributes = True
