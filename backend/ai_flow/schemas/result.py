"""
AI Flow Schemas - Data models for AI/OCR pipeline results.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class FieldConfidence(BaseModel):
    """Confidence level for extracted field."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ImageQualityResult(BaseModel):
    """Image quality assessment result."""
    quality_status: str = Field(default="UNKNOWN")
    usable: bool = Field(default=False)
    quality_score: float = Field(default=0.0)
    defects: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    dimensions: Optional[Dict[str, int]] = None


class PackageDetectionResult(BaseModel):
    """Package detection result."""
    detected: bool = Field(default=False)
    confidence: float = Field(default=0.0)
    bounding_box: Optional[List[float]] = None
    warnings: List[str] = Field(default_factory=list)
    note: Optional[str] = None


class OCRResult(BaseModel):
    """Single OCR text result with bounding box."""
    text: str
    confidence: float
    bbox: List[float]  # [x1, y1, x2, y2]


class FieldExtractionResult(BaseModel):
    """Result for a single extracted field."""
    field: str
    value: Optional[Any] = None
    confidence: float = Field(default=0.0)
    bbox: Optional[List[float]] = None
    source_text: Optional[str] = None


class ScanResponse(BaseModel):
    """Complete scan analysis response."""
    scan_id: str
    image_quality: ImageQualityResult
    package_detection: PackageDetectionResult
    ocr: List[OCRResult]
    fields: Dict[str, Dict[str, Any]]
    warnings: List[str] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)
