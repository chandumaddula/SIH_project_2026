from typing import List, Dict, Any

class DeclarationExtractor:
    """
    Parses raw OCR blocks into structured Legal Metrology fields:
    - MRP, Net Quantity, Mfg/Packed Date, Manufacturer/Importer details, Country of Origin
    """
    def extract_declarations(self, ocr_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        extracted = {}
        for block in ocr_results:
            text = block["text"]
            if "MRP" in text or "Rs" in text:
                extracted["MRP"] = text
            elif "Net Qty" in text or "Net Quantity" in text:
                extracted["NET_QUANTITY"] = text
            elif "Mfg" in text or "Packed" in text:
                extracted["MFG_DATE"] = text
        return extracted
