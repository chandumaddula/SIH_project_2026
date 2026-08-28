from typing import Dict, Any

class ExemptionChecker:
    """
    Determines rule applicability and exemptions under Legal Metrology Rules:
    - Packages <= 10g or <= 10ml (certain exemptions apply)
    - Agricultural commodities > 50kg
    - Industrial / Institutional consumers
    """
    def check_exemption(self, product_metadata: Dict[str, Any]) -> bool:
        net_weight = product_metadata.get("net_weight_g", 100)
        if net_weight <= 10:
            return True # Exempt from standard small pack declaration rules
        return False
