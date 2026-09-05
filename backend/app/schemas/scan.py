from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.scan import ComplianceStatusEnum, RuleSeverityEnum, ScanStatusEnum
from app.schemas.inspection import InspectionEvidenceResponse, RuleViolationResponse

PreliminaryResultType = str  # 'no_issue' | 'review_recommended' | 'potential_issue'

class ImageQualityCheckResponse(BaseModel):
    quality_status: str  # 'GOOD' | 'POOR'
    usable: bool
    quality_score: float
    defects: List[str] = []
    feedback: str

class ScanUploadResponse(BaseModel):
    scan_id: str
    status: str = "uploaded"
    message: Optional[str] = "Image uploaded and stored successfully."
    file_path: Optional[str] = None
    quality: Optional[ImageQualityCheckResponse] = None

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

class DetectedInfoSchema(BaseModel):
    productName: Optional[str] = None
    genericName: Optional[str] = None
    mrp: Optional[str] = None
    netQuantity: Optional[str] = None
    manufacturer: Optional[str] = None
    packer: Optional[str] = None
    importer: Optional[str] = None
    address: Optional[str] = None
    countryOfOrigin: Optional[str] = None
    mfgDate: Optional[str] = None
    expDate: Optional[str] = None
    batchNumber: Optional[str] = None
    consumerCare: Optional[str] = None
    barcode: Optional[str] = None

class ScreeningResultSchema(BaseModel):
    # All fields optional so legacy/incomplete DB rows can still be returned.
    # The API layer fills missing fields with honest "not available" values
    # (no invented product data, no fake confidence).
    result: Optional[PreliminaryResultType] = None
    explanation: Optional[str] = None
    confidence: Optional[float] = None
    flags: List[str] = []
    suggestedNextStep: Optional[str] = None

class OCRBoxSchema(BaseModel):
    """OCR bounding box from AI pipeline."""
    text: str
    box: Dict[str, int]  # {x, y, w, h}
    confidence: float
    ocr_engine: Optional[str] = "easyocr"


class ViolationSchema(BaseModel):
    """Rule violation from legal metrology engine."""
    rule_id: str
    severity: str
    description: str
    legal_reference: Optional[str] = None


class LabelRegionSchema(BaseModel):
    """Detected label region."""
    x: int
    y: int
    width: int
    height: int


class CitizenScanResponse(BaseModel):
    id: Any
    scan_id: Optional[str] = None
    original_filename: Optional[str] = None
    image_path: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    user_id: Optional[str] = None
    status: Optional[str] = None
    citizenId: Optional[str] = None
    images: List[str] = []
    quality: Optional[ImageQualityCheckResponse] = None
    detected: Optional[DetectedInfoSchema] = None
    screening: Optional[ScreeningResultSchema] = None
    ocrBoxes: List[Dict[str, Any]] = []  # Real OCR bounding boxes from AI pipeline
    violations: List[Dict[str, Any]] = []  # Real rule violations
    labelRegion: Optional[Dict[str, int]] = None  # Detected label region
    createdAt: Optional[str] = None
