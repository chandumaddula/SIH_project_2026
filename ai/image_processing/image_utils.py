import io
from typing import Dict, Any
from PIL import Image

def load_image_bytes(contents: bytes) -> Image.Image:
    return Image.open(io.BytesIO(contents)).convert('RGB')

def crop_bounding_box(img: Image.Image, box: Dict[str, int]) -> Image.Image:
    x, y, w, h = box["x"], box["y"], box["w"], box["h"]
    return img.crop((x, y, x + w, y + h))
