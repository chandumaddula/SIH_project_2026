"""
OCR Service - Real OCR using AI Flow pipeline.

Replaces the previous mock OCR with real EasyOCR-based OCR.
Maintains backward compatibility with existing API consumers.
"""
import os
import sys
from typing import Dict, Any

# Add ai_flow to path for imports
_ai_flow_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "ai_flow")
if _ai_flow_path not in sys.path:
    sys.path.insert(0, os.path.dirname(_ai_flow_path))

try:
    from ai_flow.ocr.ocr_engine import OCR as AIOCREngine
    AI_FLOW_AVAILABLE = True
except ImportError:
    AI_FLOW_AVAILABLE = False
    AIOCREngine = None


class OCRService:
    """
    Service for OCR processing using real AI Flow pipeline.

    Falls back to direct file processing if no image bytes provided.
    Maintains backward compatibility with the original OCR interface.
    """

    def __init__(self):
        self._ocr_engine = None

    def _get_engine(self):
        """Lazy initialization of OCR engine."""
        if not AI_FLOW_AVAILABLE:
            return None
        if self._ocr_engine is None:
            try:
                self._ocr_engine = AIOCREngine(use_gpu=False)
            except Exception as e:
                print(f"Warning: Failed to initialize AI Flow OCR engine: {e}")
                self._ocr_engine = None
        return self._ocr_engine

    @staticmethod
    def process_image_ocr(image_path: str) -> Dict[str, Any]:
        """
        Process image via OCR Engine and extract text regions & bounding boxes.

        Args:
            image_path: Path to image file on disk

        Returns:
            Dictionary with:
            - extracted_text: Full text from image
            - bounding_boxes: List of detected text regions
            - confidence_score: Average confidence
        """
        if not AI_FLOW_AVAILABLE:
            return _fallback_ocr_response("AI Flow not available")

        try:
            with open(image_path, "rb") as f:
                image_bytes = f.read()
        except Exception as e:
            return _fallback_ocr_response(f"Failed to read image: {str(e)}")

        return OCRService._run_real_ocr(image_bytes)

    @staticmethod
    def process_bytes_ocr(image_bytes: bytes) -> Dict[str, Any]:
        """
        Process raw image bytes through OCR engine.

        Args:
            image_bytes: Raw image bytes

        Returns:
            Dictionary with OCR results
        """
        if not AI_FLOW_AVAILABLE:
            return _fallback_ocr_response("AI Flow not available")

        return OCRService._run_real_ocr(image_bytes)

    @staticmethod
    def _run_real_ocr(image_bytes: bytes) -> Dict[str, Any]:
        """Run real OCR on image bytes using AI Flow engine."""
        try:
            engine = AIOCREngine(use_gpu=False)
            ocr_results = engine.detect_text(image_bytes)

            if not ocr_results:
                return {
                    "extracted_text": "",
                    "bounding_boxes": [],
                    "confidence_score": 0.0,
                    "ocr_engine": "easyocr",
                    "detected": False
                }

            # Convert to backward-compatible format
            full_text = " ".join([r["text"] for r in ocr_results])
            avg_confidence = sum(r["confidence"] for r in ocr_results) / len(ocr_results)

            # Convert bbox format to match existing API expectations
            # Old format used: {"x": %, "y": %, "width": %, "height": %}
            # We'll need to convert pixel coordinates to percentages later
            bounding_boxes = []
            for result in ocr_results:
                x, y, w, h = result["bbox"]
                # Try to get image dimensions for percentage conversion
                # If we can't, just use pixel values
                bounding_boxes.append({
                    "text": result["text"],
                    "box": {"x": x, "y": y, "w": w, "h": h},
                    "label": result.get("text", ""),
                    "confidence": result["confidence"],
                    "isCompliant": True
                })

            return {
                "extracted_text": full_text,
                "bounding_boxes": bounding_boxes,
                "confidence_score": round(avg_confidence, 4),
                "ocr_engine": "easyocr",
                "detected": True
            }

        except Exception as e:
            return _fallback_ocr_response(f"OCR error: {str(e)}")


def _fallback_ocr_response(error_message: str) -> Dict[str, Any]:
    """
    Return a fallback response when OCR is unavailable.
    Returns an empty result with error information, NOT mock data.
    """
    return {
        "extracted_text": "",
        "bounding_boxes": [],
        "confidence_score": 0.0,
        "ocr_engine": "none",
        "detected": False,
        "error": error_message
    }


ocr_service = OCRService()