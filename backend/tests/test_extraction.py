import unittest
from app.services.text_processing_service import text_processing_service
from app.services.product_extraction_service import product_extraction_service

class TestExtractionService(unittest.TestCase):
    def test_mrp_parsing(self):
        text = "MRP Rs 199.00 (Incl. of all taxes)"
        parsed = text_processing_service.parse_mrp(text)
        self.assertEqual(parsed["mrp"], 199.0)
        self.assertTrue(parsed["has_inclusive_of_taxes"])

    def test_product_attribute_extraction(self):
        res = product_extraction_service.extract_product_attributes("Sample label text")
        self.assertIn("product_name", res)
        self.assertIn("mrp", res)

if __name__ == "__main__":
    unittest.main()
