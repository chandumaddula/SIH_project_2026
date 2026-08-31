from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ComplaintCreate(BaseModel):
    product_id: Optional[str] = None
    description: str

class ComplaintResponse(BaseModel):
    id: int
    citizen_id: str
    product_id: Optional[str] = None
    description: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ComplaintCreateSchema(BaseModel):
    product_name: Optional[str] = None
    product_id: Optional[str] = None
    issue_type: str
    description: str
    location: Optional[str] = None
    evidence_urls: List[str] = []

class ComplaintStatusUpdateSchema(BaseModel):
    status: str  # 'NEW' | 'UNDER_REVIEW' | 'INSPECTION_ASSIGNED' | 'RESOLVED' | 'REJECTED'
    officer_notes: Optional[str] = None
    assigned_officer_id: Optional[str] = None

class ComplaintResponseSchema(BaseModel):
    id: str
    citizen_id: str
    product_name: Optional[str] = None
    issue_type: str
    description: str
    location: Optional[str] = None
    priority: str
    status: str
    evidence_count: int = 0
    submitted_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
