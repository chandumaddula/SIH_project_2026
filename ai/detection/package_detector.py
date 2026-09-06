"""
Lightweight, per-frame package detector for the LIVE CAMERA overlay (Part A).

This intentionally does NOT run OCR. It runs classical edge/contour analysis on a
downscaled frame so it's cheap enough to call on every camera frame (or every
~200-300ms), just to answer "is something package-shaped in view?" and unlock the
Capture button. The expensive real pipeline (ai/inference.py) only runs once, on
the captured frame — see Part A/B in the brief.
"""
from __future__ import annotations

import time

import cv2
import numpy as np

from ai.schemas.ai_result import BoundingBox, PackageDetectionResult

DOWNSCALE_WIDTH = 480
MIN_AREA_RATIO = 0.15   # package must fill at least 15% of the frame
MAX_AREA_RATIO = 0.95   # ...but not the literal entire frame (that's usually noise)
MIN_RECTANGULARITY = 0.55  # contour area / bounding-rect area — how "box-like" it is


def _downscale(frame: np.ndarray) -> tuple[np.ndarray, float]:
    h, w = frame.shape[:2]
    if w <= DOWNSCALE_WIDTH:
        return frame, 1.0
    scale = DOWNSCALE_WIDTH / float(w)
    small = cv2.resize(frame, (DOWNSCALE_WIDTH, int(h * scale)), interpolation=cv2.INTER_AREA)
    return small, scale


def detect_package_live(frame: np.ndarray) -> PackageDetectionResult:
    """Fast heuristic package detector for a single camera frame.

    Approach: edges -> dilate to close gaps -> largest external contour ->
    score it by (a) how much of the frame it covers and (b) how rectangular it
    is (contour area vs. its bounding box area). Real packages held up to a
    camera dominate the frame and are close to rectangular; background clutter
    usually isn't both at once.
    """
    small, scale = _downscale(frame)
    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 40, 120)
    edges = cv2.dilate(edges, np.ones((3, 3), np.uint8), iterations=2)

    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    frame_area = small.shape[0] * small.shape[1]

    if not contours:
        return PackageDetectionResult(detected=False, confidence=0.0, message="No package in view — center it in the frame.")

    largest = max(contours, key=cv2.contourArea)
    contour_area = cv2.contourArea(largest)
    area_ratio = contour_area / frame_area

    x, y, w, h = cv2.boundingRect(largest)
    rect_area = w * h
    rectangularity = contour_area / rect_area if rect_area > 0 else 0.0

    area_ok = MIN_AREA_RATIO <= area_ratio <= MAX_AREA_RATIO
    shape_ok = rectangularity >= MIN_RECTANGULARITY

    # Confidence blends both signals so a borderline case doesn't flip-flop
    # between frames — smoother for the UI overlay.
    confidence = round(min(1.0, (area_ratio / MAX_AREA_RATIO) * 0.5 + rectangularity * 0.5), 2)

    if area_ok and shape_ok:
        # Scale bbox back to original frame coordinates.
        bbox = BoundingBox(
            x=int(x / scale), y=int(y / scale), width=int(w / scale), height=int(h / scale)
        )
        return PackageDetectionResult(
            detected=True, confidence=confidence, bbox=bbox, message="Package detected — ready to capture."
        )

    if area_ratio < MIN_AREA_RATIO:
        message = "Move closer — package is too small in frame."
    elif area_ratio > MAX_AREA_RATIO:
        message = "Too close — step back so the whole label is visible."
    else:
        message = "Align the package inside the frame."

    return PackageDetectionResult(detected=False, confidence=confidence, message=message)


def detect_package_live_from_bytes(frame_bytes: bytes) -> PackageDetectionResult:
    """Convenience wrapper for the FastAPI endpoint, which receives raw bytes."""
    start = time.perf_counter()
    arr = np.frombuffer(frame_bytes, dtype=np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if frame is None:
        return PackageDetectionResult(detected=False, confidence=0.0, message="Could not read camera frame.")
    result = detect_package_live(frame)
    # Kept for observability/logging in the API layer if needed.
    result_time_ms = (time.perf_counter() - start) * 1000
    _ = result_time_ms
    return result
