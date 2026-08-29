from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.base import Base

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    product_id = Column(String(100), nullable=True)
    status = Column(String(50), nullable=False, default="PENDING")
    inspection_date = Column(DateTime, default=datetime.utcnow)
    location = Column(String(255), nullable=True)
    remarks = Column(Text, nullable=True)

    # Relationships
    employee = relationship("User", back_populates="inspections")
    evidence = relationship("InspectionEvidenceModel", back_populates="inspection", cascade="all, delete-orphan")
    compliance_results = relationship("ComplianceResult", back_populates="inspection", cascade="all, delete-orphan")
    violations = relationship("Violation", back_populates="inspection", cascade="all, delete-orphan")

class InspectionEvidenceModel(Base):
    __tablename__ = "inspection_evidence"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id", ondelete="CASCADE"), nullable=False)
    image_path = Column(String(512), nullable=False)
    evidence_type = Column(String(50), nullable=False)  # FRONT, BACK, SIDE, MRP_AREA
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    inspection = relationship("Inspection", back_populates="evidence")

class ComplianceResult(Base):
    __tablename__ = "compliance_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id", ondelete="CASCADE"), nullable=False)
    overall_status = Column(String(50), nullable=False)  # COMPLIANT, NON_COMPLIANT, WARNING
    compliance_score = Column(Float, nullable=False, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    inspection = relationship("Inspection", back_populates="compliance_results")

class Violation(Base):
    __tablename__ = "violations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id", ondelete="CASCADE"), nullable=False)
    rule_reference = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False)  # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String(50), nullable=False, default="OPEN")  # OPEN, NOTICE_ISSUED, PENALIZED, RESOLVED

    # Relationship
    inspection = relationship("Inspection", back_populates="violations")
