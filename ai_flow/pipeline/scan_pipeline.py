import cv2
import numpy as np
from typing import Dict, Any, List, Optional
from datetime import datetime
import io

from ..preprocessing.image_preprocessor import ImagePreprocessor
from ..preprocessing.utils import validate_image_quality
from ..detection.package_detector import PackageDetector
from ..ocr.ocr_engine import OCR, get_ocr_instance
from ..extraction.field_extractor import FieldExtractor, ExtractedField
from ..schemas.result import (
    OCRTextItem,
    ImageQualityResult,
    PackageDetectionResult,
    ScanResponse,
    ComplianceResult
)


class AIFieldExtractionPipeline:
    """
    Complete AI pipeline for legal metrology compliance scanning.

    Pipeline stages:
    1. Image Quality Check - validate image is suitable for processing
    2. Preprocessing - enhance image for better OCR
    3. Package Detection - identify package/label region
    4. Real OCR - extract text with bounding boxes
    5. Field Extraction - parse legal metrology fields
    6. Evidence Mapping - preserve all evidence with bboxes

    The pipeline is designed to be testable at each stage.
    """

    def __init__(self, use_gpu: bool = False):
        """
        Initialize the AI pipeline.

        Args:
            use_gpu: Whether to use GPU for OCR (requires CUDA)
        """
        self.use_gpu = use_gpu
        self._preprocessor = ImagePreprocessor()
        self._detector = PackageDetector()
        self._ocr: Optional[OCR] = None
        self._extractor = FieldExtractor()

    def _get_ocr(self) -> OCR:
        """Lazy initialization of OCR engine."""
        if self._ocr is None:
            self._ocr = OCR(use_gpu=self.use_gpu)
        return self._ocr

    def _merge_text_lines(self, ocr_dicts: List[Dict[str, Any]], line_threshold: int = 25) -> List[Dict[str, Any]]:
        """
        Merge OCR text items that are on the same line.
        This handles fragmented OCR where text like "Net Quantity:" and "1 kg"
        appear on separate lines but should be treated as one field.
        """
        if not ocr_dicts:
            return ocr_dicts

        # Sort by y position (top to bottom), then x position (left to right)
        sorted_items = sorted(ocr_dicts, key=lambda r: (r["bbox"][1], r["bbox"][0]))

        merged = []
        current_line = [sorted_items[0]]

        for i in range(1, len(sorted_items)):
            prev_item = current_line[-1]
            curr_item = sorted_items[i]
            prev_y = prev_item["bbox"][1]
            prev_h = prev_item["bbox"][3]
            curr_y = curr_item["bbox"][1]

            # Check if current item is on the same line as the previous
            # Same line = y positions overlap by at least 50%
            prev_bottom = prev_y + prev_h
            same_line = (
                abs(curr_y - prev_y) <= line_threshold or
                (prev_y <= curr_y <= prev_bottom) or
                (prev_y <= curr_y + curr_item["bbox"][3] <= prev_bottom)
            )

            if same_line:
                # Merge with current line
                current_line.append(curr_item)
            else:
                # Finalize current line
                merged.append(self._merge_line_items(current_line))
                current_line = [curr_item]

        # Don't forget the last line
        if current_line:
            merged.append(self._merge_line_items(current_line))

        return merged

    def _merge_line_items(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Merge multiple OCR items on the same line into one item."""
        if len(items) == 1:
            return items[0]

        # Sort by x position
        items = sorted(items, key=lambda r: r["bbox"][0])

        # Combine text with space
        combined_text = " ".join(item["text"] for item in items)

        # Average confidence
        avg_conf = sum(item["confidence"] for item in items) / len(items)

        # Combined bbox (union of all bboxes)
        min_x = min(item["bbox"][0] for item in items)
        min_y = min(item["bbox"][1] for item in items)
        max_x = max(item["bbox"][0] + item["bbox"][2] for item in items)
        max_y = max(item["bbox"][1] + item["bbox"][3] for item in items)

        return {
            "text": combined_text,
            "confidence": round(avg_conf, 4),
            "bbox": [min_x, min_y, max_x - min_x, max_y - min_y]
        }

    def process_image(self, image_bytes: bytes, scan_id: str = "") -> ScanResponse:
        """
        Process an image through the complete AI pipeline.

        Args:
            image_bytes: Raw image bytes from camera/upload
            scan_id: Optional scan identifier

        Returns:
            ScanResponse containing all extracted information
        """
        start_time = datetime.now()
        response = ScanResponse(scan_id=scan_id)

        # ============================================================
        # STAGE 1: Image Quality Check
        # ============================================================
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if img is None:
                response.errors.append("Invalid image format - could not decode image")
                return response

            # Quick quality check without preprocessing
            quality_check = validate_image_quality(img)
            response.image_quality = ImageQualityResult(
                quality_score=quality_check["quality_score"],
                usable=quality_check["usable"],
                defects=quality_check["defects"],
                dimensions={"width": quality_check["width"], "height": quality_check["height"]},
                warnings=quality_check["defects"]
            )

            if not quality_check["usable"]:
                response.warnings.append(
                    f"Image quality issues detected: {', '.join(quality_check['defects'])}"
                )
                # Continue processing but mark for review

        except Exception as e:
            response.errors.append(f"Image quality check failed: {str(e)}")
            return response

        # ============================================================
        # STAGE 2: Preprocessing
        # ============================================================
        preprocessing_steps = []
        processed_bytes = image_bytes

        try:
            # Use preprocessor for full preprocessing
            preprocess_result = self._preprocessor.validate_and_preprocess(image_bytes)

            if preprocess_result.get("error"):
                response.warnings.append(f"Preprocessing warning: {preprocess_result['error']}")
            else:
                if preprocess_result.get("processed_image"):
                    processed_bytes = preprocess_result["processed_image"]
                    preprocessing_steps.append("quality_enhancement")

                if preprocess_result.get("orientation") != "normal":
                    preprocessing_steps.append(f"rotation_{preprocess_result['orientation']}")

                if abs(preprocess_result.get("deskew_angle", 0)) > 1:
                    preprocessing_steps.append(f"deskew_{preprocess_result['deskew_angle']:.1f}deg")

                response.preprocessing_applied = preprocessing_steps

        except Exception as e:
            response.warnings.append(f"Preprocessing failed: {str(e)} - using original image")

        # ============================================================
        # STAGE 3: Package Detection
        # ============================================================
        try:
            detection_result = self._detector.detect_package_region(processed_bytes)
            response.package_detection = PackageDetectionResult(
                detected=detection_result.get("detected", False),
                confidence=detection_result.get("confidence", 0.0),
                bounding_box=detection_result.get("bounding_box"),
                warnings=detection_result.get("warnings", []),
                note=detection_result.get("note")
            )

        except Exception as e:
            response.warnings.append(f"Package detection failed: {str(e)}")
            response.package_detection = PackageDetectionResult(
                detected=False, confidence=0.0, warnings=[str(e)]
            )

        # ============================================================
        # STAGE 4: Real OCR
        # ============================================================
        ocr_items: List[OCRTextItem] = []

        try:
            ocr_engine = self._get_ocr()
            ocr_results = ocr_engine.detect_text(processed_bytes)

            if not ocr_results:
                response.warnings.append("No text detected in image")

            # Convert to OCRTextItem objects
            for result in ocr_results:
                ocr_items.append(OCRTextItem(
                    text=result["text"],
                    confidence=result["confidence"],
                    bbox=result["bbox"],
                    polygon=result.get("polygon")
                ))

            response.ocr = ocr_items

        except Exception as e:
            response.errors.append(f"OCR processing failed: {str(e)}")
            response.ocr = []

        # ============================================================
        # STAGE 5: Field Extraction
        # ============================================================
        extracted_fields: Dict[str, Any] = {}

        try:
            if ocr_items:
                # Convert OCRTextItem back to dict format for extractor
                ocr_dicts = [
                    {"text": item.text, "confidence": item.confidence, "bbox": item.bbox}
                    for item in ocr_items
                ]

                # Merge text on the same line to handle fragmented OCR (e.g. "Net Quantity:" + "1 kg")
                merged_ocr_dicts = self._merge_text_lines(ocr_dicts)

                fields = self._extractor.extract_from_ocr(merged_ocr_dicts)

                # Convert to serializable format
                extracted_fields = self._extractor.to_serializable_dict(fields)
                response.fields = extracted_fields

        except Exception as e:
            response.errors.append(f"Field extraction failed: {str(e)}")

        # ============================================================
        # STAGE 6: Evidence Mapping
        # ============================================================
        # Evidence is already preserved in the field extraction results
        # Each field includes: value, confidence, source_text, bbox

        # ============================================================
        # Calculate Overall Confidence
        # ============================================================
        overall_confidence = self._calculate_overall_confidence(response, extracted_fields)
        response.warnings.extend(response.preprocessing_applied)

        # ============================================================
        # Processing Summary
        # ============================================================
        processing_time = (datetime.now() - start_time).total_seconds()

        return response

    def _calculate_overall_confidence(self, response: ScanResponse,
                                      fields: Dict[str, Any]) -> float:
        """Calculate overall pipeline confidence."""
        confidences = []

        # Image quality contributes
        if response.image_quality.quality_score > 0:
            confidences.append(response.image_quality.quality_score * 0.15)

        # Package detection contributes
        if response.package_detection.detected:
            confidences.append(response.package_detection.confidence * 0.1)

        # OCR confidence contributes
        if response.ocr:
            avg_ocr_conf = sum(item.confidence for item in response.ocr) / len(response.ocr)
            confidences.append(avg_ocr_conf * 0.35)

        # Field extraction contributes
        if fields:
            field_confs = [
                f.get("confidence", 0) for f in fields.values()
                if f.get("confidence", 0) > 0
            ]
            if field_confs:
                avg_field_conf = sum(field_confs) / len(field_confs)
                confidences.append(avg_field_conf * 0.4)

        return sum(confidences) if confidences else 0.0

    def quick_ocr(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Quick OCR without full pipeline - for testing/debugging.

        Args:
            image_bytes: Raw image bytes

        Returns:
            Dictionary with OCR results
        """
        try:
            ocr_engine = self._get_ocr()
            results = ocr_engine.detect_text(image_bytes)

            return {
                "success": True,
                "text_items": results,
                "full_text": " ".join([r["text"] for r in results]),
                "count": len(results)
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "text_items": [],
                "full_text": "",
                "count": 0
            }


class PipelineStage:
    """
    Represents a single stage in the processing pipeline.
    Can be used for individual testing/debugging.
    """

    def __init__(self, name: str, func, inputs: List[str], outputs: List[str]):
        self.name = name
        self.func = func
        self.inputs = inputs
        self.outputs = outputs

    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Run this stage with the given context."""
        try:
            args = {key: context[key] for key in self.inputs if key in context}
            result = self.func(**args)
            for key in self.outputs:
                if key in result:
                    context[key] = result[key]
            context[f"{self.name}_success"] = True
            context[f"{self.name}_error"] = None
        except Exception as e:
            context[f"{self.name}_success"] = False
            context[f"{self.name}_error"] = str(e)
        return context


# Convenience function for quick testing
def run_pipeline(image_bytes: bytes, scan_id: str = "", use_gpu: bool = False) -> ScanResponse:
    """
    Run the complete AI pipeline on an image.

    Args:
        image_bytes: Raw image bytes
        scan_id: Optional scan identifier
        use_gpu: Whether to use GPU acceleration

    Returns:
        ScanResponse with all results
    """
    pipeline = AIFieldExtractionPipeline(use_gpu=use_gpu)
    return pipeline.process_image(image_bytes, scan_id)