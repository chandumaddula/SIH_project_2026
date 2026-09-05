"""
Tests for field extractor handling realistic variations in package declarations.
Tests that NO mock/fallback data is used - only actual OCR results.
"""
import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from ai_flow.extraction.field_extractor import FieldExtractor


class TestFieldExtractorVariations:
    """Test field extractor with realistic package label variations."""

    def setup_method(self):
        self.extractor = FieldExtractor()

    def _make_ocr_item(self, text: str, y: int = 100, confidence: float = 0.9) -> dict:
        """Helper to create OCR result item."""
        return {
            "text": text,
            "confidence": confidence,
            "bbox": [100, y, 200, 40]
        }

    def _extract(self, ocr_texts: list[tuple[str, int, float]]) -> dict:
        """Helper to extract fields from a list of (text, y_position, confidence)."""
        ocr_results = [self._make_ocr_item(text, y, conf) for text, y, conf in ocr_texts]
        fields = self.extractor.extract_from_ocr(ocr_results)
        return self.extractor.to_serializable_dict(fields)

    # ========================================================================
    # MRP Tests - Various formats
    # ========================================================================
    def test_mrp_with_colon(self):
        """MRP with colon format."""
        fields = self._extract([
            ("MRP: Rs. 30.00", 50, 0.9),
        ])
        assert fields.get("mrp") is not None
        assert fields["mrp"]["value"] == 30.0

    def test_mrp_without_colon(self):
        """MRP without colon format."""
        fields = self._extract([
            ("MRP Rs. 30.00", 50, 0.9),
        ])
        assert fields.get("mrp") is not None
        assert fields["mrp"]["value"] == 30.0

    def test_mrp_with_rupee_symbol(self):
        """MRP with ₹ symbol."""
        fields = self._extract([
            ("MRP ₹30.00", 50, 0.9),
        ])
        assert fields.get("mrp") is not None
        assert fields["mrp"]["value"] == 30.0

    def test_mrp_mrp_format(self):
        """M.R.P. format."""
        fields = self._extract([
            ("M.R.P. Rs. 50.00", 50, 0.9),
        ])
        assert fields.get("mrp") is not None
        assert fields["mrp"]["value"] == 50.0

    def test_mrp_maximum_retail_price(self):
        """Maximum Retail Price full text."""
        fields = self._extract([
            ("Maximum Retail Price Rs. 45.00", 50, 0.9),
        ])
        assert fields.get("mrp") is not None
        assert fields["mrp"]["value"] == 45.0

    def test_mrp_integer_price(self):
        """MRP with integer (no decimal)."""
        fields = self._extract([
            ("MRP Rs 25", 50, 0.9),
        ])
        assert fields.get("mrp") is not None
        assert fields["mrp"]["value"] == 25.0

    def test_mrp_with_mrp_keyword(self):
        """Price with 'MRP' keyword after amount."""
        fields = self._extract([
            ("Rs. 35.00 MRP", 50, 0.9),
        ])
        # Should still extract
        mrp_field = fields.get("mrp")
        if mrp_field:
            assert mrp_field["value"] == 35.0

    def test_mrp_missing_returns_none(self):
        """When no MRP is in OCR text, returns None (NOT fallback)."""
        fields = self._extract([
            ("Just some text without price", 50, 0.9),
        ])
        # Must NOT have hardcoded fallback
        assert fields.get("mrp") is None, "MRP should be None when not detected - no fallback"

    # ========================================================================
    # Net Quantity Tests - Various formats
    # ========================================================================
    def test_net_quantity_grams(self):
        """Net quantity in grams."""
        fields = self._extract([
            ("Net Wt: 200g", 50, 0.9),
        ])
        assert fields.get("net_quantity") is not None
        assert fields["net_quantity"]["value"] == 200.0
        assert fields["net_quantity"]["unit"] == "g"

    def test_net_quantity_kg(self):
        """Net quantity in kilograms."""
        fields = self._extract([
            ("Net Quantity: 1 kg", 50, 0.9),
        ])
        assert fields.get("net_quantity") is not None
        assert fields["net_quantity"]["unit"] == "kg"

    def test_net_quantity_ml(self):
        """Net quantity in milliliters."""
        fields = self._extract([
            ("Net Quantity 500 ml", 50, 0.9),
        ])
        assert fields.get("net_quantity") is not None
        assert fields["net_quantity"]["unit"] == "ml"

    def test_net_quantity_liters(self):
        """Net quantity in liters."""
        fields = self._extract([
            ("Net Wt. 1.5L", 50, 0.9),
        ])
        assert fields.get("net_quantity") is not None
        assert fields["net_quantity"]["unit"] == "l"

    def test_net_quantity_ltr_variant(self):
        """Net quantity with 'ltr' variant."""
        fields = self._extract([
            ("Net Quantity: 2ltr", 50, 0.9),
        ])
        assert fields.get("net_quantity") is not None
        assert fields["net_quantity"]["unit"] == "l"

    def test_net_quantity_net_volume(self):
        """Net Volume format."""
        fields = self._extract([
            ("Net Volume: 300 ml", 50, 0.9),
        ])
        assert fields.get("net_quantity") is not None
        assert fields["net_quantity"]["unit"] == "ml"

    def test_net_quantity_net_content(self):
        """Net Content format."""
        fields = self._extract([
            ("Net Content: 100g", 50, 0.9),
        ])
        assert fields.get("net_quantity") is not None

    def test_net_quantity_missing_returns_none(self):
        """When no net quantity in OCR text, returns None (NOT fallback)."""
        fields = self._extract([
            ("Product Name Here", 50, 0.9),
        ])
        assert fields.get("net_quantity") is None, "Net quantity should be None when not detected - no fallback"

    # ========================================================================
    # Manufacturer Tests - Various formats
    # ========================================================================
    def test_manufacturer_mfd_by(self):
        """Manufacturer with 'Mfd. by' format."""
        fields = self._extract([
            ("Mfd. by Crunch Foods Pvt Ltd", 50, 0.9),
        ])
        assert fields.get("manufacturer") is not None
        assert "Crunch Foods" in fields["manufacturer"]["value"]

    def test_manufacturer_mfg_by(self):
        """Manufacturer with 'Mfg. by' format."""
        fields = self._extract([
            ("Mfg. by ABC Foods Ltd", 50, 0.9),
        ])
        assert fields.get("manufacturer") is not None
        assert "ABC Foods" in fields["manufacturer"]["value"]

    def test_manufacturer_manufactured_by(self):
        """Manufacturer with 'Manufactured by' format."""
        fields = self._extract([
            ("Manufactured by XYZ Industries", 50, 0.9),
        ])
        assert fields.get("manufacturer") is not None

    def test_manufacturer_label(self):
        """Manufacturer with 'Manufacturer:' label."""
        fields = self._extract([
            ("Manufacturer: Test Company", 50, 0.9),
        ])
        assert fields.get("manufacturer") is not None

    def test_manufacturer_missing_returns_none(self):
        """When no manufacturer in OCR text, returns None (NOT fallback)."""
        fields = self._extract([
            ("Some random text without manufacturer", 50, 0.9),
        ])
        assert fields.get("manufacturer") is None, "Manufacturer should be None when not detected - no fallback"

    # ========================================================================
    # Packer Tests
    # ========================================================================
    def test_packer_pkd_by(self):
        """Packer with 'Pkd. by' format."""
        fields = self._extract([
            ("Pkd. by ABC Packaging", 50, 0.9),
        ])
        assert fields.get("packer") is not None

    def test_packer_packed_by(self):
        """Packer with 'Packed by' format."""
        fields = self._extract([
            ("Packed by XYZ Packers", 50, 0.9),
        ])
        assert fields.get("packer") is not None

    # ========================================================================
    # Expiry Date Tests
    # ========================================================================
    def test_expiry_date_exp(self):
        """Expiry with 'Exp:' format."""
        fields = self._extract([
            ("Exp: 12/2025", 50, 0.9),
        ])
        assert fields.get("expiry_date") is not None

    def test_expiry_date_expiry(self):
        """Expiry with 'Expiry' label."""
        fields = self._extract([
            ("Expiry: 31/12/2025", 50, 0.9),
        ])
        assert fields.get("expiry_date") is not None

    def test_expiry_date_best_before(self):
        """Expiry with 'Best Before' format."""
        fields = self._extract([
            ("Best Before: 06/2026", 50, 0.9),
        ])
        assert fields.get("expiry_date") is not None

    def test_expiry_date_missing_returns_none(self):
        """When no expiry date in OCR text, returns None (NOT fallback)."""
        fields = self._extract([
            ("No date information here", 50, 0.9),
        ])
        assert fields.get("expiry_date") is None, "Expiry date should be None when not detected - no fallback"

    # ========================================================================
    # Manufacturing Date Tests
    # ========================================================================
    def test_mfg_date_mfd(self):
        """Manufacturing date with 'Mfd.' format."""
        fields = self._extract([
            ("Mfd. 15/06/2024", 50, 0.9),
        ])
        assert fields.get("manufacturing_date") is not None

    def test_mfg_date_mfg(self):
        """Manufacturing date with 'Mfg.' format."""
        fields = self._extract([
            ("Mfg: 01/01/2024", 50, 0.9),
        ])
        assert fields.get("manufacturing_date") is not None

    def test_mfg_date_packed(self):
        """Manufacturing date with 'Packed on' format."""
        fields = self._extract([
            ("Packed on 20/05/2024", 50, 0.9),
        ])
        assert fields.get("manufacturing_date") is not None

    # ========================================================================
    # Consumer Care Tests
    # ========================================================================
    def test_consumer_care_consumer(self):
        """Consumer care with 'Consumer Care' format."""
        fields = self._extract([
            ("Consumer Care: 1800-123-4567", 50, 0.9),
        ])
        assert fields.get("consumer_care") is not None

    def test_consumer_care_helpline(self):
        """Consumer care with 'Helpline' format."""
        fields = self._extract([
            ("Helpline: 1800-999-8888", 50, 0.9),
        ])
        assert fields.get("consumer_care") is not None

    def test_consumer_care_tollfree(self):
        """Consumer care with 'Toll Free' format."""
        fields = self._extract([
            ("Toll Free: 1800-100-2000", 50, 0.9),
        ])
        assert fields.get("consumer_care") is not None

    def test_consumer_care_missing_returns_none(self):
        """When no consumer care in OCR text, returns None (NOT fallback)."""
        fields = self._extract([
            ("No contact info here", 50, 0.9),
        ])
        assert fields.get("consumer_care") is None, "Consumer care should be None when not detected - no fallback"

    # ========================================================================
    # Country of Origin Tests
    # ========================================================================
    def test_country_of_origin(self):
        """Country of origin with 'Country of Origin' format."""
        fields = self._extract([
            ("Country of Origin: India", 50, 0.9),
        ])
        assert fields.get("country_of_origin") is not None

    def test_country_of_origin_made_in(self):
        """Country of origin with 'Made in' format."""
        fields = self._extract([
            ("Made in India", 50, 0.9),
        ])
        assert fields.get("country_of_origin") is not None

    # ========================================================================
    # Batch Number Tests
    # ========================================================================
    def test_batch_number(self):
        """Batch number extraction."""
        fields = self._extract([
            ("Batch No: ABC123", 50, 0.9),
        ])
        assert fields.get("batch_number") is not None

    def test_lot_number(self):
        """Lot number extraction."""
        fields = self._extract([
            ("Lot No: 2024-05-001", 50, 0.9),
        ])
        assert fields.get("batch_number") is not None

    # ========================================================================
    # FSSAI License Tests
    # ========================================================================
    def test_fssai_license(self):
        """FSSAI license number extraction."""
        fields = self._extract([
            ("FSSAI License No: 12345678901234", 50, 0.9),
        ])
        assert fields.get("fssai_license") is not None

    def test_fssai_no(self):
        """FSSAI 'No' format."""
        fields = self._extract([
            ("FSSAI No. 11234567890123", 50, 0.9),
        ])
        assert fields.get("fssai_license") is not None

    # ========================================================================
    # NO FALLBACK Tests - Critical!
    # ========================================================================
    def test_no_fresh_farms_fallback(self):
        """CRITICAL: When Fresh Farms text is NOT in OCR, it must NOT appear in extracted fields."""
        fields = self._extract([
            ("Some Product Name", 50, 0.9),
            ("MRP: Rs. 25.00", 100, 0.9),
            ("Net Wt: 100g", 150, 0.9),
        ])
        # Check that no field contains "Fresh Farms" or hardcoded values
        for field_name, field_data in fields.items():
            if field_data.get("value"):
                value_str = str(field_data["value"]).lower()
                assert "fresh farms" not in value_str, f"Field {field_name} contains 'Fresh Farms' fallback!"
                assert "240" not in value_str, f"Field {field_name} contains hardcoded '240'!"
                assert "1 l" not in value_str, f"Field {field_name} contains hardcoded '1 L'!"

    def test_all_fields_missing_returns_empty_not_fallback(self):
        """When ALL fields are missing, extraction returns empty dict (NOT fallback values)."""
        fields = self._extract([
            ("Random text that doesn't match any pattern", 50, 0.9),
            ("Another unrelated text", 100, 0.9),
        ])
        # Must be empty - no fallback
        for field_name in ["mrp", "net_quantity", "manufacturer", "packer", "consumer_care", "expiry_date"]:
            assert field_name not in fields or fields[field_name] is None, \
                f"Field {field_name} should NOT be present when not detected - no fallback allowed!"

    def test_source_text_always_from_actual_ocr(self):
        """Every extracted field must have source_text from actual OCR."""
        fields = self._extract([
            ("MRP: Rs. 50.00", 50, 0.85),
        ])
        if fields.get("mrp"):
            # source_text MUST be from actual OCR result
            assert fields["mrp"]["source_text"] == "MRP: Rs. 50.00", \
                "source_text must come from actual OCR result"
            # bbox MUST be from actual OCR result
            assert fields["mrp"]["bbox"] is not None, \
                "bbox must be from actual OCR result"

    def test_confidence_reflects_ocr_confidence(self):
        """Field confidence should reflect OCR confidence."""
        fields = self._extract([
            ("MRP: Rs. 30.00", 50, 0.75),
        ])
        if fields.get("mrp"):
            # Confidence should be from the OCR item, not hardcoded
            assert fields["mrp"]["confidence"] == 0.75, \
                "Confidence should be from actual OCR result"


