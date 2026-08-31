from typing import Optional, List, Any, Dict
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class InspectionCreate(BaseModel):
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    officer_id: Optional[str] = None
    remarks: Optional[str] = None

GuidedInspectionStart = InspectionCreate

class InspectionResponse(BaseModel):
    id: int
    employee_id: Optional[str] = None
    product_id: Optional[str] = None
    status: str
    inspection_date: datetime
    location: Optional[str] = None
    remarks: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class InspectionEvidenceResponse(BaseModel):
    id: int
    session_id: str
    image_url: str
    extracted_text: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class RuleViolationResponse(BaseModel):
    id: int
    session_id: str
    rule_id: str
    severity: str
    description: str
    legal_reference: str

    model_config = ConfigDict(from_attributes=True)

class ExtractedInfoSchema(BaseModel):
    product_name: Optional[str] = None
    generic_name: Optional[str] = None
    mrp: Optional[str] = None
    net_quantity: Optional[str] = None
    manufacturer: Optional[str] = None
    packer: Optional[str] = None
    importer: Optional[str] = None
    address: Optional[str] = None
    country_of_origin: Optional[str] = None
    mfg_date: Optional[str] = None
    exp_date: Optional[str] = None
    batch_number: Optional[str] = None
    consumer_care: Optional[str] = None

class ReadabilityAnalysisSchema(BaseModel):
    overall_score: float
    font_height_mm: float
    contrast_ratio: float
    is_legible: bool
    warnings: List[str] = []

class EvidenceItemSchema(BaseModel):
    id: str
    image_url: str
    label: str
    bounding_box: Optional[Dict[str, float]] = None
    extracted_text: Optional[str] = None

class OfficerVerificationSchema(BaseModel):
    inspection_id: str
    officer_notes: str
    override_status: Optional[str] = None
    digital_signature: Optional[str] = None

class InspectionWorkflowState(BaseModel):
    id: Any
    session_id: str
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    officer_id: Optional[str] = None
    status: str
    step: str
    extracted: Optional[ExtractedInfoSchema] = None
    readability: Optional[ReadabilityAnalysisSchema] = None
    evidences: List[EvidenceItemSchema] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
