import re
from typing import Dict, Any

class TextProcessingService:
    @staticmethod
    def clean_text(text: str) -> str:
        if not text:
            return ""
        return re.sub(r'\s+', ' ', text).strip()

    @staticmethod
    def parse_mrp(text: str) -> Dict[str, Any]:
        match = re.search(r'mrp\s*rs\.?\s*([\d\.]+)', text, re.IGNORECASE)
        mrp_val = float(match.group(1)) if match else None
        has_tax_clause = "incl" in text.lower() and "tax" in text.lower()
        return {
            "mrp": mrp_val,
            "has_inclusive_of_taxes": has_tax_clause,
        }

text_processing_service = TextProcessingService()
