from datetime import datetime, timezone
from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class SeverityLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"

class FindingStatus(str, Enum):
    PASS = "PASS"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    POTENTIAL_VIOLATION = "POTENTIAL_VIOLATION"
    EXEMPTED = "EXEMPTED"
    NOT_APPLICABLE = "NOT_APPLICABLE"

class RequirementType(str, Enum):
    PRESENCE = "presence"
    FORMAT = "format"
    STANDARD_UNIT = "standard_unit"
    FONT_SIZE = "font_size"
    PLACEMENT = "placement"
    EXEMPTION = "exemption"
    CONSISTENCY = "consistency"

# Nested Rule Schema (WP 7.2 Specification)
class RuleIdentification(BaseModel):
    rule_id: str
    rule_reference: str
    version: str = "1.0"
    active: bool = True

class RuleApplicability(BaseModel):
    commodity: str = "all"  # all, food, cosmetics, medical, agricultural, general
    package_type: str = "all"  # all, single_piece, multi_piece, combination, group, wholesale
    exemptions: List[str] = Field(default_factory=list)

class RuleValidation(BaseModel):
    field: str
    condition: str
    validation_type: str
    validation_method: str
    parameters: Optional[Dict[str, Any]] = None

class RuleResult(BaseModel):
    severity: SeverityLevel
    evidence_required: List[str] = Field(default_factory=list)
    description: str

class RuleDefinition(BaseModel):
    identification: RuleIdentification
    applicability: RuleApplicability
    validation: RuleValidation
    result: RuleResult
    category: str = "general"

    @property
    def rule_id(self) -> str:
        return self.identification.rule_id

    @property
    def rule_reference(self) -> str:
        return self.identification.rule_reference

    @property
    def version(self) -> str:
        return self.identification.version

    @property
    def active(self) -> bool:
        return self.identification.active

    @property
    def field(self) -> str:
        return self.validation.field

    @property
    def validation_method(self) -> str:
        return self.validation.validation_method

    @property
    def severity(self) -> SeverityLevel:
        return self.result.severity

    @property
    def description(self) -> str:
        return self.result.description

class ProductContext(BaseModel):
    product_name: Optional[str] = None
    category: Optional[str] = "GENERAL"
    package_type: Optional[str] = "SINGLE_PIECE"
    pdp_area_sq_cm: Optional[float] = 100.0
    net_quantity_value: Optional[float] = None
    net_quantity_unit: Optional[str] = None
    is_imported: bool = False
    is_ecommerce: bool = False
    consumer_type: str = "RETAIL"
    package_weight_g: Optional[float] = None
    package_volume_ml: Optional[float] = None

class FindingEvidence(BaseModel):
    image_path: Optional[str] = None
    bounding_box: Optional[Any] = None
    highlighted_region: Optional[Dict[str, Any]] = None
    ocr_raw_snippet: Optional[str] = None

class ComplianceFinding(BaseModel):
    finding_id: str
    rule_id: str
    rule_reference: str
    category: str
    field: str
    status: FindingStatus
    severity: SeverityLevel
    message: str
    extracted_value: Optional[Any] = None
    expected_requirement: str
    legal_clause: str
    confidence_score: float = 1.0
    evidence: Optional[FindingEvidence] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    officer_decision: str = "PENDING_REVIEW"
    remediation_guidance: Optional[str] = None

class ComplianceSummary(BaseModel):
    total_checks: int
    passed: int
    review_required: int
    potential_violations: int
    exempted: int = 0

class IndividualCheck(BaseModel):
    field: str
    rule_id: str
    status: FindingStatus
    confidence: float
    message: str
    extracted_value: Optional[Any] = None
    legal_clause: str
    evidence: Optional[FindingEvidence] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    officer_decision: str = "PENDING_REVIEW"

class ComplianceReport(BaseModel):
    scan_id: Optional[str] = None
    timestamp: str
    overall_status: FindingStatus
    compliance_score: float
    summary: ComplianceSummary
    checks: List[IndividualCheck]
    findings: List[ComplianceFinding]
    audit_trail: List[Dict[str, Any]]
    exemptions_applied: List[str]
