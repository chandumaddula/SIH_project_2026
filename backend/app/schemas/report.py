from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class SummaryReportResponse(BaseModel):
    total_products: int
    total_inspections: int
    total_complaints: int
    total_violations: int
    compliant_inspections: int
    non_compliant_inspections: int
    compliance_rate_percentage: float

class InspectionReportResponse(BaseModel):
    inspection_id: int
    employee_id: Optional[str] = None
    product_id: Optional[str] = None
    status: str
    location: Optional[str] = None
    inspection_date: datetime
    compliance_score: Optional[float] = None
    violations_count: int
    violations: List[Dict[str, Any]]
