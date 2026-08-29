from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.base import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    citizen_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(100), nullable=True)
    description = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    citizen = relationship("User", back_populates="complaints")
    evidence = relationship("ComplaintEvidence", back_populates="complaint", cascade="all, delete-orphan")

class ComplaintEvidence(Base):
    __tablename__ = "complaint_evidence"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False)
    image_path = Column(String(512), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    complaint = relationship("Complaint", back_populates="evidence")
