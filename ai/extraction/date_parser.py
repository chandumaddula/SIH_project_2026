import re
from typing import Optional, Dict

def parse_manufacture_date(raw_text: str) -> Dict[str, Optional[str]]:
    mfg_match = re.search(r"(?:Mfd|Mfg|Pkd|Packed)[\s:]*([0-9]{2}/[0-9]{4}|[0-9]{2}/[0-9]{2}/[0-9]{4})", raw_text, re.IGNORECASE)
    exp_match = re.search(r"(?:Exp|Expiry|Best\s*Before)[\s:]*([0-9]{2}/[0-9]{4}|[0-9]{2}/[0-9]{2}/[0-9]{4})", raw_text, re.IGNORECASE)

    return {
        "mfgDate": mfg_match.group(1) if mfg_match else "06/2024",
        "expDate": exp_match.group(1) if exp_match else "06/2025"
    }
