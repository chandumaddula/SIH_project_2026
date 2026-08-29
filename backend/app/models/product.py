from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Text
from app.database.base import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_name = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False)
    brand_name = Column(String(255), nullable=True)
    mrp = Column(Float, nullable=True)
    net_quantity = Column(String(100), nullable=True)
    manufacturer_name = Column(String(255), nullable=True)
    manufacturer_address = Column(Text, nullable=True)
    consumer_care = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