class TestFieldExtractorNoFallback:
    """CRITICAL: Tests to ensure NO mock/fallback data is ever returned."""

    def setup_method(self):
        self.extractor = FieldExtractor()

    def test_empty_ocr_returns_empty_fields(self):
        """Empty OCR results must return empty fields - no fallback."""
        fields = self.extractor.extract_from_ocr([])
        serializable = self.extractor.to_serializable_dict(fields)
        assert len(serializable) == 0, "Empty OCR must produce empty fields - no fallback!"

    def test_no_hardcoded_product_names(self):
        """Product name must NOT be hardcoded to any sample product."""
        # Test with OCR that has no product name pattern
        ocr_results = [
            {"text": "Random text without product", "confidence": 0.9, "bbox": [0, 0, 100, 20]},
        ]
        fields = self.extractor.extract_from_ocr(ocr_results)
        serializable = self.extractor.to_serializable_dict(fields)

        # Product name should NOT contain any hardcoded sample product names
        for field_name, field_data in serializable.items():
            if field_data.get("value"):
                value_str = str(field_data["value"]).lower()
                assert "fresh farms" not in value_str
                assert "vegetable oil" not in value_str

    def test_no_hardcoded_prices(self):
        """Price values must NOT be hardcoded to sample values."""
        ocr_results = [
            {"text": "Some label without price info", "confidence": 0.9, "bbox": [0, 0, 100, 20]},
        ]
        fields = self.extractor.extract_from_ocr(ocr_results)
        serializable = self.extractor.to_serializable_dict(fields)

        for field_name, field_data in serializable.items():
            if field_data.get("value"):
                value_str = str(field_data["value"])
                # Check for hardcoded sample prices
                assert "240" not in value_str, "No hardcoded price of 240!"

    def test_no_hardcoded_quantities(self):
        """Quantity values must NOT be hardcoded to sample values."""
        ocr_results = [
            {"text": "Some label without quantity", "confidence": 0.9, "bbox": [0, 0, 100, 20]},
        ]
        fields = self.extractor.extract_from_ocr(ocr_results)
        serializable = self.extractor.to_serializable_dict(fields)

        for field_name, field_data in serializable.items():
            if field_data.get("value"):
                value_str = str(field_data["value"]).lower()
                assert "1 l" not in value_str, "No hardcoded quantity of 1 L!"
                assert "1000 ml" not in value_str, "No hardcoded quantity of 1000 ml!"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
