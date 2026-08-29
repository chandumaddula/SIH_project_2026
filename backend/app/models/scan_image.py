from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base

class ScanImage(Base):
    __tablename__ = "scan_images"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    image_path = Column(String(512), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)
    status = Column(String(50), nullable=False, default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    ocr_results = relationship("OCRResult", back_populates="scan_image", cascade="all, delete-orphan")
