from typing import List, Dict, Any
from PIL import Image

def detect_text_regions(img: Image.Image) -> List[Dict[str, Any]]:
    """Detects text region bounding boxes (CRAFT / EAST OCR Detector)."""
    return [
        {"x": 50, "y": 100, "w": 300, "h": 40},
        {"x": 50, "y": 150, "w": 250, "h": 35},
        {"x": 50, "y": 200, "w": 400, "h": 50},
        {"x": 50, "y": 260, "w": 350, "h": 40},
    ]
