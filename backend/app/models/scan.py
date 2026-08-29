import enum
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base

class ScanStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class ComplianceStatusEnum(str, enum.Enum):
    COMPLIANT = "COMPLIANT"
    NON_COMPLIANT = "NON_COMPLIANT"
    WARNING = "WARNING"
    PENDING = "PENDING"

class RuleSeverityEnum(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(64), nullable=True)
    image_path = Column(String(512), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)
    status = Column(String(50), nullable=False, default=ScanStatusEnum.PENDING.value)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    sessions = relationship("InspectionSession", back_populates="scan")

class InspectionSession(Base):
    __tablename__ = "inspection_sessions"

    id = Column(String(64), primary_key=True, index=True)
    officer_id = Column(String(64), ForeignKey("inspection_officers.id", ondelete="SET NULL"), nullable=True)
    scan_id = Column(Integer, ForeignKey("scans.id", ondelete="CASCADE"), nullable=True)
    product_name = Column(String(255), nullable=True)
    category = Column(String(100), nullable=True)
    compliance_status = Column(String(50), nullable=False, default=ComplianceStatusEnum.PENDING.value)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    scan = relationship("Scan", back_populates="sessions")
    evidences = relationship("InspectionEvidence", back_populates="session", cascade="all, delete-orphan")
    violations = relationship("RuleViolation", back_populates="session", cascade="all, delete-orphan")

class InspectionEvidence(Base):
    __tablename__ = "inspection_evidences"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String(64), ForeignKey("inspection_sessions.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(Text, nullable=False)
    bounding_box_json = Column(JSON, nullable=True)
    extracted_text = Column(Text, nullable=True)

    # Relationship
    session = relationship("InspectionSession", back_populates="evidences")

class RuleViolation(Base):
    __tablename__ = "rule_violations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String(64), ForeignKey("inspection_sessions.id", ondelete="CASCADE"), nullable=False)
    rule_id = Column(String(100), nullable=False)
    severity = Column(String(20), nullable=False)
    description = Column(Text, nullable=False)
    legal_reference = Column(String(255), nullable=False)

    # Relationship
    session = relationship("InspectionSession", back_populates="violations")

class InspectionOfficer(Base):
    __tablename__ = "inspection_officers"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    badge_number = Column(String(100), unique=True, nullable=False)
    jurisdiction = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
