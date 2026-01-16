from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.ecommerce import Cart, CartItem, Wishlist, CartStatus
from app.models.products import Product
from app.models.user import User
from app.api.deps import get_current_user
from app.schemas.ecommerce import (
    CartResponse,
    CartItemCreate,
    CartItemUpdate,
    WishlistResponse,
)
from typing import List

router = APIRouter(prefix="/shop", tags=["Ecommerce"])

# --- WISHLIST LOGIC (Toggle functionality) ---


@router.post("/wishlist/toggle/{product_id}")
async def toggle_wishlist(
    product_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Check if product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if already in wishlist
    wish_item = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user.id, Wishlist.product_id == product_id)
        .first()
    )

    if wish_item:
        db.delete(wish_item)
        db.commit()
        return {"message": "Removed from wishlist", "is_wishlisted": False}
    else:
        new_wish = Wishlist(user_id=user.id, product_id=product_id)
        db.add(new_wish)
        db.commit()
        return {"message": "Added to wishlist", "is_wishlisted": True}


@router.get("/wishlist", response_model=List[WishlistResponse])
async def get_my_wishlist(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return db.query(Wishlist).filter(Wishlist.user_id == user.id).all()


# --- CART LOGIC ---


@router.post("/cart/add", response_model=CartResponse)
async def add_to_cart(
    item_in: CartItemCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == item_in.product_id).first()
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not available")

    # 1. Get or Create active cart
    cart = (
        db.query(Cart)
        .filter(Cart.user_id == user.id, Cart.status == CartStatus.CURRENT)
        .first()
    )

    if not cart:
        cart = Cart(user_id=user.id, status=CartStatus.CURRENT)
        db.add(cart)
        db.flush()  # Get cart ID before continuing

    # 2. Check if product already in cart
    cart_item = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id, CartItem.product_id == product.id)
        .first()
    )

    if cart_item:
        cart_item.quantity += item_in.quantity
    else:
        # Create new item with SNAPSHOTS
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=product.id,
            quantity=item_in.quantity,
            product_name_snapshot=product.model_name,
            price_at_addition=product.price,
        )
        db.add(cart_item)

    db.commit()
    db.refresh(cart)
    return cart


@router.get("/cart", response_model=CartResponse)
async def get_my_cart(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    cart = (
        db.query(Cart)
        .filter(Cart.user_id == user.id, Cart.status == CartStatus.CURRENT)
        .first()
    )
    if not cart:
        # Return empty cart structure
        return {
            "user_id": user.id,
            "status": CartStatus.CURRENT,
            "total_amount": 0,
            "items": [],
        }
    return cart


@router.delete("/cart/item/{item_id}")
async def remove_from_cart(
    item_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    # Security: Ensure item belongs to the user's current cart
    item = (
        db.query(CartItem)
        .join(Cart)
        .filter(
            CartItem.id == item_id,
            Cart.user_id == user.id,
            Cart.status == CartStatus.CURRENT,
        )
        .first()
    )

    if not item:
        raise HTTPException(status_code=404, detail="Item not found in your cart")

    db.delete(item)
    db.commit()
    return {"message": "Item removed from cart"}
