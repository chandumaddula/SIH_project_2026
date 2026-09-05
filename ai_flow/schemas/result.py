from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from enum import Enum


class OCRTextItem(BaseModel):
    """Individual OCR text detection result."""
    text: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    bbox: List[int] = Field(..., min_length=4, max_length=4)
    polygon: Optional[List[List[int]]] = None

    model_config = ConfigDict(from_attributes=True)


class NetQuantity(BaseModel):
    """Parsed net quantity value."""
    value: float = Field(..., gt=0)
    unit: str = "kg"
    confidence: float = Field(..., ge=0.0, le=1.0)
    source_text: str
    bbox: List[int]

    model_config = ConfigDict(from_attributes=True)


class MRP(BaseModel):
    """Parsed MRP value."""
    value: float = Field(..., gt=0)
    currency: str = "INR"
    confidence: float = Field(..., ge=0.0, le=1.0)
    source_text: str
    bbox: List[int]

    model_config = ConfigDict(from_attributes=True)


class ExtractedField(BaseModel):
    """Single extracted field with evidence."""
    field_name: str
    value: Optional[Any] = None  # Can be string, float, int, etc.
    confidence: float = Field(..., ge=0.0, le=1.0)
    source_text: str
    bbox: List[int]
    unit: Optional[str] = None
    currency: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class PackageDetectionResult(BaseModel):
    """Result of package/label detection."""
    detected: bool
    confidence: float = Field(..., ge=0.0, le=1.0)
    bounding_box: Optional[List[int]] = None  # [x, y, w, h]
    warnings: List[str] = []
    note: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ImageQualityResult(BaseModel):
    """Image quality assessment result."""
    quality_score: float = Field(..., ge=0.0, le=1.0)
    usable: bool
    defects: List[str] = []
    dimensions: Optional[Dict[str, int]] = None
    warnings: List[str] = []

    model_config = ConfigDict(from_attributes=True)


class OCRResult(BaseModel):
    """Complete OCR results for a single image."""
    text_items: List[OCRTextItem] = []
    full_text: str = ""
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    ocr_engine: str = "easyocr"

    model_config = ConfigDict(from_attributes=True)


class ScanAIResult(BaseModel):
    """
    Complete AI pipeline result for a single scan.

    Contains all information from image quality through compliance check.
    """
    scan_id: str = ""
    timestamp: str = ""

    # Image quality
    image_quality: ImageQualityResult

    # Package detection
    package_detection: PackageDetectionResult

    # OCR results
    ocr: List[OCRTextItem] = []

    # Extracted fields
    fields: Dict[str, Any] = {}

    # Compliance result from rule engine
    compliance: Optional[Dict[str, Any]] = None

    # Metadata
    preprocessing_applied: List[str] = []
    ocr_errors: List[str] = []
    warnings: List[str] = []

    model_config = ConfigDict(from_attributes=True)


class ComplianceResult(BaseModel):
    """Compliance check result from rule engine."""
    status: str = "PENDING"  # PASS, REVIEW_REQUIRED, NON_COMPLIANT
    score: float = Field(..., ge=0.0, le=1.0)
    violations: List[Dict[str, Any]] = []
    explanation: str = ""
    confidence: float = Field(..., ge=0.0, le=1.0)
    suggested_next_step: str = ""

    model_config = ConfigDict(from_attributes=True)


class ScanResponse(BaseModel):
    """API response format for scan results."""
    scan_id: str = ""
    image_quality: ImageQualityResult = ImageQualityResult(
        quality_score=0.0, usable=False, defects=[], warnings=[]
    )
    package_detection: PackageDetectionResult = PackageDetectionResult(
        detected=False, confidence=0.0, warnings=[]
    )
    ocr: List[OCRTextItem] = []
    fields: Dict[str, Any] = {}
    compliance: Optional[ComplianceResult] = None
    status: str = "PENDING"
    warnings: List[str] = []
    errors: List[str] = []
    preprocessing_applied: List[str] = []
    ocr_errors: List[str] = []

    model_config = ConfigDict(from_attributes=True)