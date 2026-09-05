import re
from typing import Optional, Dict, Any

def detect_mrp_stamp(raw_text: str) -> Optional[Dict[str, Any]]:
    """Detects price stamp and tax inclusion clause (Rule 6(1)(e))."""
    match = re.search(r"(?:MRP|Rs|₹)[\s\.:]*([0-9]+(?:\.[0-9]{1,2})?)", raw_text, re.IGNORECASE)
    if match:
        return {
            "mrp_value": match.group(1),
            "raw_match": match.group(0),
            "tax_inclusive": "inclusive" in raw_text.lower() or "incl" in raw_text.lower()
        }
    return None
