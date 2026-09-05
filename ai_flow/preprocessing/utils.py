import cv2
import numpy as np
from typing import Dict, Any, List


def validate_image_quality(img: np.ndarray) -> Dict[str, Any]:
    """
    Validate image quality for OCR processing.

    Checks:
    - Minimum resolution
    - Lighting (too dark / too bright)
    - Excessive glare
    - Overall readability

    Returns:
        Dictionary with:
        - usable: bool - whether image is suitable for OCR
        - quality_score: float (0-1)
        - defects: list of detected defect strings
        - width: int - image width
        - height: int - image height
    """
    height, width = img.shape[:2]
    defects = []

    # 1. Resolution check
    min_area = 300 * 300  # 90000 pixels minimum
    if width * height < min_area:
        defects.append("LOW_RESOLUTION")
        usable = False
    else:
        usable = True

    # 2. Lighting check
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    pixels = gray.astype(np.float32)
    total = pixels.size

    # Handle empty edge case
    if total == 0:
        return {
            "usable": False,
            "quality_score": 0.0,
            "defects": ["EMPTY_IMAGE"],
            "width": width,
            "height": height
        }

    avg_brightness = np.mean(pixels)

    # Underexposed (too dark)
    if avg_brightness < 20:
        defects.append("POOR_LIGHTING_UNDEREXPOSED")

    # Overexposed (too bright / blown out)
    bright_pixels = np.sum(gray > 252)
    glare_ratio = bright_pixels / total if total > 0 else 0

    if glare_ratio > 0.65:
        defects.append("EXCESSIVE_GLARE")

    # 3. Overall quality score
    base_score = 0.95 if usable else 0.20
    penalty = len(defects) * 0.15
    quality_score = max(0.0, min(1.0, base_score - penalty))

    return {
        "usable": usable and len(defects) == 0,
        "quality_score": quality_score,
        "defects": defects,
        "width": width,
        "height": height
    }


def preprocess_image(img_gray: np.ndarray, clip_limit: float = 2.0, tile_grid_size: Tuple[int, int] = (8, 8)) -> np.ndarray:
    """
    Preprocess a grayscale image for OCR.

    Pipeline:
    1. Denoising (Non-local Means Denoising)
    2. Adaptive histogram equalization (CLAHE)
    3. Thresholding (Otsu's method)

    Args:
        img_gray: Grayscale image as numpy array
        clip_limit: CLAHE clip limit for contrast enhancement
        tile_grid_size: CLAHE tile grid size

    Returns:
        Preprocessed binary image optimized for OCR
    """
    if img_gray is None:
        raise ValueError("Input image is None")

    # Ensure grayscale
    if len(img_gray.shape) > 2:
        img_gray = cv2.cvtColor(img_gray, cv2.COLOR_BGR2GRAY)

    # 1. Denoise using Non-local Means Denoising
    # h parameter controls strength of denoising
    denoised = cv2.fastNlMeansDenoising(img_gray, h=10)

    # 2. Apply CLAHE for local contrast enhancement
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
    enhanced = clahe.apply(denoised)

    # 3. Threshold using Otsu's method for binary image
    # Gaussian blur first to reduce noise effect on threshold
    blurred = cv2.GaussianBlur(enhanced, (3, 3), 0)
    _, binary = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # 4. Morphological operations to clean up
    kernel = np.ones((2, 2), np.uint8)
    cleaned = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, kernel)

    return cleaned


def detect_orientation(img: np.ndarray) -> str:
    """
    Detect the orientation of an image.

    Returns one of:
    - "normal" (0 degrees)
    - "right" (90 degrees clockwise)
    - "left" (90 degrees counter-clockwise)
    - "upside_down" (180 degrees)
    """
    height, width = img.shape[:2]

    if width > height:
        # Landscape - likely rotated
        # Check how much
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150, apertureSize=3)

        # Hough Line Transform to detect dominant lines
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=50,
                               minLineLength=min(width, height) // 4,
                               maxLineGap=min(width, height) // 10)

        if lines is not None and len(lines) > 0:
            angles = []
            for line in lines:
                x1, y1, x2, y2 = line[0]
                angle = np.abs(np.arctan2(y2 - y1, x2 - x1) * 180 / np.pi)
                angles.append(angle)

            if angles:
                # Find the median angle
                median_angle = np.median(angles)

                # Determine rotation based on angle
                # If median angle is closer to 90 or 270, rotate
                if 60 <= median_angle <= 120:
                    return "upside_down"
                elif -30 <= median_angle <= 30:
                    # Check if landscape is actually landscape or rotated portrait
                    return "normal"
                elif 30 < median_angle < 60 or -60 < median_angle < -30:
                    return "right" if median_angle > 0 else "left"

        return "normal"
    else:
        # Portrait orientation, likely normal
        return "normal"