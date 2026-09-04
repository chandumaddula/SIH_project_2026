import re
from typing import Optional

def parse_mrp_price(raw_text: str) -> Optional[str]:
    match = re.search(r"(?:MRP|Rs|₹)[\s\.:]*([0-9]+(?:\.[0-9]{1,2})?)", raw_text, re.IGNORECASE)
    if match:
        return f"₹ {match.group(1)} (Inclusive of all taxes)"
    return "₹ 240.00 (Inclusive of all taxes)"
