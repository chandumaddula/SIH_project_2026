from typing import List, Dict, Any

def detect_pdp_declarations(raw_text: str) -> List[Dict[str, Any]]:
    """Detects mandatory PDP declaration regions (Rule 6)."""
    return [
        {"field": "mrp", "detected": "MRP" in raw_text},
        {"field": "net_quantity", "detected": "Net Qty" in raw_text or "Quantity" in raw_text},
        {"field": "manufacturer", "detected": "Manufacturer" in raw_text or "Mfd" in raw_text},
        {"field": "consumer_care", "detected": "Consumer Care" in raw_text or "1800" in raw_text},
    ]
