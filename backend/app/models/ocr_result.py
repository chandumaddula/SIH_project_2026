from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base

class OCRResult(Base):
    __tablename__ = "ocr_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    scan_image_id = Column(Integer, ForeignKey("scan_images.id", ondelete="CASCADE"), nullable=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id", ondelete="CASCADE"), nullable=True)
    extracted_text = Column(Text, nullable=True)
    bounding_boxes_json = Column(JSON, nullable=True)
    confidence_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    scan_image = relationship("ScanImage", back_populates="ocr_results")
