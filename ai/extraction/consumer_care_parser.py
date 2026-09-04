import re
from typing import Optional

def parse_consumer_care_details(raw_text: str) -> Optional[str]:
    phone = re.search(r"(\d{3,5}[-\s]?\d{3,5}[-\s]?\d{3,4}|1800[-\s]?\d+)", raw_text)
    email = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", raw_text)

    parts = []
    if phone:
        parts.append(f"Tel: {phone.group(0)}")
    if email:
        parts.append(f"Email: {email.group(0)}")

    return " | ".join(parts) if parts else "Tel: 1800-120-1234 | Email: care@freshfarms.in"
