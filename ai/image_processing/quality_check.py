import io
from typing import Dict, Any, List
from PIL import Image, ImageFilter
from ai.schemas.ai_result import QualityCheckResult

# Stage 6.3 Resolution Thresholds
LOW_RES_MAX_WIDTH = 640
LOW_RES_MAX_HEIGHT = 480

GOOD_RES_MIN_WIDTH = 1920
GOOD_RES_MIN_HEIGHT = 1080

def perform_image_quality_check(contents: bytes, filename: str) -> QualityCheckResult:
    defects: List[str] = []
    blur_score: float = 100.0
    brightness_status: str = "NORMAL"
    resolution_status: str = "NORMAL"

    try:
        with Image.open(io.BytesIO(contents)) as img:
            width, height = img.size

            # 1. Resolution Check
            if width < LOW_RES_MAX_WIDTH or height < LOW_RES_MAX_HEIGHT:
                defects.append("LOW_RESOLUTION")
                resolution_status = f"LOW_QUALITY_{width}x{height}"
            elif width >= GOOD_RES_MIN_WIDTH and height >= GOOD_RES_MIN_HEIGHT:
                resolution_status = f"HIGH_QUALITY_{width}x{height}"
            else:
                resolution_status = f"STANDARD_QUALITY_{width}x{height}"

            # 2. Brightness Check
            grayscale = img.convert('L')
            pixels = list(grayscale.getdata())
            total_pixels = len(pixels) if pixels else 1
            avg_brightness = sum(pixels) / total_pixels

            if avg_brightness < 30:
                defects.append("POOR_LIGHTING_UNDEREXPOSED")
                brightness_status = "TOO_DARK_WARNING"
            elif avg_brightness > 230:
                defects.append("EXCESSIVE_GLARE")
                brightness_status = "TOO_BRIGHT_WARNING"
            else:
                bright_pixels = sum(1 for p in pixels if p > 252)
                glare_ratio = bright_pixels / total_pixels
                if glare_ratio > 0.65:
                    defects.append("EXCESSIVE_GLARE")
                    brightness_status = "TOO_BRIGHT_WARNING"

            # 3. Blur Detection (Edge Gradient Variance)
            edges = grayscale.filter(ImageFilter.FIND_EDGES)
            edge_pixels = list(edges.getdata())
            edge_avg = sum(edge_pixels) / max(1, len(edge_pixels))
            blur_score = round(edge_avg, 2)

            if edge_avg < 8.0:
                defects.append("BLURRY_IMAGE")

            if width * height < 90000:
                defects.append("PACKAGE_TEXT_OBSCURED_OR_TOO_FAR")

    except Exception:
        defects.append("CORRUPT_OR_UNREADABLE_IMAGE")

    usable = len(defects) == 0
    quality_status = "GOOD" if usable else "POOR"
    base_score = 0.95 if usable else max(0.20, round(0.90 - (len(defects) * 0.25), 2))

    if usable:
        feedback = "Image quality is GOOD. Suitable for AI/OCR package label analysis."
    else:
        defect_str = ", ".join(d.replace("_", " ").title() for d in defects)
        feedback = f"LOW QUALITY ({defect_str}). Please capture the package label again."

    return QualityCheckResult(
        quality_status=quality_status,
        usable=usable,
        quality_score=base_score,
        defects=defects,
        feedback=feedback
    )
