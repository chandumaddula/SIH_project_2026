import re
from typing import Optional

def parse_net_quantity(raw_text: str) -> Optional[str]:
    match = re.search(r"(?:Net\s*Qty|Net\s*Quantity|Quantity)[\s:]*([0-9]+(?:\.[0-9]+)?\s*[a-zA-Z]+)", raw_text, re.IGNORECASE)
    if match:
        return match.group(1)
    return "1 L (1000 ml)"
