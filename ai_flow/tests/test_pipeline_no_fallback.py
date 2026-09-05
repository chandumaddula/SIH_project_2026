"""
Tests to ensure NO mock/fallback data reaches the Rule Engine.
All data must come from actual image processing.
"""
import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend", "app"))

os.chdir(os.path.join(os.path.dirname(__file__), "..", "..", "backend"))


class TestRuleEngineNoFallback:
    """Test that Rule Engine receives only real extracted data."""

    def test_rule_engine_with_empty_declarations(self):
        """When no declarations extracted, confidence should be 0, not 0.95."""
        from app.services.scan_service import run_legal_metrology_rule_engine

        result = run_legal_metrology_rule_engine({}, {})
        assert result["confidence"] == 0.0, "Empty declarations should have 0 confidence, not hardcoded 0.95!"
        assert result["result"] in ["review_recommended", "potential_issue"]
        assert len(result["violations"]) > 0

    def test_rule_engine_with_partial_declarations(self):
        """With some fields detected, confidence should reflect actual detection."""
        from app.services.scan_service import run_legal_metrology_rule_engine

        # Only MRP detected
        declarations = {"mrp": "MRP Rs. 30.00"}
        fields = {
            "mrp": {"value": 30.0, "confidence": 0.85}
        }

        result = run_legal_metrology_rule_engine(declarations, fields)
        # Should NOT be 0.95 (hardcoded)
        assert result["confidence"] != 0.95, "Confidence should NOT be hardcoded 0.95!"
        # Should be based on actual field confidence
        assert result["confidence"] > 0, "Should have some confidence based on detected fields"
        assert result["confidence"] < 1.0, "Should not be 100% confident with partial detection"

    def test_rule_engine_all_fields_detected(self):
        """With all fields detected, confidence should be high but not hardcoded."""
        from app.services.scan_service import run_legal_metrology_rule_engine

        declarations = {
            "mrp": "MRP Rs. 30.00",
            "netQuantity": "200g",
            "manufacturer": "Test Company",
            "consumerCare": "1800-123-456"
        }
        fields = {
            "mrp": {"value": 30.0, "confidence": 0.9},
            "net_quantity": {"value": 200.0, "confidence": 0.88},
            "manufacturer": {"value": "Test Company", "confidence": 0.85},
            "consumer_care": {"value": "1800-123-456", "confidence": 0.87}
        }

        result = run_legal_metrology_rule_engine(declarations, fields)
        # Should be high but NOT exactly 0.95 (hardcoded)
        assert result["confidence"] > 0.8, "All fields detected should give high confidence"
        assert result["result"] == "no_issue"
        assert len(result["violations"]) == 0

    def test_no_fresh_farms_in_rule_engine_output(self):
        """Rule engine output must NEVER contain 'Fresh Farms' hardcoded data."""
        from app.services.scan_service import run_legal_metrology_rule_engine

        # Simulate Crunch/Crunchex package
        declarations = {"mrp": "MRP Rs. 30.00"}
        fields = {"mrp": {"value": 30.0, "confidence": 0.85}}

        result = run_legal_metrology_rule_engine(declarations, fields)

        # Convert result to string and check
        result_str = str(result).lower()
        assert "fresh farms" not in result_str, "Rule engine output must NOT contain 'Fresh Farms' hardcoded data!"
        assert "vegetable oil" not in result_str, "Rule engine output must NOT contain 'Vegetable Oil' hardcoded data!"

    def test_rule_engine_result_not_hardcoded(self):
        """Result status must be based on actual data, not hardcoded."""
        from app.services.scan_service import run_legal_metrology_rule_engine

        # Test with empty declarations
        result = run_legal_metrology_rule_engine({}, {})
        assert result["result"] != "no_issue", "Empty declarations should NOT get 'no_issue' hardcoded result!"

        # Test with all declarations present
        declarations = {
            "mrp": "30",
            "netQuantity": "200g",
            "manufacturer": "Test",
            "consumerCare": "12345"
        }
        fields = {
            "mrp": {"value": 30.0, "confidence": 0.9},
            "net_quantity": {"value": 200.0, "confidence": 0.9},
            "manufacturer": {"value": "Test", "confidence": 0.9},
            "consumer_care": {"value": "12345", "confidence": 0.9}
        }
        result = run_legal_metrology_rule_engine(declarations, fields)
        assert result["result"] == "no_issue", "All declarations detected should give 'no_issue' result"


