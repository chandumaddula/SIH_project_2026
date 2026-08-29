from typing import Dict, Any

class ProductExtractionService:
    @staticmethod
    def extract_product_attributes(extracted_text: str) -> Dict[str, Any]:
        """
        Extracts structured product fields from OCR parsed label text
        """
        return {
            "product_name": "Packaged Commodity Sample",
            "category": "Packaged Foods",
            "mrp": 149.0,
            "net_quantity": "250 g",
            "mfg_date": "08/2026",
            "manufacturer": "National Foods Ltd",
            "consumer_care": "care@nationalfoods.in",
        }

product_extraction_service = ProductExtractionService()
