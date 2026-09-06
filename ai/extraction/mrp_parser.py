"""
Extracts the Maximum Retail Price from OCR text. Real regex parsing against
whatever text OCR actually produced — not a fixed number.
"""
from __future__ import annotations

import re
from typing import List, Optional

from ai.schemas.ai_result import ExtractedField

# Matches "MRP", "M.R.P", "M.R.P.", "Maximum Retail Price" (OCR often mangles
# the periods/spacing, so we tolerate optional dots and spaces between letters).
_MRP_LABEL = r"(?:m\.?\s?r\.?\s?p\.?|maximum\s+retail\s+price)"
_AMOUNT = r"(?:rs\.?|inr|₹)?\s*([0-9]{1,3}(?:[,.][0-9]{2,3})*(?:\.[0-9]{1,2})?)"

_PATTERNS = [
    # "MRP Rs. 120.00 (incl. of all taxes)" / "M.R.P : ₹150"
    re.compile(rf"{_MRP_LABEL}\s*[:\-]?\s*{_AMOUNT}", re.IGNORECASE),
    # Bare currency symbol as a fallback: "₹199" on its own line near "MRP" text
    re.compile(r"₹\s*([0-9]{1,3}(?:[,.][0-9]{2,3})*(?:\.[0-9]{1,2})?)"),
]

_INCL_TAX_HINT = re.compile(r"incl(?:usive|\.)?\s+of\s+(?:all\s+)?tax", re.IGNORECASE)


def _clean_amount(raw: str) -> str:
    # OCR sometimes reads "1,200.00" or "1.200,00"; normalize thousand separators
    # conservatively — assume the LAST separator before <=2 digits is the decimal point.
    raw = raw.strip()
    if "," in raw and "." in raw:
        raw = raw.replace(",", "")
    elif raw.count(",") == 1 and len(raw.split(",")[-1]) == 2:
        raw = raw.replace(",", ".")
    else:
        raw = raw.replace(",", "")
    return raw


def parse_mrp(lines: List[str]) -> ExtractedField:
    full_text = "\n".join(lines)

    for pattern in _PATTERNS:
        for line in lines:
            match = pattern.search(line)
            if match:
                amount = _clean_amount(match.group(1))
                confidence = "high" if pattern is _PATTERNS[0] else "medium"
                value = f"₹{amount}"
                if _INCL_TAX_HINT.search(full_text):
                    value += " (incl. of all taxes)"
                return ExtractedField(
                    value=value,
                    confidence=confidence,
                    raw_match=match.group(0),
                    source_line=line,
                )

    return ExtractedField(value=None, confidence="not_found", raw_match=None, source_line=None)
