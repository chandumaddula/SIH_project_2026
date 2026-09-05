import re
from typing import Optional, Dict, Any

def detect_quantity_statement(raw_text: str) -> Optional[Dict[str, Any]]:
    """Detects Net Quantity value and unit statement (Rule 6(1)(c))."""
    match = re.search(r"(?:Net\s*Qty|Net\s*Quantity|Quantity)[\s:]*([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z]+)", raw_text, re.IGNORECASE)
    if match:
        return {
            "value": match.group(1),
            "unit": match.group(2),
            "raw_match": match.group(0)
        }
    return None
