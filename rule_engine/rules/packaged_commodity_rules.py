from typing import Dict, Any, List

class LegalMetrologyRuleEngine:
    """
    Core Compliance Evaluator for Packaged Commodities Rules 2011.
    """
    def __init__(self):
        self.mandatory_fields = [
            "MRP",
            "NET_QUANTITY",
            "MFG_DATE",
            "MANUFACTURER_DETAILS",
            "COUNTRY_OF_ORIGIN",
            "CONSUMER_CARE"
        ]

    def evaluate(self, extracted_declarations: Dict[str, Any]) -> Dict[str, Any]:
        violations = []
        for field in self.mandatory_fields:
            if field not in extracted_declarations:
                violations.append({
                    "rule_id": f"MISSING_{field}",
                    "severity": "CRITICAL",
                    "description": f"Mandatory declaration '{field}' is missing from package label.",
                    "legal_reference": "Rule 6, Legal Metrology (Packaged Commodities) Rules, 2011"
                })
        
        status = "PASS" if len(violations) == 0 else "POTENTIAL_ISSUE"
        return {
            "status": status,
            "violations": violations
        }
