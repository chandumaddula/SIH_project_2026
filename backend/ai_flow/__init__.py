"""
AI Flow - Package for AI/OCR based package label analysis.

This package provides:
- Image quality assessment
- OCR text extraction
- Field extraction for Legal Metrology declarations
- Compliance checking for packaged commodities

Usage:
    from ai_flow.pipeline.scan_pipeline import run_pipeline

    result = run_pipeline(image_bytes, scan_id="SCAN-001")
    print(result.extracted_fields)
"""
from .schemas import (
    ScanResponse,
    ImageQualityResult,
    PackageDetectionResult,
    OCRResult,
    FieldExtractionResult,
)
from .pipeline import run_pipeline, ScanPipeline
from .services import (
    get_ocr_engine,
    extract_text_from_image,
    get_field_extractor,
    extract_fields,
    get_image_quality_analyzer,
    analyze_image_quality,
)

__version__ = "1.0.0"

__all__ = [
    # Schemas
    'ScanResponse',
    'ImageQualityResult',
    'PackageDetectionResult',
    'OCRResult',
    'FieldExtractionResult',
    # Pipeline
    'run_pipeline',
    'ScanPipeline',
    # Services
    'get_ocr_engine',
    'extract_text_from_image',
    'get_field_extractor',
    'extract_fields',
    'get_image_quality_analyzer',
    'analyze_image_quality',
]
