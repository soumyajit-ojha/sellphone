from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.products import Product
from app.models.user import User
from app.schemas.product import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
    FilterOptionsResponse,
)
from app.api.deps import get_current_seller
from app.services.s3_service import upload_image_to_s3  # Assuming s3 service exists
from typing import List, Optional

router = APIRouter()


@router.get("/filter-options", response_model=FilterOptionsResponse)
async def get_filter_options(db: Session = Depends(get_db)):
    """
    Returns unique values for all filters based on existing products
    to dynamically populate the frontend sidebar.
    """

    # Helper to get distinct sorted lists
    def get_distinct(column):
        results = db.query(column).filter(Product.is_active == True).distinct().all()
        return sorted([r[0] for r in results if r[0] is not None])

    # Get Price Range
    min_price = db.query(func.min(Product.price)).scalar() or 0
    max_price = db.query(func.max(Product.price)).scalar() or 100000

    return {
        "brands": get_distinct(Product.brand),
        "ram_options": get_distinct(Product.ram),
        "rom_options": get_distinct(Product.rom),
        "network_types": get_distinct(Product.network_type),
        "processors": get_distinct(Product.processor),
        "battery_options": get_distinct(Product.battery),
        "screen_sizes": get_distinct(Product.screen_size),
        "price_range": {"min": int(min_price), "max": int(max_price)},
    }


@router.get("/search", response_model=List[ProductResponse])
async def search_mobiles(
    brand: Optional[List[str]] = Query(None),
    ram: Optional[List[int]] = Query(None),
    rom: Optional[List[int]] = Query(None),
    network: Optional[List[str]] = Query(None),
    processor: Optional[List[str]] = Query(None),
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_battery: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """
    The main search/filter engine. Supports multi-select for categories
    and ranges for price/battery.
    """
    query = db.query(Product).filter(Product.is_active == True)

    if brand:
        query = query.filter(Product.brand.in_(brand))
    if ram:
        query = query.filter(Product.ram.in_(ram))
    if rom:
        query = query.filter(Product.rom.in_(rom))
    if network:
        query = query.filter(Product.network_type.in_(network))
    if processor:
        query = query.filter(Product.processor.in_(processor))

    # Range Filters
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if min_battery is not None:
        query = query.filter(Product.battery >= min_battery)

    # Ordering: Show newest products first
    query = query.order_by(Product.created_at.desc())

    return query.all()


@router.post("/add", response_model=ProductResponse)
async def add_mobile(
    brand: str = Form(...),
    model_name: str = Form(...),
    price: float = Form(...),
    stock: int = Form(...),
    ram: int = Form(...),
    rom: int = Form(...),
    network_type: str = Form(...),
    processor: str = Form(...),
    battery: int = Form(...),
    screen_size: float = Form(...),
    image: UploadFile = File(...),
    seller: User = Depends(get_current_seller),
    db: Session = Depends(get_db),
):
    # 1. Upload image to S3
    image_url = await upload_image_to_s3(image)

    # 2. Create Product
    new_product = Product(
        seller_id=seller.id,
        brand=brand,
        model_name=model_name,
        price=price,
        stock=stock,
        ram=ram,
        rom=rom,
        network_type=network_type,
        processor=processor,
        battery=battery,
        screen_size=screen_size,
        image_url=image_url,
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


@router.get("/my-inventory", response_model=List[ProductResponse])
async def get_seller_inventory(
    seller: User = Depends(get_current_seller), db: Session = Depends(get_db)
):
    # Sellers can see even their inactive (soft-deleted) products
    return db.query(Product).filter(Product.seller_id == seller.id).all()


@router.put("/update/{product_id}", response_model=ProductResponse)
async def update_mobile(
    product_id: int,
    brand: Optional[str] = Form(None),
    model_name: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None),  # Optional new image
    seller: User = Depends(get_current_seller),
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id, Product.seller_id == seller.id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # If a new image is provided
    if image:
        # 1. Delete old image from S3 if it exists
        if product.image_url:
            await delete_image_from_s3(product.image_url)

        # 2. Upload new image
        product.image_url = await upload_image_to_s3(image)

    # Update other fields
    if brand:
        product.brand = brand
    if model_name:
        product.model_name = model_name
    if price:
        product.price = price

    db.commit()
    db.refresh(product)
    return product


@router.delete("/delete/{product_id}")
async def soft_delete_mobile(
    product_id: int,
    seller: User = Depends(get_current_seller),
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id, Product.seller_id == seller.id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # SOFT DELETE: keep the data, just deactivate it
    product.is_active = False
    db.commit()
    return {"message": "Product deactivated successfully"}


@router.delete("/hard-delete/{product_id}")
async def hard_delete_mobile(
    product_id: int,
    seller: User = Depends(get_current_seller),
    db: Session = Depends(get_db),
):
    """Actual deletion from DB and S3."""
    product = (
        db.query(Product)
        .filter(Product.id == product_id, Product.seller_id == seller.id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # 1. Delete from S3
    if product.image_url:
        await delete_image_from_s3(product.image_url)

    # 2. Delete from DB
    db.delete(product)
    db.commit()
    return {"message": "Product and image deleted permanently"}
