from typing import List, Dict, Any
from PIL import Image
from ai.ocr.text_detector import detect_text_regions
from ai.ocr.text_recognizer import recognize_text_characters
from ai.schemas.ai_result import OCRBoundingBox

class OCREngine:
    """Unified Multi-Engine OCR Detection & Recognition pipeline."""
    def extract_text(self, img: Image.Image) -> Dict[str, Any]:
        regions = detect_text_regions(img)
        bounding_boxes: List[OCRBoundingBox] = []
        raw_text_parts: List[str] = []

        for r in regions:
            rec = recognize_text_characters(img, r)
            bounding_boxes.append(OCRBoundingBox(
                text=rec["text"],
                box=r,
                confidence=rec["confidence"]
            ))
            raw_text_parts.append(rec["text"])

        raw_text = " | ".join(raw_text_parts)
        avg_confidence = round(sum(b.confidence for b in bounding_boxes) / max(1, len(bounding_boxes)), 2)

        return {
            "raw_text": raw_text,
            "bounding_boxes": bounding_boxes,
            "avg_confidence": avg_confidence,
            "engine": "LegalMetrology-MultiOCR-v2"
        }
