import re
from typing import Dict, Any, List, Optional
from dataclasses import dataclass


@dataclass
class ExtractedField:
    """Structured representation of an extracted field."""
    field_name: str
    value: Any
    confidence: float
    source_text: str
    bbox: List[int]
    unit: Optional[str] = None
    currency: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class FieldExtractor:
    """
    Extract structured legal metrology fields from OCR text results.

    Supported fields:
    - product_name: Product name/title
    - manufacturer: Manufacturer name
    - packer: Packer name
    - importer: Importer name
    - address: Complete address
    - country_of_origin: Country of origin
    - net_quantity: Net weight/volume with unit
    - mrp: Maximum Retail Price
    - packed_date: Date of packing
    - manufacturing_date: Date of manufacture
    - expiry_date: Expiry date
    - consumer_care: Consumer care contact information
    - barcode: Product barcode
    - batch_number: Batch/lot number
    - fssai_license: FSSAI license number
    """

    def __init__(self):
        self._patterns = self._initialize_patterns()

    def _initialize_patterns(self) -> Dict[str, Dict]:
        """Initialize regex patterns for field extraction.
        Handles realistic variations in package declarations:
        - MRP / M.R.P. / Maximum Retail Price
        - Rs / Rs. / ₹
        - Net Qty / Net Quantity / Net Weight / Net Volume / Net Content
        - g / kg / ml / L and spacing variations
        - Mfd. by / Mfg. by / Manufactured by / Manufacturer
        - Pkd. / Packed on / Packing date
        - consumer care / customer care / helpline
        """
        return {
            "mrp": {
                "patterns": [
                    # MRP / M.R.P. / Maximum Retail Price with Rs/₹ and optional colon
                    r"(?:M\.?R\.?P\.?|Maximum\s*Retail\s*Price|Retail\s*Price)\s*[:\-]?\s*(?:Rs\.?|INR\.?|₹)\s*([\d,]+\.?\d*)",
                    r"(?:Rs\.?|₹)\s*([\d,]+\.?\d*)\s*(?:MRP|only)",
                    # Plain "MRP Rs. 30" or "MRP: ₹30"
                    r"\bMRP\s*[:\-]?\s*(?:Rs\.?|₹)?\s*([\d,]+\.?\d*)",
                    # Price followed by MRP keyword
                    r"(?:Rs\.?|₹)\s*([\d,]+\.?\d*)\s*\(?\s*(?:MRP|Incl\.?\s*of\s*all\s*taxes)",
                ],
                "priority": 1
            },
            "net_quantity": {
                "patterns": [
                    # Net Qty / Net Quantity / Net Weight / Net Volume / Net Content
                    r"Net\s*(?:Qty|Quantity|Weight|Volume|Content|Wt\.?)\s*[:\-]?\s*([\d,]+\.?\d*)\s*(g|gm|kgs?|kg|ml|l|ltr|L|LTR|pcs|pieces|gm)",
                    # Just "Net Wt" without colon
                    r"\bNet\s*Wt\.?\s+([\d,]+\.?\d*)\s*(g|gm|kgs?|kg|ml|l|ltr|L|pcs)",
                    # Just "Net" followed by value and unit
                    r"Net\s+([\d,]+\.?\d*)\s*(g|gm|kgs?|kg|ml|l|ltr|L|pcs)\b",
                    # Quantity alone with unit
                    r"\b([\d,]+\.?\d*)\s*(kg|g|gm|ml|l|ltr|L)\b\s*(?:Net|net)?",
                ],
                "priority": 1
            },
            "manufacturer": {
                "patterns": [
                    # Mfd. by / Mfg. by / Manufactured by / Manufacturer
                    r"(?:Manufactured|Mfd\.?|Mfg\.?)\s*by\s*[:\-]?\s*(.+?)(?=\s*(?:\n|,$|Packed|Mfd|Pkd|$))",
                    r"Manufacturer\s*[:\-]?\s*(.+?)(?=\s*(?:\n|,$|Packed|Mfd|Pkd|$))",
                    r"Mfg\.?\s*[:\-]?\s*(.+?)(?=\s*(?:\n|,$|Packed|Mfd|Pkd|$))",
                ],
                "priority": 2
            },
            "packer": {
                "patterns": [
                    # Pkd. / Packed on / Packing date / Packed by
                    r"Packed\s*(?:by|on)?\s*[:\-]?\s*(.+?)(?=\s*(?:\n|,$|Customer|$))",
                    r"Packer\s*[:\-]?\s*(.+?)(?=\s*(?:\n|,$|$))",
                    r"Pkd\.?\s*[:\-]?\s*(.+?)(?=\s*(?:\n|,$|$))",
                ],
                "priority": 2
            },
            "importer": {
                "patterns": [
                    r"Imported\s*by\s*[:\-]?\s*(.+?)(?=\s*(?:\n|,$|$))",
                    r"Importer\s*[:\-]?\s*(.+?)(?=\s*(?:\n|,$|$))",
                ],
                "priority": 2
            },
            "expiry_date": {
                "patterns": [
                    r"(?:Expiry|Exp\.?|Best\s*Before|Use\s*Before|BB)\s*[:\-]?\s*([\d/\-\.]+(?:\s*[\d/\-\.A-Za-z]+)?)",
                    r"EXP\s*[:\-]?\s*([\d/\-\.]+)",
                    r"(?:Exp\.?\s*Date|Expiry\s*Date)\s*[:\-]?\s*([\d/\-\.]+)",
                ],
                "priority": 1
            },
            "manufacturing_date": {
                "patterns": [
                    # Mfg. / Mfd. / Manufactured / Pkd. / Packed on
                    r"(?:Mfg\.?|Manufacture[d]?|Mfd\.?|MFG\.?|MFD\.?)\s*[:\-]?\s*(?:Date\s*[:\-]?\s*)?([\d/\-\.]+)",
                    r"(?:Packed|Pkg\.?|Pkd\.?)\s*(?:on|date)?\s*[:\-]?\s*([\d/\-\.]+)",
                ],
                "priority": 1
            },
            "consumer_care": {
                "patterns": [
                    # consumer care / customer care / helpline
                    r"(?:Consumer|Customer)\s*Care\s*[:\-]?\s*(.+?)(?=\s*(?:\n|$))",
                    r"Helpline\s*[:\-]?\s*(.+?)(?=\s*(?:\n|$))",
                    r"(?:Call|Tel\.?|Phone)\s*[:\-]?\s*(?:\+?\d[\d\s\-]{7,})",
                    r"(?:Toll\s*Free|Tollfree)\s*[:\-]?\s*(\d[\d\s\-]+)",
                ],
                "priority": 1
            },
            "country_of_origin": {
                "patterns": [
                    # country of origin / made in
                    r"Country\s*of\s*Origin\s*[:\-]?\s*(.+?)(?=\s*(?:\n|,|$))",
                    r"Made\s*in\s*[:\-]?\s*(.+?)(?=\s*(?:\n|,|$))",
                    r"COO\s*[:\-]?\s*(.+?)(?=\s*(?:\n|,|$))",
                ],
                "priority": 2
            },
            "batch_number": {
                "patterns": [
                    r"Batch\s*(?:No\.?|Number|#)?\s*[:\-]?\s*([A-Z0-9\-/]+)",
                    r"Lot\s*(?:No\.?|Number|#)?\s*[:\-]?\s*([A-Z0-9\-/]+)",
                ],
                "priority": 1
            },
            "barcode": {
                "patterns": [
                    r"\b([2-9][0-9]{12})\b",  # EAN-13
                    r"\b([0-9]{8})\b",  # UPC-A
                ],
                "priority": 1
            },
            "fssai_license": {
                "patterns": [
                    r"FSSAI\s*(?:License\s*)?(?:No\.?|Number|#)?\s*[:\-]?\s*([0-9]+)",
                ],
                "priority": 2
            }
        }

    def extract_from_ocr(self, ocr_results: List[Dict[str, Any]]) -> Dict[str, ExtractedField]:
        """
        Extract structured fields from OCR results.

        Args:
            ocr_results: List of OCR detections, each containing:
                - text: recognized text string
                - confidence: confidence score (0-1)
                - bbox: [x, y, width, height]

        Returns:
            Dictionary mapping field names to ExtractedField objects
        """
        extracted_fields = {}

        # First, try to extract product name (usually first substantial text)
        product_name_result = self._extract_product_name(ocr_results)
        if product_name_result:
            extracted_fields["product_name"] = product_name_result

        # Try to extract address (usually after manufacturer/packer)
        address_result = self._extract_address(ocr_results)
        if address_result:
            extracted_fields["address"] = address_result

        # Try to extract MRP
        mrp_result = self._extract_mrp(ocr_results)
        if mrp_result:
            extracted_fields["mrp"] = mrp_result

        # Try to extract net quantity
        net_qty_result = self._extract_net_quantity(ocr_results)
        if net_qty_result:
            extracted_fields["net_quantity"] = net_qty_result

        # Extract manufacturer
        mfr_result = self._extract_manufacturer(ocr_results)
        if mfr_result:
            extracted_fields["manufacturer"] = mfr_result

        # Extract packer
        packer_result = self._extract_packer(ocr_results)
        if packer_result:
            extracted_fields["packer"] = packer_result

        # Extract importer
        importer_result = self._extract_importer(ocr_results)
        if importer_result:
            extracted_fields["importer"] = importer_result

        # Extract expiry date
        expiry_result = self._extract_expiry_date(ocr_results)
        if expiry_result:
            extracted_fields["expiry_date"] = expiry_result

        # Extract manufacturing/packed date
        mfg_result = self._extract_manufacturing_date(ocr_results)
        if mfg_result:
            extracted_fields["manufacturing_date"] = mfg_result

        # Extract consumer care
        consumer_result = self._extract_consumer_care(ocr_results)
        if consumer_result:
            extracted_fields["consumer_care"] = consumer_result

        # Extract country of origin
        coo_result = self._extract_country_of_origin(ocr_results)
        if coo_result:
            extracted_fields["country_of_origin"] = coo_result

        # Extract batch number
        batch_result = self._extract_batch_number(ocr_results)
        if batch_result:
            extracted_fields["batch_number"] = batch_result

        # Extract barcode
        barcode_result = self._extract_barcode(ocr_results)
        if barcode_result:
            extracted_fields["barcode"] = barcode_result

        # Extract FSSAI license
        fssai_result = self._extract_fssai_license(ocr_results)
        if fssai_result:
            extracted_fields["fssai_license"] = fssai_result

        return extracted_fields

    def _extract_product_name(self, ocr_results: List[Dict[str, Any]]) -> Optional[ExtractedField]:
        """
        Extract product name (usually the largest/most prominent text at the top of the package).

        Strategy: prefer text that is:
        1. In the top third of the image
        2. Has the largest area among top-positioned candidates
        3. Doesn't start with common label keywords
        """
        if not ocr_results:
            return None

        skip_words = ["MRP", "Net", "Quantity", "Price", "Rs", "Mfg", "Exp", "Best",
                     "Batch", "Lot", "FSSAI", "Customer", "Consumer", "Phone", "Call",
                     "Website", "Email", "Packed", "Imported", "Manufactured",
                     "Country", "Origin", "Address"]

        # First pass: look for text in the top portion of the image
        # If image is 500px tall, look for text in first 200px (top 40%)
        if ocr_results:
            max_y = max(r.get("bbox", [0, 0, 0, 0])[1] for r in ocr_results)
            top_threshold = max_y * 0.45  # Top 45% of the image

            top_candidates = []
            for r in ocr_results:
                y = r.get("bbox", [0, 0, 0, 0])[1]
                if y <= top_threshold:
                    top_candidates.append(r)

            if top_candidates:
                # Among top candidates, pick the largest by area
                top_candidates.sort(
                    key=lambda r: r.get("bbox", [0, 0, 0, 0])[2] * r.get("bbox", [0, 0, 0, 0])[3],
                    reverse=True
                )
                for result in top_candidates[:5]:
                    text = result.get("text", "").strip()
                    confidence = result.get("confidence", 0.0)
                    if len(text) < 3 or text.isdigit():
                        continue
                    if any(text.startswith(word) for word in skip_words):
                        continue
                    return ExtractedField(
                        field_name="product_name",
                        value=text,
                        confidence=confidence,
                        source_text=text,
                        bbox=result.get("bbox", [0, 0, 0, 0])
                    )

        # Fallback: sort by area (largest text likely product name)
        sorted_results = sorted(ocr_results,
                              key=lambda r: r.get("bbox", [0, 0, 0, 0])[2] * r.get("bbox", [0, 0, 0, 0])[3],
                              reverse=True)

        for result in sorted_results[:5]:  # Check top 5 largest
            text = result.get("text", "").strip()
            confidence = result.get("confidence", 0.0)

            # Skip very short texts and numeric-only texts
            if len(text) < 3 or text.isdigit():
                continue

            if any(text.startswith(word) for word in skip_words):
                continue

            return ExtractedField(
                field_name="product_name",
                value=text,
                confidence=confidence,
                source_text=text,
                bbox=result.get("bbox", [0, 0, 0, 0])
            )

        return None

    def _extract_mrp(self, ocr_results: List[Dict[str, Any]]) -> Optional[ExtractedField]:
        """Extract MRP value."""
        patterns = self._patterns["mrp"]["patterns"]

        for result in ocr_results:
            text = result.get("text", "")
            confidence = result.get("confidence", 0.0)
            bbox = result.get("bbox", [0, 0, 0, 0])

            for pattern in patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    value_str = match.group(1).replace(",", "").strip()
                    try:
                        value = float(value_str)
                        return ExtractedField(
                            field_name="mrp",
                            value=value,
                            confidence=confidence,
                            source_text=text,
                            bbox=bbox,
                            currency="INR"
                        )
                    except ValueError:
                        continue

        return None

    def _extract_net_quantity(self, ocr_results: List[Dict[str, Any]]) -> Optional[ExtractedField]:
        """Extract net quantity with unit."""
        patterns = self._patterns["net_quantity"]["patterns"]

        for result in ocr_results:
            text = result.get("text", "")
            confidence = result.get("confidence", 0.0)
            bbox = result.get("bbox", [0, 0, 0, 0])

            for pattern in patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    try:
                        if match.lastindex and match.lastindex >= 2:
                            value_str = match.group(1).replace(",", "").strip()
                            unit = match.group(2).lower().strip()
                            value = float(value_str)
                        elif match.lastindex == 1:
                            # Single group - could be value or unit
                            captured = match.group(1)
                            # Check if it's a number or a unit
                            try:
                                value = float(captured.replace(",", ""))
                                # Look for unit in same text
                                unit = self._extract_unit_from_text(text)
                                if unit is None:
                                    continue
                            except ValueError:
                                # It's a unit, no value yet
                                continue
                        else:
                            continue

                        return ExtractedField(
                            field_name="net_quantity",
                            value=value,
                            confidence=confidence,
                            source_text=text,
                            bbox=bbox,
                            unit=unit
                        )
                    except (ValueError, IndexError):
                        continue

        return None

    def _extract_unit_from_text(self, text: str) -> Optional[str]:
        """Extract unit from text (kg, g, ml, l, pcs)."""
        unit_match = re.search(
            r"\b(kg|kilo|kilogram|gm|g\b|gram|ml|l\b|liter|litre|ltr|pcs|pieces)\b",
            text,
            re.IGNORECASE,
        )
        if unit_match:
            unit = unit_match.group(1).lower()
            if unit in ("kilo", "kilogram"):
                return "kg"
            elif unit in ("gram", "g"):
                return "g"
            elif unit in ("liter", "litre", "ltr"):
                return "l"
            return unit
        return None

    def _extract_manufacturer(self, ocr_results: List[Dict[str, Any]]) -> Optional[ExtractedField]:
        """Extract manufacturer name."""
        patterns = self._patterns["manufacturer"]["patterns"]
        return self._extract_by_pattern(ocr_results, "manufacturer", patterns)

    def _extract_packer(self, ocr_results: List[Dict[str, Any]]) -> Optional[ExtractedField]:
        """Extract packer name."""
        patterns = self._patterns["packer"]["patterns"]
        return self._extract_by_pattern(ocr_results, "packer", patterns)

    def _extract_importer(self, ocr_results: List[Dict[str, Any]]) -> Optional[ExtractedField]:
        """Extract importer name."""
        patterns = self._patterns["importer"]["patterns"]
        return self._extract_by_pattern(ocr_results, "importer", patterns)

    def _extract_expiry_date(self, ocr_results: List[Dict[str, Any]]) -> Optional[ExtractedField]:
        """Extract expiry date."""
        patterns = self._patterns["expiry_date"]["patterns"]
        return self._extract_by_pattern(ocr_results, "expiry_date", patterns)

    def _extract_manufacturing_date(self, ocr_results: List[Dict[str, Any]]) -> Optional[ExtractedField]:
        """Extract manufacturing/packing date."""
        patterns = self._patterns["manufacturing_date"]["patterns"]
        return self._extract_by_pattern(ocr_results, "manufacturing_date", patterns)

    def _extract_consumer_care(self, ocr_results: List[Dict[str, Any]]) -> Optional[ExtractedField]:
        """Extract consumer care contact information."""
        patterns = self._patterns["consumer_care"]["patterns"]
        return self._extract_by_pattern(ocr_results, "consumer_care", patterns)

    def _extract_country_of_origin(self, ocr_results: List[Dict[str, Any]]) -> Optional[ExtractedField]:
        """Extract country of origin."""
        patterns = self._patterns["country_of_origin"]["patterns"]
        return self._extract_by_pattern(ocr_results, "country_of_origin", patterns)

    def _extract_batch_number(self, ocr_results: List[Dict[str, Any]]) -> Optional[ExtractedField]:
        """Extract batch/lot number."""
        patterns = self._patterns["batch_number"]["patterns"]
        return self._extract_by_pattern(ocr_results, "batch_number", patterns)

    def _extract_barcode(self, ocr_results: List[Dict[str, Any]]) -> Optional[ExtractedField]:
        """Extract barcode number."""
        patterns = self._patterns["barcode"]["patterns"]
        return self._extract_by_pattern(ocr_results, "barcode", patterns)

    def _extract_fssai_license(self, ocr_results: List[Dict[str, Any]]) -> Optional[ExtractedField]:
        """Extract FSSAI license number."""
        patterns = self._patterns["fssai_license"]["patterns"]
        return self._extract_by_pattern(ocr_results, "fssai_license", patterns)

    def _extract_address(self, ocr_results: List[Dict[str, Any]]) -> Optional[ExtractedField]:
        """Extract address (usually follows manufacturer/packer)."""
        # Look for address patterns (pin codes, city names, common address formats)
        address_patterns = [
            r"\d{6}",  # Indian PIN code
            r"[A-Z][a-z]+\s*,?\s*[A-Z]{2}\s*\d{6}",
        ]

        for result in ocr_results:
            text = result.get("text", "")
            confidence = result.get("confidence", 0.0)
            bbox = result.get("bbox", [0, 0, 0, 0])

            for pattern in address_patterns:
                if re.search(pattern, text):
                    return ExtractedField(
                        field_name="address",
                        value=text.strip(),
                        confidence=confidence,
                        source_text=text,
                        bbox=bbox
                    )

        return None

    def _extract_by_pattern(self, ocr_results: List[Dict[str, Any]],
                           field_name: str,
                           patterns: List[str]) -> Optional[ExtractedField]:
        """Generic pattern-based extraction."""
        for result in ocr_results:
            text = result.get("text", "")
            confidence = result.get("confidence", 0.0)
            bbox = result.get("bbox", [0, 0, 0, 0])

            for pattern in patterns:
                match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
                if match:
                    value = match.group(1).strip()

                    # Clean up the value
                    value = re.sub(r'\s+', ' ', value).strip()
                    value = value.rstrip('.,;')

                    if len(value) > 0:
                        return ExtractedField(
                            field_name=field_name,
                            value=value,
                            confidence=confidence,
                            source_text=text,
                            bbox=bbox
                        )

        return None

    def to_serializable_dict(self, fields: Dict[str, ExtractedField]) -> Dict[str, Dict[str, Any]]:
        """Convert extracted fields to JSON-serializable dictionary."""
        result = {}
        for name, field in fields.items():
            result[name] = {
                "value": field.value,
                "confidence": field.confidence,
                "source_text": field.source_text,
                "bbox": field.bbox
            }
            if field.unit:
                result[name]["unit"] = field.unit
            if field.currency:
                result[name]["currency"] = field.currency
            if field.metadata:
                result[name]["metadata"] = field.metadata
        return result