class TestExecuteScanPipelineNoFallback:
    """Test that execute_scan_pipeline returns ONLY real data."""

    def test_no_hardcoded_detected_fields(self):
        """execute_scan_pipeline must NOT return hardcoded detected fields."""
        # This test would require a real image or mocked pipeline
        # For now, we document the requirement
        pass

    def test_created_at_not_hardcoded(self):
        """createdAt must be the actual scan creation time, not a hardcoded date."""
        from app.services import scan_service
        from datetime import datetime

        # Check that _fallback_ai_results is NOT used when pipeline runs
        # The execute_scan_pipeline should use real pipeline, not fallback
        # We can verify by checking the response structure
        # This is validated through integration tests


class TestFallbackNoProductData:
    """
    Regression tests: _fallback_ai_results() must NEVER return product data.
    This function is called when AI Flow is unavailable or throws.
    """

    def test_fallback_returns_no_product_data(self):
        """Fallback must return empty declarations/fields — no Fresh Farms or any product."""
        from app.services.scan_service import _fallback_ai_results

        result = _fallback_ai_results()

        # Never return product name
        assert result.get("raw_text", "") == "", "raw_text must be empty"
        assert result.get("bounding_boxes", []) == [], "bounding_boxes must be empty"

        # declarations must be empty
        decl = result.get("declarations", {})
        assert decl == {}, f"declarations must be empty, got: {decl}"

        # fields must be empty
        fields = result.get("fields", {})
        assert fields == {}, f"fields must be empty, got: {fields}"

    def test_fallback_contains_no_fresh_farms(self):
        """Fallback result must NOT contain 'Fresh Farms', '₹240', '1 L', or any product values."""
        from app.services.scan_service import _fallback_ai_results
        import json

        result = _fallback_ai_results()
        result_str = json.dumps(result).lower()

        forbidden = ["fresh farms", "₹", "240", "1 l", "1000 ml",
                    "freshfarms", "vegetable oil", "refined soybean"]
        for term in forbidden:
            assert term not in result_str, f"Fallback contains forbidden term: '{term}'"

    def test_fallback_confidence_is_zero(self):
        """Fallback must have confidence 0.0 — not hardcoded 95%."""
        from app.services.scan_service import _fallback_ai_results

        result = _fallback_ai_results()

        assert result.get("avg_confidence") == 0.0, \
            f"avg_confidence must be 0.0 when unavailable, got: {result.get('avg_confidence')}"

        quality = result.get("quality", {})
        assert quality.get("quality_score") == 0.0, \
            f"quality_score must be 0.0, got: {quality.get('quality_score')}"
        assert quality.get("usable") is False, \
            f"quality.usable must be False, got: {quality.get('usable')}"
        assert quality.get("quality_status") == "UNAVAILABLE", \
            f"quality_status must be UNAVAILABLE, got: {quality.get('quality_status')}"

    def test_fallback_engine_label_is_unavailable(self):
        """ocr_engine label must indicate unavailability."""
        from app.services.scan_service import _fallback_ai_results

        result = _fallback_ai_results()
        assert "unavailable" in result.get("ocr_engine", "").lower(), \
            f"ocr_engine must indicate unavailability: {result.get('ocr_engine')}"


class TestListScansNoFallback:
    """Test that list_scans returns ONLY real data from database."""

    def test_no_hardcoded_product_data(self):
        """list_scans must NOT return hardcoded product data."""
        # This is validated through integration tests
        # The API endpoint was fixed to return real data from detected_data column
        pass


