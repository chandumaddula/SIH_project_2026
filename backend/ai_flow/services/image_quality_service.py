"""
AI Flow Image Quality Service - Assess image quality for OCR suitability.
"""
import io
from PIL import Image
import numpy as np
from typing import Dict, Any, List, Tuple

from ai_flow.schemas.result import ImageQualityResult, PackageDetectionResult


class ImageQualityAnalyzer:
    """
    Analyzes image quality for package label OCR.
    Checks resolution, blur, lighting, glare, and readability.
    """

    def __init__(self):
        """Initialize quality analyzer."""
        self.min_width = 300
        self.min_height = 300
        self.min_resolution = 100000  # 300x300 pixels

    def analyze_quality(self, image_bytes: bytes) -> Tuple[ImageQualityResult, PackageDetectionResult]:
        """
        Analyze image quality and detect package.

        Args:
            image_bytes: Raw image bytes

        Returns:
            Tuple of (ImageQualityResult, PackageDetectionResult)
        """
        defects = []
        warnings = []

        try:
            img = Image.open(io.BytesIO(image_bytes))
            width, height = img.size

            # Check resolution
            resolution_check = self._check_resolution(width, height)
            if not resolution_check['passed']:
                defects.append(resolution_check['defect'])
            resolution_score = resolution_check['score']

            # Check lighting
            lighting_check = self._check_lighting(img)
            if not lighting_check['passed']:
                defects.append(lighting_check['defect'])
                warnings.append(lighting_check['warning'])
            lighting_score = lighting_check['score']

            # Check blur
            blur_check = self._check_blur(img)
            if not blur_check['passed']:
                defects.append(blur_check['defect'])
                warnings.append(blur_check['warning'])
            blur_score = blur_check['score']

            # Check glare
            glare_check = self._check_glare(img)
            if not glare_check['passed']:
                defects.append(glare_check['defect'])
                warnings.append(glare_check['warning'])
            glare_score = glare_check['score']

            # Check visibility (contrast)
            visibility_check = self._check_visibility(img)
            if not visibility_check['passed']:
                defects.append(visibility_check['defect'])
                warnings.append(visibility_check['warning'])
            visibility_score = visibility_check['score']

            # Package detection (simple heuristic)
            package_detection = self._detect_package(img)

            # Calculate overall quality score
            scores = [resolution_score, lighting_score, blur_score, glare_score, visibility_score]
            avg_score = sum(scores) / len(scores)

            # Determine quality status
            usable = len(defects) == 0
            if avg_score >= 0.8 and len(defects) == 0:
                quality_status = "EXCELLENT"
            elif avg_score >= 0.6 and len(defects) <= 1:
                quality_status = "GOOD"
            elif avg_score >= 0.4:
                quality_status = "ACCEPTABLE"
            else:
                quality_status = "POOR"
                usable = False

            image_quality = ImageQualityResult(
                quality_status=quality_status,
                usable=usable,
                quality_score=round(avg_score, 2),
                defects=defects,
                warnings=warnings,
                dimensions={'width': width, 'height': height}
            )

            return image_quality, package_detection

        except Exception as e:
            # Return poor quality on any error
            return ImageQualityResult(
                quality_status="ERROR",
                usable=False,
                quality_score=0.0,
                defects=["CORRUPT_OR_UNREADABLE_IMAGE"],
                warnings=[str(e)],
                dimensions=None
            ), PackageDetectionResult(
                detected=False,
                confidence=0.0,
                warnings=["Could not process image"]
            )

    def _check_resolution(self, width: int, height: int) -> Dict[str, Any]:
        """Check image resolution."""
        total_pixels = width * height

        if width < self.min_width or height < self.min_height:
            return {
                'passed': False,
                'defect': 'LOW_RESOLUTION',
                'score': 0.2
            }

        if total_pixels < self.min_resolution:
            return {
                'passed': False,
                'defect': 'PACKAGE_TOO_FAR',
                'score': 0.4
            }

        # Score based on resolution
        if total_pixels >= 500000:  # ~700x700
            score = 1.0
        elif total_pixels >= 200000:  # ~450x450
            score = 0.8
        elif total_pixels >= 100000:
            score = 0.6
        else:
            score = 0.4

        return {'passed': True, 'score': score}

    def _check_lighting(self, img: Image.Image) -> Dict[str, Any]:
        """Check image lighting conditions."""
        grayscale = img.convert('L')
        pixels = np.array(list(grayscale.getdata()))

        avg_brightness = np.mean(pixels)
        std_brightness = np.std(pixels)

        # Too dark
        if avg_brightness < 40:
            return {
                'passed': False,
                'defect': 'POOR_LIGHTING_UNDEREXPOSED',
                'warning': 'Image is underexposed. Consider better lighting.',
                'score': 0.3
            }

        # Too bright
        if avg_brightness > 220:
            return {
                'passed': False,
                'defect': 'POOR_LIGHTING_OVEREXPOSED',
                'warning': 'Image is overexposed. Reduce lighting.',
                'score': 0.3
            }

        # Calculate score based on brightness and contrast
        brightness_score = 1.0 - abs(avg_brightness - 128) / 128
        contrast_score = min(std_brightness / 50, 1.0) if std_brightness > 10 else std_brightness / 10

        score = (brightness_score * 0.5 + contrast_score * 0.5)

        return {'passed': True, 'score': score}

    def _check_blur(self, img: Image.Image) -> Dict[str, Any]:
        """Check image blur using Laplacian variance."""
        try:
            from PIL import ImageFilter

            # Convert to grayscale
            gray = img.convert('L')
            gray_array = np.array(gray)

            # Apply Laplacian
            laplacian = gray_array.filter(ImageFilter.Kernel(
                size=(3, 3),
                kernel=[-1, -1, -1, -1, 8, -1, -1, -1, -1],
                scale=1
            ))

            # Calculate variance
            variance = np.var(laplacian)

            # Threshold for blur detection
            if variance < 100:
                return {
                    'passed': False,
                    'defect': 'EXCESSIVE_BLUR',
                    'warning': 'Image is blurry. Ensure camera is steady.',
                    'score': 0.3
                }

            # Score based on variance
            score = min(variance / 500, 1.0)
            return {'passed': True, 'score': score}

        except Exception:
            # Simple fallback - assume good if can't measure
            return {'passed': True, 'score': 0.8}

    def _check_glare(self, img: Image.Image) -> Dict[str, Any]:
        """Check for glare using highlight detection."""
        # Convert to numpy array
        img_array = np.array(img.convert('RGB'))

        # Check for very bright pixels (potential glare)
        bright_threshold = 250
        bright_pixels = np.sum(img_array > bright_threshold, axis=2)
        bright_ratio = np.mean(bright_pixels > 0)

        if bright_ratio > 0.5:
            return {
                'passed': False,
                'defect': 'EXCESSIVE_GLARE',
                'warning': 'Significant glare detected. Avoid direct light reflection.',
                'score': 0.2
            }

        if bright_ratio > 0.2:
            return {
                'passed': True,
                'score': 0.6,
                'warning': 'Minor glare detected.'
            }

        return {'passed': True, 'score': 1.0}

    def _check_visibility(self, img: Image.Image) -> Dict[str, Any]:
        """Check visibility using contrast ratio."""
        grayscale = img.convert('L')
        pixels = np.array(list(grayscale.getdata()))

        min_val = np.min(pixels)
        max_val = np.max(pixels)

        if max_val == 0:
            return {
                'passed': False,
                'defect': 'VERY_LOW_CONTRAST',
                'warning': 'Very low contrast in image.',
                'score': 0.3
            }

        contrast_ratio = (max_val - min_val) / 255

        if contrast_ratio < 0.2:
            return {
                'passed': False,
                'defect': 'LOW_CONTRAST',
                'warning': 'Low contrast. Text may be hard to read.',
                'score': 0.4
            }

        score = min(contrast_ratio * 2, 1.0)
        return {'passed': True, 'score': score}

    def _detect_package(self, img: Image.Image) -> PackageDetectionResult:
        """Detect if image contains a package."""
        try:
            # Simple heuristic: check if image has reasonable color variation
            # (packages typically have labels with various colors)
            img_array = np.array(img.convert('RGB'))

            # Calculate color variance
            r, g, b = img_array[:,:,0], img_array[:,:,1], img_array[:,:,2]
            color_variance = np.var(r) + np.var(g) + np.var(b)

            # Check if there's sufficient detail
            grayscale = np.array(img.convert('L'))
            edges = np.abs(np.diff(grayscale, axis=0)).mean() + \
                    np.abs(np.diff(grayscale, axis=1)).mean()
            detail_score = min(edges / 20, 1.0)

            # Combine scores
            confidence = (min(color_variance / 10000, 1.0) * 0.5 +
                         detail_score * 0.5)

            detected = confidence > 0.3

            return PackageDetectionResult(
                detected=detected,
                confidence=round(confidence, 2),
                warnings=[] if detected else ["Could not detect package in image"]
            )

        except Exception:
            return PackageDetectionResult(
                detected=False,
                confidence=0.0,
                warnings=["Could not analyze image content"]
            )


# Global analyzer instance
_image_quality_analyzer: ImageQualityAnalyzer = None


def get_image_quality_analyzer() -> ImageQualityAnalyzer:
    """Get or create global image quality analyzer."""
    global _image_quality_analyzer
    if _image_quality_analyzer is None:
        _image_quality_analyzer = ImageQualityAnalyzer()
    return _image_quality_analyzer


def analyze_image_quality(image_bytes: bytes) -> Tuple[ImageQualityResult, PackageDetectionResult]:
    """Convenience function to analyze image quality."""
    analyzer = get_image_quality_analyzer()
    return analyzer.analyze_quality(image_bytes)
