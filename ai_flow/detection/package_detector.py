import cv2
import numpy as np
from typing import Dict, Any, Tuple, Optional


class PackageDetector:
    """
    Lightweight package/label detection for legal metrology compliance.

    This detector identifies rectangular regions that are likely package labels
    based on geometric properties, aspect ratio, and text density.

    The goal is to find the label region for focus, not complex object detection.
    """

    def __init__(self):
        # Minimum area for a valid package/label region (in pixels)
        self.min_region_area = 200 * 200

        # Preferred aspect ratio for labels (width:height)
        self.label_aspect_ratio_range = (0.3, 2.0)

        # Minimum text density threshold
        self.min_text_density = 0.01

    def detect_package_region(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Detect the package/label region in an image.

        Args:
            image_bytes: Raw image bytes

        Returns:
            Dictionary containing:
            - detected: bool - whether a package region was detected
            - confidence: float (0-1) - detection confidence
            - bounding_box: Optional[Tuple[int, int, int, int]] - (x, y, w, h)
            - roi_image: Optional[str] - base64 encoded ROI image
            - warnings: list of warning messages
        """
        try:
            # Decode image
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if img is None:
                return self._create_error_result("Failed to decode image")

            height, width = img.shape[:2]

            # Check minimum resolution
            if width < 300 or height < 300:
                return self._create_error_result(
                    f"Image too small: {width}x{height}. Minimum 300x300 required."
                )

            # Try document contour detection first (for documents/labels)
            result = self._detect_document_region(img)

            if result["detected"]:
                return result

            # Fallback to edge-based detection
            result = self._detect_by_edges(img)

            if result["detected"]:
                return result

            # If no clear label found, return the whole image as ROI
            return self._create_full_image_result(img)

        except Exception as e:
            return self._create_error_result(f"Detection failed: {str(e)}")

    def _detect_document_region(self, img: np.ndarray) -> Dict[str, Any]:
        """
        Detect document/label region using contour analysis.
        Looks for rectangular contours with text content.
        """
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Apply bilateral filter to preserve edges while reducing noise
        filtered = cv2.bilateralFilter(gray, 9, 75, 75)

        # Edge detection
        edges = cv2.Canny(filtered, 50, 150, apertureSize=3)

        # Morphological operations to close gaps
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
        closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)

        # Find contours
        contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        candidates = []

        for contour in contours:
            # Filter by area
            area = cv2.contourArea(contour)
            if area < self.min_region_area:
                continue

            # Get bounding rectangle
            x, y, w, h = cv2.boundingRect(contour)

            # Check aspect ratio
            aspect_ratio = w / h if h > 0 else 0
            if not (self.label_aspect_ratio_range[0] <= aspect_ratio <= self.label_aspect_ratio_range[1]):
                continue

            # Check if contour is approximately rectangular
            epsilon = 0.02 * cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, epsilon, True)

            if len(approx) == 4:  # Rectangular
                # Check text density in region
                roi = gray[y:y+h, x:x+w]
                text_density = self._estimate_text_density(roi)

                if text_density > self.min_text_density:
                    candidates.append({
                        "x": x,
                        "y": y,
                        "w": w,
                        "h": h,
                        "area": area,
                        "text_density": text_density,
                        "confidence": 0.8 + (text_density * 0.2)  # Higher text density = higher confidence
                    })

        if candidates:
            # Select best candidate (largest area with good text density)
            best = max(candidates, key=lambda c: c["area"])

            return {
                "detected": True,
                "confidence": min(1.0, best["confidence"]),
                "bounding_box": (best["x"], best["y"], best["w"], best["h"]),
                "warnings": []
            }

        return {"detected": False, "confidence": 0.0, "bounding_box": None, "warnings": ["No rectangular text region found"]}

    def _detect_by_edges(self, img: np.ndarray) -> Dict[str, Any]:
        """
        Fallback detection using edge lines.
        """
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Edge detection
        edges = cv2.Canny(gray, 100, 200)

        # Hough line transform
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=100,
                                 minLineLength=50, maxLineGap=10)

        if lines is None or len(lines) < 2:
            return {"detected": False, "confidence": 0.0, "bounding_box": None,
                    "warnings": ["Insufficient lines detected for edge-based region detection"]}

        # Find bounding box from lines
        x_coords = []
        y_coords = []

        for line in lines:
            x1, y1, x2, y2 = line[0]
            x_coords.extend([x1, x2])
            y_coords.extend([y1, y2])

        margin = 20
        x = max(0, min(x_coords) - margin)
        y = max(0, min(y_coords) - margin)
        w = min(img.shape[1] - x, max(x_coords) - min(x_coords) + margin * 2)
        h = min(img.shape[0] - y, max(y_coords) - min(y_coords) + margin * 2)

        # Validate box
        if w * h >= self.min_region_area:
            return {
                "detected": True,
                "confidence": 0.6,
                "bounding_box": (x, y, w, h),
                "warnings": ["Edge-based detection used - verify label region"]
            }

        return {"detected": False, "confidence": 0.0, "bounding_box": None,
                "warnings": ["Detected region too small"]}

    def _detect_by_color_contrast(self, img: np.ndarray) -> Dict[str, Any]:
        """
        Detect regions with high color contrast typical of labels.
        """
        # Convert to LAB color space
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)

        # L channel has luminance
        l_channel = lab[:, :, 0]

        # Calculate local contrast using Laplacian
        laplacian = cv2.Laplacian(l_channel, cv2.CV_64F)
        contrast = np.abs(laplacian)

        # Find high contrast regions
        _, binary = cv2.threshold(contrast.astype(np.uint8), 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # Morphological operations
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (20, 20))
        binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)

        # Find contours
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if not contours:
            return {"detected": False, "confidence": 0.0, "bounding_box": None,
                    "warnings": ["No high contrast label region detected"]}

        # Get largest contour
        largest = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest)

        return {
            "detected": True,
            "confidence": 0.5,
            "bounding_box": (x, y, w, h),
            "warnings": ["Color contrast detection used - may include false positives"]
        }

    def _estimate_text_density(self, roi: np.ndarray) -> float:
        """
        Estimate the density of text in a region.
        Higher values indicate more text/text-like structures.
        """
        if roi is None or roi.size == 0:
            return 0.0

        # Convert to grayscale if needed
        if len(roi.shape) > 2:
            gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
        else:
            gray = roi

        # Adaptive threshold
        thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)

        # Invert (text is dark, we want white pixels)
        thresh = 255 - thresh

        # Count white pixels (text pixels)
        text_pixels = np.sum(thresh > 128)
        total_pixels = thresh.size

        return text_pixels / total_pixels if total_pixels > 0 else 0.0

    def _create_error_result(self, error: str) -> Dict[str, Any]:
        """Create error result dictionary."""
        return {
            "detected": False,
            "confidence": 0.0,
            "bounding_box": None,
            "error": error,
            "warnings": [error]
        }

    def _create_full_image_result(self, img: np.ndarray) -> Dict[str, Any]:
        """Return the entire image as the ROI when no specific region is detected."""
        height, width = img.shape[:2]

        return {
            "detected": True,
            "confidence": 0.4,
            "bounding_box": (0, 0, width, height),
            "warnings": ["Full image used as label region - no specific region detected"],
            "note": "Label content may need to be manually cropped by the user"
        }

    @staticmethod
    def extract_roi(image_bytes: bytes, bbox: Tuple[int, int, int, int]) -> Optional[np.ndarray]:
        """
        Extract Region of Interest from image based on bounding box.

        Args:
            image_bytes: Raw image bytes
            bbox: Tuple of (x, y, w, h)

        Returns:
            ROI as numpy array or None if extraction fails
        """
        try:
            x, y, w, h = bbox
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if img is None:
                return None

            # Ensure bbox is within image bounds
            x = max(0, x)
            y = max(0, y)
            w = min(w, img.shape[1] - x)
            h = min(h, img.shape[0] - y)

            return img[y:y+h, x:x+w]

        except Exception:
            return None

    def get_label_bounding_boxes(self, img: np.ndarray, bbox: Tuple[int, int, int, int]) -> list:
        """
        Get bounding boxes relative to full image for the label region.

        Returns normalized bounding boxes suitable for marking up the original image.
        """
        height, width = img.shape[:2]
        x, y, w, h = bbox

        # Calculate relative positions (0-1 scale)
        return [
            {
                "x": x / width,
                "y": y / height,
                "width": w / width,
                "height": h / height,
                "source": "package_detection"
            }
        ]