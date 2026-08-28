from typing import List, Dict, Any

class OCRDetector:
    """
    Multi-engine OCR wrapper (Tesseract / EasyOCR / Vision Models)
    for text detection and bounding box extraction from packaging.
    """
    def __init__(self, engine: str = "tesseract"):
        self.engine = engine

    def detect_text(self, image_bytes: bytes) -> List[Dict[str, Any]]:
        # Mock OCR output format
        return [
            {"text": "MRP Rs. 250.00 (Incl. of all taxes)", "confidence": 0.95, "bbox": [10, 20, 200, 40]},
            {"text": "Net Qty: 1 kg", "confidence": 0.92, "bbox": [10, 50, 150, 70]},
            {"text": "Mfg Date: 08/2026", "confidence": 0.88, "bbox": [10, 80, 160, 100]}
        ]
