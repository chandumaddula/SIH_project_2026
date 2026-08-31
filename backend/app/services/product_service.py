from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.product import Product
from app.schemas.product import ProductCreate

def create_product(db: Session, payload: ProductCreate) -> Product:
    product = Product(
        product_name=payload.product_name,
        category=payload.category,
        brand_name=payload.brand_name,
        mrp=payload.mrp,
        net_quantity=payload.net_quantity,
        manufacturer_name=payload.manufacturer_name,
        manufacturer_address=payload.manufacturer_address,
        consumer_care=payload.consumer_care,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

def list_products(db: Session, category: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Product]:
    query = db.query(Product)
    if category:
        query = query.filter(Product.category == category)
    return query.offset(skip).limit(limit).all()

def get_product_by_id(db: Session, product_id: int) -> Optional[Product]:
    return db.query(Product).filter(Product.id == product_id).first()
