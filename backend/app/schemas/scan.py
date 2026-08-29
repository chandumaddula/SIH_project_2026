from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.scan import ComplianceStatusEnum, RuleSeverityEnum, ScanStatusEnum

class ScanBase(BaseModel):
    original_filename: str
    image_path: str
    file_type: str
    file_size: int
    user_id: Optional[str] = None
    status: ScanStatusEnum = ScanStatusEnum.PENDING

class ScanCreate(ScanBase):
    pass

class ScanListItem(BaseModel):
    id: int
    user_id: Optional[str] = None
    original_filename: str
    image_path: str
    file_type: str
    file_size: int
    status: ScanStatusEnum
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ScanResponse(ScanBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class BoundingBoxItem(BaseModel):
    x: float
    y: float
    width: float
    height: float
    label: str
    text: str
    confidence: float
    isCompliant: bool = True

class InspectionEvidenceBase(BaseModel):
    image_url: str
    bounding_box_json: Optional[List[Any]] = None
    extracted_text: Optional[str] = None

class InspectionEvidenceResponse(InspectionEvidenceBase):
    id: int
    session_id: str

    model_config = ConfigDict(from_attributes=True)

class RuleViolationBase(BaseModel):
    rule_id: str
    severity: RuleSeverityEnum
    description: str
    legal_reference: str

class RuleViolationResponse(RuleViolationBase):
    id: int
    session_id: str

    model_config = ConfigDict(from_attributes=True)

class InspectionSessionBase(BaseModel):
    product_name: Optional[str] = None
    category: Optional[str] = None
    officer_id: Optional[str] = None
    scan_id: Optional[int] = None

class InspectionSessionResponse(InspectionSessionBase):
    id: str
    compliance_status: ComplianceStatusEnum
    created_at: datetime
    scan: Optional[ScanResponse] = None
    evidences: List[InspectionEvidenceResponse] = []
    violations: List[RuleViolationResponse] = []

    model_config = ConfigDict(from_attributes=True)

class ScanResultResponse(BaseModel):
    scan: ScanResponse
    session: InspectionSessionResponse
    evidence: Optional[InspectionEvidenceResponse] = None
    violations: List[RuleViolationResponse] = []
