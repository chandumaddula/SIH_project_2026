import enum
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Enum
from app.database.base import Base

class UserRoleEnum(str, enum.Enum):
    CITIZEN = "citizen"
    OFFICER = "officer"
    ORGANISATION = "organisation"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(UserRoleEnum), default=UserRoleEnum.CITIZEN, nullable=False)
    department = Column(String, nullable=True)
    organisation_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
