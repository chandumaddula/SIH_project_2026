"""
Automated tests for the real AI pipeline. Run with: pytest ai/tests -v

These generate synthetic label images on the fly (no fixture files to keep in
sync) so the tests double as a demonstration that nothing here is hardcoded —
change the text baked into the test image and the assertions must track it.
"""
from __future__ import annotations

import io

import cv2
import numpy as np
import pytest
from PIL import Image, ImageDraw, ImageFont

from ai.detection.package_detector import detect_package_live
from ai.extraction.date_parser import parse_packing_date
from ai.extraction.mrp_parser import parse_mrp
from ai.extraction.quantity_parser import parse_quantity
from ai.image_processing.quality_check import check_quality
from ai.inference import run_full_pipeline


def _font(size: int):
    try:
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size)
    except Exception:
        return ImageFont.load_default()


def make_label_image(lines: list[str]) -> bytes:
    img = Image.new("RGB", (900, 120 + 60 * len(lines)), "white")
    draw = ImageDraw.Draw(img)
    y = 30
    for line in lines:
        draw.text((40, y), line, fill="black", font=_font(28))
        y += 55
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=92)
    return buf.getvalue()


class TestMrpParser:
    def test_extracts_mrp_with_label(self):
        result = parse_mrp(["MRP Rs. 299.00 (incl. of all taxes)"])
        assert result.value == "₹299.00 (incl. of all taxes)"
        assert result.confidence == "high"

    def test_returns_not_found_when_absent(self):
        result = parse_mrp(["Just some random packaging text", "No price here"])
        assert result.value is None
        assert result.confidence == "not_found"


class TestQuantityParser:
    def test_extracts_labelled_quantity(self):
        result = parse_quantity(["Net Wt: 500 g"])
        assert result.value == "500 g"
        assert result.confidence == "high"

    def test_normalizes_unit_variants(self):
        result = parse_quantity(["Net Weight 1 kg"])
        assert result.value == "1 kg"


class TestDateParser:
    def test_extracts_numeric_date(self):
        result = parse_packing_date(["Mfg Date: 07/2026"])
        assert result.value == "07/2026"
        assert result.confidence == "high"

    def test_extracts_month_name_date(self):
        result = parse_packing_date(["Packed: JUL 2026"])
        assert result.value == "07/2026"


class TestQualityCheck:
    def test_flags_low_resolution(self):
        tiny = np.full((80, 80, 3), 128, dtype=np.uint8)
        report = check_quality(tiny)
        assert report.resolution_ok is False
        assert any("Resolution" in issue for issue in report.issues)

    def test_accepts_normal_sharp_image(self):
        img_bytes = make_label_image(["Sharp Test Label", "Net Wt: 1 kg", "MRP Rs. 50", "Mfg: 01/2026", "Extra line for height"])
        arr = np.frombuffer(img_bytes, dtype=np.uint8)
        image = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        report = check_quality(image)
        assert report.resolution_ok is True


class TestPackageDetectorLive:
    def test_detects_rectangle_filling_frame(self):
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.rectangle(frame, (150, 100), (490, 380), (255, 255, 255), -1)
        result = detect_package_live(frame)
        assert result.detected is True
        assert result.bbox is not None

    def test_empty_frame_not_detected(self):
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        result = detect_package_live(frame)
        assert result.detected is False


class TestFullPipeline:
    def test_end_to_end_extracts_real_values(self):
        img_bytes = make_label_image(
            [
                "Sunrise Basmati Rice",
                "Net Wt: 5 kg",
                "MRP Rs. 450.00 (incl. of all taxes)",
                "Mfg Date: 07/2026",
                "Manufactured by: Sunrise Agro Foods Pvt Ltd",
                "Consumer Care: 1800 123 4567",
                "Country of Origin: India",
            ]
        )
        result = run_full_pipeline(img_bytes, source="upload")

        assert result.mrp.value == "₹450.00 (incl. of all taxes)"
        assert result.net_quantity.value == "5 kg"
        assert result.packing_date.value == "07/2026"
        assert result.country_of_origin.value == "India"
        assert "Sunrise Agro Foods" in (result.manufacturer.value or "")
        assert result.source == "upload"
        assert result.processing_time_ms > 0

    def test_camera_and_upload_produce_identical_shape(self):
        """The requirement: camera and upload must go through exactly the same
        pipeline. We can't literally capture a camera frame in a test, but we
        can assert both `source` values produce the same result *shape* (same
        fields, same parsing) given the same bytes — proving there's no
        separate/simplified code path for one or the other."""
        img_bytes = make_label_image(["Test Product", "Net Wt: 200 g", "MRP Rs. 50"])
        upload_result = run_full_pipeline(img_bytes, source="upload")
        camera_result = run_full_pipeline(img_bytes, source="camera")

        assert upload_result.mrp.value == camera_result.mrp.value
        assert upload_result.net_quantity.value == camera_result.net_quantity.value
        assert upload_result.product_name.value == camera_result.product_name.value
        assert upload_result.source == "upload"
        assert camera_result.source == "camera"

    def test_no_hardcoded_fallback_on_blank_image(self):
        """A blank image must NOT produce a plausible-looking fake product —
        every field should legitimately come back not_found."""
        blank = np.full((600, 800, 3), 255, dtype=np.uint8)
        ok, buf = cv2.imencode(".jpg", blank)
        result = run_full_pipeline(buf.tobytes(), source="upload")

        assert result.product_name.value is None
        assert result.mrp.value is None
        assert result.net_quantity.value is None


if __name__ == "__main__":
    import sys

    sys.exit(pytest.main([__file__, "-v"]))