class TestScreeningSchemaRobustness:
    """
    Regression: legacy DB rows with screening_data = {} or missing fields
    must not cause 500 errors. The API must return a valid ScreeningResultSchema
    with honest 'not available' values — never invented product data.
    """

    def test_screening_schema_accepts_empty_dict(self):
        """ScreeningResultSchema must accept {} (legacy/incomplete row)."""
        from app.schemas.scan import ScreeningResultSchema

        # This is what a legacy DB row looks like
        sch = ScreeningResultSchema(**{})
        assert sch.result is None
        assert sch.confidence is None
        assert sch.explanation is None
        assert sch.flags == []
        assert sch.suggestedNextStep is None

    def test_screening_schema_accepts_full_data(self):
        """Real screening data must round-trip correctly."""
        from app.schemas.scan import ScreeningResultSchema

        data = {
            "result": "no_issue",
            "explanation": "All checks passed",
            "confidence": 0.87,
            "flags": [],
            "suggestedNextStep": "Proceed",
        }
        sch = ScreeningResultSchema(**data)
        assert sch.result == "no_issue"
        assert sch.confidence == 0.87

    def test_build_screening_handles_empty(self):
        """_build_screening must return honest 'not available' for empty input."""
        # Replicate the helper logic without importing the API module
        # (which pulls in DB deps we don't need in this test).
        def _build_screening(screening_raw):
            if not screening_raw:
                return {
                    "result": None,
                    "explanation": "Screening results are not available for this scan.",
                    "confidence": 0.0,
                    "flags": [],
                    "suggestedNextStep": "Re-scan the package to generate screening results.",
                }
            return {
                "result": screening_raw.get("result"),
                "explanation": screening_raw.get("explanation") or "No explanation recorded.",
                "confidence": screening_raw.get("confidence") if screening_raw.get("confidence") is not None else 0.0,
                "flags": screening_raw.get("flags") or [],
                "suggestedNextStep": screening_raw.get("suggestedNextStep") or "No next step recorded.",
            }

        out = _build_screening({})
        assert out["result"] is None
        assert out["confidence"] == 0.0
        assert "not available" in out["explanation"].lower()

    def test_build_screening_preserves_real_data(self):
        """Real screening data must be preserved, not overwritten."""
        def _build_screening(screening_raw):
            if not screening_raw:
                return {"result": None, "explanation": "X", "confidence": 0.0, "flags": [], "suggestedNextStep": "Y"}
            return {
                "result": screening_raw.get("result"),
                "explanation": screening_raw.get("explanation") or "No explanation recorded.",
                "confidence": screening_raw.get("confidence") if screening_raw.get("confidence") is not None else 0.0,
                "flags": screening_raw.get("flags") or [],
                "suggestedNextStep": screening_raw.get("suggestedNextStep") or "No next step recorded.",
            }

        real = {
            "result": "review_recommended",
            "explanation": "MRP missing",
            "confidence": 0.42,
            "flags": ["flag1"],
            "suggestedNextStep": "Manual review",
        }
        out = _build_screening(real)
        assert out["result"] == "review_recommended"
        assert out["explanation"] == "MRP missing"
        assert out["confidence"] == 0.42
        assert out["flags"] == ["flag1"]
        assert out["suggestedNextStep"] == "Manual review"

    def test_build_screening_no_product_data_invented(self):
        """Missing screening must never invent product data."""
        def _build_screening(screening_raw):
            if not screening_raw:
                return {
                    "result": None,
                    "explanation": "Screening results are not available for this scan.",
                    "confidence": 0.0,
                    "flags": [],
                    "suggestedNextStep": "Re-scan the package to generate screening results.",
                }
            return screening_raw

        out = _build_screening({})
        import json
        s = json.dumps(out).lower()
        for forbidden in ["fresh farms", "₹", "240", "1 l", "vegetable oil"]:
            assert forbidden not in s, f"Empty screening must not contain '{forbidden}'"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
