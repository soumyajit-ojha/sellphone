from pydantic import BaseModel
from typing import Optional, List


class ProductBase(BaseModel):
    brand: str
    model_name: str
    price: float
    stock: int
    description: Optional[str] = None
    ram: int
    rom: int
    network_type: str
    processor: str
    battery: int
    screen_size: float


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    brand: Optional[str] = None
    model_name: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    id: int
    seller_id: Optional[int]
    image_url: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


# Used for nesting inside Cart/Wishlist
class ProductShort(BaseModel):
    id: int
    brand: str
    model_name: str
    image_url: Optional[str]
    price: float

    class Config:
        from_attributes = True


class FilterOptionsResponse(BaseModel):
    brands: List[str]
    ram_options: List[int]
    rom_options: List[int]
    network_types: List[str]
    processors: List[str]
    price_range: dict  # {"min": 0, "max": 200000}
    battery_options: List[int]
    screen_sizes: List[float]
