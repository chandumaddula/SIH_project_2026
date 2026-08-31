import enum
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database.base import Base

class UserRoleEnum(str, enum.Enum):
    CITIZEN = "CITIZEN"
    EMPLOYEE = "EMPLOYEE"
    OFFICER = "OFFICER"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String(20), default=UserRoleEnum.CITIZEN.value, nullable=False)
    department = Column(String, nullable=True)
    organisation_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    scans = relationship("Scan", back_populates="user", cascade="all, delete-orphan")
    complaints = relationship("Complaint", back_populates="citizen", cascade="all, delete-orphan")
    inspections = relationship("Inspection", back_populates="employee", cascade="all, delete-orphan")

    @property
    def name(self) -> str:
        return self.full_name
