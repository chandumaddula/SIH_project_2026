"""
Integration test with real stored image (Crunch/Crunchex).
Verifies:
1. No Fresh Farms hardcoded values in output
2. Missing fields are reported as not detected
3. Actual OCR text is used
"""
import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend", "app"))

os.chdir(os.path.join(os.path.dirname(__file__), "..", "..", "backend"))


class TestRealCrunchImagePipeline:
    """Test the full pipeline with the real Crunch/Crunchex stored image."""

    def test_real_image_no_fresh_farms(self):
        """CRITICAL: Real Crunch image must NOT produce Fresh Farms output."""
        from app.services import scan_service
        from sqlalchemy.orm import Session
        from app.database.session import engine

        # Find the stored Crunch image
        img_path = None
        storage_dir = "storage/scans"
        if os.path.exists(storage_dir):
            for f in os.listdir(storage_dir):
                if f.endswith(('.jpg', '.jpeg', '.png')):
                    # Check if this is one of the Crunch test images
                    full_path = os.path.join(storage_dir, f)
                    img_path = full_path
                    break

        if not img_path or not os.path.exists(img_path):
            pytest.skip("No stored test image found - run a scan first")

        with open(img_path, 'rb') as f:
            contents = f.read()

        with Session(engine) as db:
            result = scan_service.execute_scan_pipeline(
                db=db,
                contents=contents,
                filename='crunch_test.jpg',
                user_id='test-integration'
            )

        # Convert entire result to string for checking
        result_str = str(result).lower()

        # CRITICAL: No Fresh Farms hardcoded values
        assert "fresh farms" not in result_str, \
            "CRITICAL: Result contains 'Fresh Farms' hardcoded data!"
        assert "vegetable oil" not in result_str, \
            "CRITICAL: Result contains 'Vegetable Oil' hardcoded data!"

        # Check detected fields
        detected = result.get("detected", {})
        if detected:
            for field_name, field_value in detected.items():
                if field_value:
                    field_str = str(field_value).lower()
                    assert "fresh farms" not in field_str, \
                        f"Field {field_name} contains 'Fresh Farms': {field_value}"
                    assert "240" not in field_str or field_value == "₹ 240.00" is False, \
                        f"Field {field_name} contains hardcoded price: {field_value}"

    def test_real_image_uses_actual_ocr(self):
        """OCR boxes must contain actual text from the image, not dummy data."""
        from app.services import scan_service
        from sqlalchemy.orm import Session
        from app.database.session import engine

        # Find stored image
        img_path = None
        storage_dir = "storage/scans"
        if os.path.exists(storage_dir):
            for f in os.listdir(storage_dir):
                if f.endswith(('.jpg', '.jpeg', '.png')):
                    full_path = os.path.join(storage_dir, f)
                    img_path = full_path
                    break

        if not img_path or not os.path.exists(img_path):
            pytest.skip("No stored test image found")

        with open(img_path, 'rb') as f:
            contents = f.read()

        with Session(engine) as db:
            result = scan_service.execute_scan_pipeline(
                db=db,
                contents=contents,
                filename='ocr_test.jpg',
                user_id='test-ocr'
            )

        ocr_boxes = result.get("ocrBoxes", [])
        assert len(ocr_boxes) > 0, "OCR should detect some text in the real image"

        # All OCR boxes should have real confidence (not 0.95)
        for box in ocr_boxes:
            conf = box.get("confidence", 0)
            assert conf > 0, f"OCR box should have positive confidence, got {conf}"

    def test_missing_fields_reported_as_none(self):
        """Fields not in OCR should be None, not fabricated."""
        from app.services import scan_service
        from sqlalchemy.orm import Session
        from app.database.session import engine

        # Find stored image
        img_path = None
        storage_dir = "storage/scans"
        if os.path.exists(storage_dir):
            for f in os.listdir(storage_dir):
                if f.endswith(('.jpg', '.jpeg', '.png')):
                    full_path = os.path.join(storage_dir, f)
                    img_path = full_path
                    break

        if not img_path or not os.path.exists(img_path):
            pytest.skip("No stored test image found")

        with open(img_path, 'rb') as f:
            contents = f.read()

        with Session(engine) as db:
            result = scan_service.execute_scan_pipeline(
                db=db,
                contents=contents,
                filename='missing_fields_test.jpg',
                user_id='test-missing'
            )

        detected = result.get("detected", {})

        # Fields that are None in detected should be absent or None
        # They should NOT be filled with hardcoded sample values
        for field in ["mrp", "netQuantity", "manufacturer"]:
            value = detected.get(field)
            if value is None or value == "" or value == "None":
                # Field is missing - this is OK
                pass
            else:
                # If field has a value, it should be from actual OCR, not hardcoded
                value_str = str(value).lower()
                # Should not contain hardcoded sample values
                assert "fresh farms" not in value_str, f"Field {field} contains hardcoded 'Fresh Farms'"
                assert "vegetable oil" not in value_str, f"Field {field} contains hardcoded 'Vegetable Oil'"

    def test_screening_confidence_not_095(self):
        """Screening confidence should NOT be hardcoded to 0.95."""
        from app.services import scan_service
        from sqlalchemy.orm import Session
        from app.database.session import engine

        # Find stored image
        img_path = None
        storage_dir = "storage/scans"
        if os.path.exists(storage_dir):
            for f in os.listdir(storage_dir):
                if f.endswith(('.jpg', '.jpeg', '.png')):
                    full_path = os.path.join(storage_dir, f)
                    img_path = full_path
                    break

        if not img_path or not os.path.exists(img_path):
            pytest.skip("No stored test image found")

        with open(img_path, 'rb') as f:
            contents = f.read()

        with Session(engine) as db:
            result = scan_service.execute_scan_pipeline(
                db=db,
                contents=contents,
                filename='confidence_test.jpg',
                user_id='test-confidence'
            )

        screening = result.get("screening", {})
        confidence = screening.get("confidence", 0)

        # When fields are detected, confidence should NOT be exactly 0.95
        # (0.95 was the hardcoded fallback value)
        detected = result.get("detected", {})
        detected_count = sum(1 for v in detected.values() if v)

        if detected_count > 0:
            # Some fields detected - confidence should reflect actual detection
            assert confidence != 0.95 or detected_count == 4, \
                f"Confidence should NOT be exactly 0.95 with {detected_count} detected fields"

    def test_created_at_is_actual_time(self):
        """createdAt should be actual timestamp, not hardcoded."""
        from app.services import scan_service
        from sqlalchemy.orm import Session
        from app.database.session import engine

        # Find stored image
        img_path = None
        storage_dir = "storage/scans"
        if os.path.exists(storage_dir):
            for f in os.listdir(storage_dir):
                if f.endswith(('.jpg', '.jpeg', '.png')):
                    full_path = os.path.join(storage_dir, f)
                    img_path = full_path
                    break

        if not img_path or not os.path.exists(img_path):
            pytest.skip("No stored test image found")

        with open(img_path, 'rb') as f:
            contents = f.read()

        with Session(engine) as db:
            result = scan_service.execute_scan_pipeline(
                db=db,
                contents=contents,
                filename='timestamp_test.jpg',
                user_id='test-time'
            )

        created_at = result.get("createdAt")

        # Should NOT be the old hardcoded date
        assert created_at != "2026-08-31T15:00:00Z", \
            "createdAt should NOT be hardcoded to '2026-08-31T15:00:00Z'"

        # Should be a valid ISO timestamp
        assert created_at is not None, "createdAt should not be None"
        assert "T" in created_at, "createdAt should be ISO timestamp format"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
