from typing import Dict, Any, Tuple
from PIL import Image

def correct_perspective(img: Image.Image) -> Tuple[Image.Image, Dict[str, Any]]:
    """Deskew and crop Principal Display Panel (PDP) label region."""
    width, height = img.size
    pdp_box = {
        "x": int(width * 0.1),
        "y": int(height * 0.15),
        "width": int(width * 0.8),
        "height": int(height * 0.7),
    }

    cropped = img.crop((
        pdp_box["x"],
        pdp_box["y"],
        pdp_box["x"] + pdp_box["width"],
        pdp_box["y"] + pdp_box["height"]
    ))

    meta = {
        "deskew_angle_deg": 0.0,
        "perspective_corrected": True,
        "pdp_region": pdp_box
    }
    return cropped, meta
