from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class QualityCheckResult(BaseModel):
    quality_status: str  # GOOD, POOR
    usable: bool
    quality_score: float  # 0.0 to 1.0
    defects: List[str] = Field(default_factory=list)
    feedback: str

class OCRBoundingBox(BaseModel):
    text: str
    box: Dict[str, int]  # {"x": int, "y": int, "w": int, "h": int}
    confidence: float

class FieldDetail(BaseModel):
    value: Optional[str] = None
    confidence: float = 1.0
    bbox: Optional[List[int]] = None  # [x, y, w, h]
    source_text: Optional[str] = None

class FieldEvidence(BaseModel):
    field: str
    value: Optional[str] = None
    confidence: float = 1.0
    bbox: Optional[List[int]] = None
    source_text: Optional[str] = None

class ParsedDeclarations(BaseModel):
    product_name: FieldDetail = Field(default_factory=FieldDetail)
    generic_name: FieldDetail = Field(default_factory=FieldDetail)
    mrp: FieldDetail = Field(default_factory=FieldDetail)
    net_quantity: FieldDetail = Field(default_factory=FieldDetail)
    manufacturer: FieldDetail = Field(default_factory=FieldDetail)
    packer: FieldDetail = Field(default_factory=FieldDetail)
    importer: FieldDetail = Field(default_factory=FieldDetail)
    address: FieldDetail = Field(default_factory=FieldDetail)
    country_of_origin: FieldDetail = Field(default_factory=FieldDetail)
    mfg_date: FieldDetail = Field(default_factory=FieldDetail)
    exp_date: FieldDetail = Field(default_factory=FieldDetail)
    batch_number: FieldDetail = Field(default_factory=FieldDetail)
    consumer_care: FieldDetail = Field(default_factory=FieldDetail)
    barcode: FieldDetail = Field(default_factory=FieldDetail)

    # Convenience properties for backward compatibility
    @property
    def productName(self) -> Optional[str]:
        return self.product_name.value

    @property
    def genericName(self) -> Optional[str]:
        return self.generic_name.value

    @property
    def netQuantity(self) -> Optional[str]:
        return self.net_quantity.value

    @property
    def consumerCare(self) -> Optional[str]:
        return self.consumer_care.value

    @property
    def mfgDate(self) -> Optional[str]:
        return self.mfg_date.value

    @property
    def expDate(self) -> Optional[str]:
        return self.exp_date.value

    @property
    def countryOfOrigin(self) -> Optional[str]:
        return self.country_of_origin.value

    @property
    def batchNumber(self) -> Optional[str]:
        return self.batch_number.value

class AIInferenceResult(BaseModel):
    scan_id: str
    image_path: str
    dimensions: Dict[str, int]
    quality: QualityCheckResult
    raw_text: str
    bounding_boxes: List[OCRBoundingBox]
    declarations: ParsedDeclarations
    field_evidences: List[FieldEvidence] = Field(default_factory=list)
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
