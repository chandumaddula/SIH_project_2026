from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ProductCreate(BaseModel):
    product_name: str
    category: str
    brand_name: Optional[str] = None
    mrp: Optional[float] = None
    net_quantity: Optional[str] = None
    manufacturer_name: Optional[str] = None
    manufacturer_address: Optional[str] = None
    consumer_care: Optional[str] = None

class ProductResponse(ProductCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ProductListItem(BaseModel):
    id: int
    product_name: str
    category: str
    mrp: Optional[float] = None
    manufacturer_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

