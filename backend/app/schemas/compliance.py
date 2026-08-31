from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class ComplianceCheckRequest(BaseModel):
    inspection_id: Optional[int] = None
    product_name: Optional[str] = None
    mrp_present: bool = True
    net_quantity_present: bool = True
    manufacturer_present: bool = True
    consumer_care_present: bool = True

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
