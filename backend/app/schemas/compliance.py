from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict

class ComplianceCheckRequest(BaseModel):
    inspection_id: Optional[int] = None
    product_name: Optional[str] = None
    mrp_present: bool = True
    net_quantity_present: bool = True
    manufacturer_present: bool = True
    consumer_care_present: bool = True
    extracted_declarations: Optional[Dict[str, Any]] = None
    context: Optional[Dict[str, Any]] = None
    scan_id: Optional[str] = None

class OfficerReviewRequest(BaseModel):
    decision: str  # APPROVED, NOTICE_ISSUED, REJECTED
    remarks: Optional[str] = None
    officer_id: Optional[str] = None

class ViolationResponse(BaseModel):
    id: int
    inspection_id: int
    rule_reference: str
    description: str
    severity: str
    status: str

    model_config = ConfigDict(from_attributes=True)

class ComplianceCheckResponse(BaseModel):
    overall_status: str
    compliance_score: float
    violations: List[dict]
    summary: Optional[Dict[str, Any]] = None
    checks: Optional[List[Dict[str, Any]]] = None
    report: Optional[Dict[str, Any]] = None
