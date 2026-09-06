"""
AI Flow Field Extraction Service - Extract specific fields from OCR text.
Uses pattern matching and heuristics to identify Legal Metrology declarations.
"""
import re
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime

from ai_flow.schemas.result import OCRResult, FieldExtractionResult


class FieldExtractor:
    """
    Extracts specific fields from OCR text based on Legal Metrology requirements.

    Mandatory fields under Legal Metrology (Packaged Commodities) Rules 2011:
    1. MRP (Maximum Retail Price)
    2. Net Quantity
    3. Manufacturing Date / Best Before Date
    4. Manufacturer Details
    5. Country of Origin
    6. Consumer Care Details
    7. Batch Number
    8. FSSAI License (for food products)
    9. Barcode
    10. Generic Name
    """

    def __init__(self):
        """Initialize field extractor with patterns."""
        self._init_patterns()

    def _init_patterns(self):
        """Initialize regex patterns for field extraction."""
        # MRP patterns - Various formats
        self.mrp_patterns = [
            # MRP Rs. 100.00 (Incl. of all taxes)
            r'(?:MRP|Max\.? Retail\.? Price)[\s:]*Rs\.?\s*(\d+(?:\.\d{1,2})?)',
            # ₹100.00 or Rs 100
            r'(?:MRP)?[\s]*[₹Rs\.?]+\s*(\d+(?:\.\d{1,2})?)',
            # MRP 100
            r'\bMRP\b[^\d]*(\d+(?:\.\d{1,2})?)',
            # Price ending with /-
            r'(\d+(?:\.\d{1,2})?)\s*/[-\s]',
        ]

        # Net quantity patterns
        self.qty_patterns = [
            # Net Wt.: 500g, Net Weight: 1kg
            r'(?:Net\.?\s*(?:Wt\.?|Weight|Volume|Qty\.?|Quantity))[\s:]*(\d+(?:\.\d+)?)\s*(g|kg|ml|l|ltr|litre|liter|pcs|pieces|count)?',
            # 500g Net
            r'(\d+(?:\.\d+)?)\s*(g|kg|ml|l|ltr|litre|liter|pcs|pieces|count)\s*(?:Net)?',
            # GrossWt / NetWt
            r'(?:Net\.?\s*Wt\.?)[\s:]*(\d+(?:\.\d+)?)\s*(g|kg|ml|l)',
        ]

        # Manufacturing / Expiry date patterns
        self.mfg_date_patterns = [
            # MFG: DD-MM-YYYY or MFG: DD/MM/YYYY
            r'(?:MFG(?:\.?)|Manufactured|Manuf\.?|Mfg\.?)[\s:]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})',
            # DD-MM-YYYY anywhere
            r'\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b',
        ]

        self.exp_date_patterns = [
            # EXP: or Expiry: patterns
            r'(?:EXP(?:\.?)|Expiry|Exp\.?|Best Before|Use Before|BBD)[\s:]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})',
            # "Best Before" with months
            r'Best\s+Before\s+(\w+\s+\d{4})',
            r'Use\s+Before\s+(\w+\s+\d{4})',
        ]

        # Manufacturer patterns
        self.manufacturer_patterns = [
            # Manufactured by: Company Name
            r'(?:Manufactured\s+(?:by|in)|Manuf\.?\s+by|MFG\.?\s+by)[\s:]+([A-Za-z\s&\-\.]+(?:Pvt\.?|Ltd\.?|Limited|Inc\.?)?)',
            # Packed by
            r'(?:Packed\s+by|Packer)[\s:]+([A-Za-z\s&\-\.]+(?:Pvt\.?|Ltd\.?|Limited|Inc\.?)?)',
            # "Imported by" for imported products
            r'(?:Imported\s+by|Importer)[\s:]+([A-Za-z\s&\-\.]+)',
            # Company name followed by address
            r'^([A-Z][A-Za-z\s&\-\.]+(?:Pvt\.?|Ltd\.?|Limited|Inc\.?)?)\s*,?\s*\d+',
        ]

        # Country of origin patterns
        self.country_patterns = [
            # Country of Origin: India
            r'(?:Country\s+(?:of\s+)?Origin|COO|Made\s+in|Product\s+of)[\s:]*([A-Za-z\s]+)',
            r'\b(Made\s+in)\s+([A-Za-z\s]+)',
            # Country names directly
            r'\b(India|USA|UK|U\.S\.A\.|China|Germany|Japan|Italy|Switzerland)\b',
        ]

        # Consumer care patterns
        self.consumer_care_patterns = [
            # Customer Care / Consumer Care
            r'(?:Customer|Consumer)\s*Care[\s:]*([\d\+\-\s]+)',
            # Toll Free numbers
            r'(?:Toll\s*Free|1800[\-\s]\d{3}[\-\s]\d{3,4})',
            # Customer service
            r'(?:Customer\s*Service|Cust\.?\s*Care|Support)[\s:]*([\d\+\-\s\w@]+)',
        ]

        # Batch number patterns
        self.batch_patterns = [
            # Batch No.: ABC123
            r'(?:Batch\s*(?:No\.?|Number|Code)|Lot\s*(?:No\.?|Number|Code)|LOT)[\s:]*([A-Z0-9\-\/]+)',
            # Standalone batch codes
            r'\b(Batch[\s:]*[A-Z0-9\-]+)\b',
            r'\b(Lot[\s:]*[A-Z0-9\-]+)\b',
        ]

        # FSSAI License patterns
        self.fssai_patterns = [
            # FSSAI License No.: 12345678901234
            r'(?:FSSAI|Lic\.?\s*No\.?|Food\s*Lic\.?)[\s:]*(\d{13,15})',
            # License number format
            r'\b(\d{13,15})\b',
        ]

        # Barcode patterns
        self.barcode_patterns = [
            # Standard barcodes (EAN, UPC)
            r'\b(\d{8,14})\b',
        ]

        # Address patterns
        self.address_patterns = [
            # Address with keywords
            r'(?:Address|Add\.?|Regd\.?\s*Office|Corporate\s*Office)[\s:]*([A-Za-z0-9\s\,\-\.\/]+?)(?=\d{6}|$)',
            # 6-digit PIN code
            r'([A-Za-z\s]+,\s*[A-Z]{2}\s*\d{6})',
        ]

        # Product name patterns
        self.product_name_patterns = [
            # Lines at the top usually contain product name
            r'^([A-Z][A-Za-z\s&\-\'\.]+(?:\s+\d+\s*(?:g|kg|ml|l|pcs|packs?)?)+)',
            # Common product name formats
            r'^([A-Z][A-Za-z\s&\-\'\.]+)(?:\s+\d)',
        ]

    def extract_fields(self, ocr_results: List[OCRResult], raw_text: str) -> Dict[str, Dict[str, Any]]:
        """
        Extract all required fields from OCR results.

        Args:
            ocr_results: List of OCR results with text and bounding boxes
            raw_text: Combined raw text from all OCR results

        Returns:
            Dictionary mapping field names to extraction results
        """
        fields = {}

        # Extract each field type
        fields['product_name'] = self._extract_product_name(raw_text, ocr_results)
        fields['mrp'] = self._extract_mrp(raw_text)
        fields['net_quantity'] = self._extract_net_quantity(raw_text)
        fields['manufacturer'] = self._extract_manufacturer(raw_text)
        fields['packer'] = self._extract_packer(raw_text)
        fields['importer'] = self._extract_importer(raw_text)
        fields['consumer_care'] = self._extract_consumer_care(raw_text)
        fields['country_of_origin'] = self._extract_country_of_origin(raw_text)
        fields['address'] = self._extract_address(raw_text)
        fields['mfg_date'] = self._extract_mfg_date(raw_text)
        fields['exp_date'] = self._extract_exp_date(raw_text)
        fields['batch_number'] = self._extract_batch_number(raw_text)
        fields['fssai_license'] = self._extract_fssai(raw_text)
        fields['barcode'] = self._extract_barcode(raw_text)
        fields['generic_name'] = self._extract_generic_name(raw_text)

        return fields

    def _extract_product_name(self, text: str, ocr_results: List[OCRResult]) -> Dict[str, Any]:
        """Extract product name from text."""
        lines = text.split('\n')
        for line in lines[:5]:  # Product name usually in first few lines
            line = line.strip()
            if len(line) > 3 and len(line) < 100:
                # Check if line starts with capital letter
                if line and line[0].isupper():
                    # Filter out lines that look like other information
                    if not any(kw in line.lower() for kw in ['mrp', 'rs.', 'price', 'net', 'qty', 'weight']):
                        return {
                            'value': line,
                            'confidence': 0.85,
                            'source_text': line
                        }
        return {'value': None, 'confidence': 0.0, 'source_text': None}

    def _extract_mrp(self, text: str) -> Dict[str, Any]:
        """Extract MRP from text."""
        for pattern in self.mrp_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    value = float(match.group(1).replace(',', ''))
                    # Find the source text
                    source = match.group(0)
                    return {
                        'value': value,
                        'confidence': 0.9,
                        'source_text': source
                    }
                except (ValueError, IndexError):
                    continue
        return {'value': None, 'confidence': 0.0, 'source_text': None}

    def _extract_net_quantity(self, text: str) -> Dict[str, Any]:
        """Extract net quantity from text."""
        for pattern in self.qty_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    value = float(match.group(1).replace(',', ''))
                    unit = match.group(2) if len(match.groups()) > 1 else 'g'
                    source = match.group(0)
                    return {
                        'value': value,
                        'unit': unit.lower(),
                        'confidence': 0.85,
                        'source_text': source
                    }
                except (ValueError, IndexError):
                    continue
        return {'value': None, 'confidence': 0.0, 'source_text': None}

    def _extract_manufacturer(self, text: str) -> Dict[str, Any]:
        """Extract manufacturer name from text."""
        for pattern in self.manufacturer_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                name = match.group(1).strip()
                if len(name) > 2:
                    return {
                        'value': name,
                        'confidence': 0.8,
                        'source_text': match.group(0)
                    }
        return {'value': None, 'confidence': 0.0, 'source_text': None}

    def _extract_packer(self, text: str) -> Dict[str, Any]:
        """Extract packer name from text."""
        pattern = r'(?:Packed\s+by|Packer)[\s:]+([A-Za-z\s&\-\.]+(?:Pvt\.?|Ltd\.?|Limited|Inc\.?)?)'
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return {
                'value': match.group(1).strip(),
                'confidence': 0.8,
                'source_text': match.group(0)
            }
        return {'value': None, 'confidence': 0.0, 'source_text': None}

    def _extract_importer(self, text: str) -> Dict[str, Any]:
        """Extract importer name from text."""
        pattern = r'(?:Imported\s+by|Importer)[\s:]+([A-Za-z\s&\-\.]+)'
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return {
                'value': match.group(1).strip(),
                'confidence': 0.8,
                'source_text': match.group(0)
            }
        return {'value': None, 'confidence': 0.0, 'source_text': None}

    def _extract_consumer_care(self, text: str) -> Dict[str, Any]:
        """Extract consumer care information from text."""
        for pattern in self.consumer_care_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return {
                    'value': match.group(0).strip(),
                    'confidence': 0.85,
                    'source_text': match.group(0)
                }
        return {'value': None, 'confidence': 0.0, 'source_text': None}

    def _extract_country_of_origin(self, text: str) -> Dict[str, Any]:
        """Extract country of origin from text."""
        for pattern in self.country_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                country = match.group(1).strip() if match.group(1) else match.group(2).strip()
                return {
                    'value': country,
                    'confidence': 0.9,
                    'source_text': match.group(0)
                }
        return {'value': None, 'confidence': 0.0, 'source_text': None}

    def _extract_address(self, text: str) -> Dict[str, Any]:
        """Extract address from text."""
        # Look for address patterns
        address_match = re.search(
            r'(?:Address|Add\.?|Regd\.?\s*Office)[^\n]{10,100}',
            text,
            re.IGNORECASE
        )
        if address_match:
            return {
                'value': address_match.group(0).strip(),
                'confidence': 0.7,
                'source_text': address_match.group(0)
            }
        return {'value': None, 'confidence': 0.0, 'source_text': None}

    def _extract_mfg_date(self, text: str) -> Dict[str, Any]:
        """Extract manufacturing date from text."""
        for pattern in self.mfg_date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return {
                    'value': match.group(1).strip(),
                    'confidence': 0.85,
                    'source_text': match.group(0)
                }
        return {'value': None, 'confidence': 0.0, 'source_text': None}

    def _extract_exp_date(self, text: str) -> Dict[str, Any]:
        """Extract expiry date from text."""
        for pattern in self.exp_date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return {
                    'value': match.group(1).strip(),
                    'confidence': 0.85,
                    'source_text': match.group(0)
                }
        return {'value': None, 'confidence': 0.0, 'source_text': None}

    def _extract_batch_number(self, text: str) -> Dict[str, Any]:
        """Extract batch number from text."""
        for pattern in self.batch_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return {
                    'value': match.group(1).strip(),
                    'confidence': 0.8,
                    'source_text': match.group(0)
                }
        return {'value': None, 'confidence': 0.0, 'source_text': None}

    def _extract_fssai(self, text: str) -> Dict[str, Any]:
        """Extract FSSAI license number from text."""
        for pattern in self.fssai_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return {
                    'value': match.group(1).strip(),
                    'confidence': 0.9,
                    'source_text': match.group(0)
                }
        return {'value': None, 'confidence': 0.0, 'source_text': None}

    def _extract_barcode(self, text: str) -> Dict[str, Any]:
        """Extract barcode from text."""
        for pattern in self.barcode_patterns:
            match = re.search(pattern, text)
            if match:
                barcode = match.group(1)
                # Verify it looks like a valid barcode
                if len(barcode) >= 8:
                    return {
                        'value': barcode,
                        'confidence': 0.75,
                        'source_text': barcode
                    }
        return {'value': None, 'confidence': 0.0, 'source_text': None}

    def _extract_generic_name(self, text: str) -> Dict[str, Any]:
        """Extract generic name from text."""
        # Generic name is usually listed separately
        pattern = r'(?:Generic\s*(?:Name)|Ingredient)[\s:]*([A-Za-z\s\-]+)'
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return {
                'value': match.group(1).strip(),
                'confidence': 0.8,
                'source_text': match.group(0)
            }
        return {'value': None, 'confidence': 0.0, 'source_text': None}


# Global field extractor instance
_field_extractor: Optional[FieldExtractor] = None


def get_field_extractor() -> FieldExtractor:
    """Get or create global field extractor instance."""
    global _field_extractor
    if _field_extractor is None:
        _field_extractor = FieldExtractor()
    return _field_extractor


def extract_fields(ocr_results: List[OCRResult], raw_text: str) -> Dict[str, Dict[str, Any]]:
    """Convenience function to extract fields from OCR results."""
    extractor = get_field_extractor()
    return extractor.extract_fields(ocr_results, raw_text)
