import io
from typing import Dict, Any, Tuple
from PIL import Image, ImageEnhance, ImageFilter

def preprocess_image(contents: bytes, target_size: Tuple[int, int] = (800, 800)) -> Tuple[Image.Image, Dict[str, Any]]:
    with Image.open(io.BytesIO(contents)) as raw_img:
        img = raw_img.convert('RGB')
        orig_width, orig_height = img.size

        # Resize maintaining ratio
        img.thumbnail(target_size, Image.Resampling.LANCZOS)
        width, height = img.size

        # Denoise & Contrast Enhancement
        denoised = img.filter(ImageFilter.SMOOTH_MORE)
        enhanced = ImageEnhance.Contrast(denoised).enhance(1.25)
        brightened = ImageEnhance.Brightness(enhanced).enhance(1.05)

        meta = {
            "original_dimensions": {"width": orig_width, "height": orig_height},
            "processed_dimensions": {"width": width, "height": height},
            "contrast_enhancement": 1.25,
            "denoised": True
        }
        return brightened, meta
