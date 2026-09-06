"""
AI Flow Scan Pipeline - Complete package scanning and analysis pipeline.

This pipeline:
1. Analyzes image quality
2. Detects package in image
3. Extracts text using OCR
4. Extracts Legal Metrology fields
5. Performs compliance checking
"""
import io
from typing import List, Optional, Dict, Any
from PIL import Image
import numpy as np

from ai_flow.schemas.result import (
    ScanResponse,
    ImageQualityResult,
    PackageDetectionResult,
    OCRResult,
)
from ai_flow.services.ocr_service import get_ocr_engine, OCREngine
from ai_flow.services.field_extraction_service import get_field_extractor, FieldExtractor
from ai_flow.services.image_quality_service import get_image_quality_analyzer, ImageQualityAnalyzer


class PipelineStage:
    """Pipeline stage enumeration."""
    IMAGE_QUALITY = "image_quality"
    PACKAGE_DETECTION = "package_detection"
    OCR = "ocr"
    FIELD_EXTRACTION = "field_extraction"
    COMPLETE = "complete"


class ScanPipeline:
    """
    Complete scan pipeline for package label analysis.

    Processes images through multiple stages:
    1. Image Quality Assessment
    2. Package Detection
    3. OCR Text Extraction
    4. Field Extraction
    5. Compliance Analysis
    """

    def __init__(
        self,
        ocr_engine: Optional[OCREngine] = None,
        field_extractor: Optional[FieldExtractor] = None,
        quality_analyzer: Optional[ImageQualityAnalyzer] = None
    ):
        """
        Initialize scan pipeline.

        Args:
            ocr_engine: Optional OCR engine instance
            field_extractor: Optional field extractor instance
            quality_analyzer: Optional quality analyzer instance
        """
        self.ocr_engine = ocr_engine or get_ocr_engine()
        self.field_extractor = field_extractor or get_field_extractor()
        self.quality_analyzer = quality_analyzer or get_image_quality_analyzer()

    def process(self, image_bytes: bytes, scan_id: str) -> ScanResponse:
        """
        Process a package image through the complete pipeline.

        Args:
            image_bytes: Raw image bytes
            scan_id: Unique scan identifier

        Returns:
            ScanResponse with all extracted data
        """
        warnings = []
        errors = []

        # Stage 1: Image Quality Analysis
        try:
            image_quality, package_detection = self.quality_analyzer.analyze_quality(image_bytes)

            if not image_quality.usable:
                warnings.append(f"Image quality issue: {', '.join(image_quality.defects)}")
        except Exception as e:
            errors.append(f"Image quality analysis failed: {str(e)}")
            image_quality = ImageQualityResult(
                quality_status="ERROR",
                usable=False,
                quality_score=0.0,
                defects=["PROCESSING_ERROR"]
            )
            package_detection = PackageDetectionResult(
                detected=False,
                confidence=0.0,
                warnings=["Could not analyze image"]
            )

        # Stage 2: Package Detection
        if not package_detection.detected and image_quality.usable:
            warnings.append("Package may not be clearly visible in the image")

        # Stage 3: OCR Text Extraction
        try:
            ocr_results = self.ocr_engine.extract_text(image_bytes)

            if not ocr_results:
                warnings.append("No text detected in image")

        except Exception as e:
            errors.append(f"OCR extraction failed: {str(e)}")
            ocr_results = []

        # Build raw text
        raw_text = " ".join([r.text for r in ocr_results])

        # Stage 4: Field Extraction
        try:
            extracted_fields = self.field_extractor.extract_fields(ocr_results, raw_text)
        except Exception as e:
            errors.append(f"Field extraction failed: {str(e)}")
            extracted_fields = {}

        return ScanResponse(
            scan_id=scan_id,
            image_quality=image_quality,
            package_detection=package_detection,
            ocr=ocr_results,
            fields=extracted_fields,
            warnings=warnings,
            errors=errors
        )


# Global pipeline instance
_pipeline: Optional[ScanPipeline] = None


def get_pipeline() -> ScanPipeline:
    """Get or create global pipeline instance."""
    global _pipeline
    if _pipeline is None:
        _pipeline = ScanPipeline()
    return _pipeline


def run_pipeline(image_bytes: bytes, scan_id: str = "") -> ScanResponse:
    """
    Run the complete scan pipeline.

    Args:
        image_bytes: Raw image bytes
        scan_id: Unique scan identifier

    Returns:
        ScanResponse with all extracted data
    """
    if not scan_id:
        import uuid
        scan_id = f"SCAN-{uuid.uuid4().hex[:8]}"

    pipeline = get_pipeline()
    return pipeline.process(image_bytes, scan_id)


# Also expose as run_pipeline for backward compatibility
def run_scan_pipeline(image_bytes: bytes, scan_id: str = "") -> ScanResponse:
    """Alias for run_pipeline for backward compatibility."""
    return run_pipeline(image_bytes, scan_id)
