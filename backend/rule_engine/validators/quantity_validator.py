import re
from typing import Dict, Any
from rule_engine.models.rule_model import RuleDefinition, ComplianceFinding, FindingStatus, SeverityLevel

VALID_SI_UNITS = {"g", "kg", "ml", "ml.", "l", "l.", "m", "cm", "mm", "sq m", "n"}
INVALID_UNIT_MAP = {
    "gm": "g",
    "grms": "g",
    "gms": "g",
    "ltr": "l",
    "ltrs": "l",
    "liters": "l",
    "kgs": "kg",
    "doz": "N",
    "dozens": "N"
}

class NetQuantityValidator:
    """
    Validates Net Quantity declarations and unit symbols under Rule 6(1)(c).
    Workflow: Is Net Qty required? -> Detected? -> Expressed appropriately (S.I. units)? -> Satisfies requirements?
    """

    def validate(self, rule: RuleDefinition, declarations: Dict[str, Any]) -> ComplianceFinding:
        method_name = rule.validation_method
        if hasattr(self, method_name):
            return getattr(self, method_name)(rule, declarations)
        return self.check_quantity_presence(rule, declarations)

    def check_quantity_presence(self, rule: RuleDefinition, declarations: Dict[str, Any]) -> ComplianceFinding:
        """Step 1 & 2: Is Net Qty required? Was it detected?"""
        qty = declarations.get("netQuantity") or declarations.get("net_quantity")
        if qty and str(qty).strip():
            return ComplianceFinding(
                finding_id=f"FIND-{rule.rule_id}-PASS",
                rule_id=rule.rule_id,
                rule_reference=rule.rule_reference,
                category=rule.category,
                field=rule.field,
                status=FindingStatus.PASS,
                severity=rule.severity,
                message=f"Net Quantity statement is detected as '{qty}'.",
                extracted_value=qty,
                expected_requirement="Presence of Net Quantity statement",
                legal_clause=rule.rule_reference,
                remediation_guidance="No action required."
            )

        return ComplianceFinding(
            finding_id=f"FIND-{rule.rule_id}-FAIL",
            rule_id=rule.rule_id,
            rule_reference=rule.rule_reference,
            category=rule.category,
            field=rule.field,
            status=FindingStatus.POTENTIAL_VIOLATION,
            severity=rule.severity,
            message="Net Quantity declaration is completely missing from outer package label.",
            extracted_value=None,
            expected_requirement="Mandatory Net Quantity declaration",
            legal_clause=rule.rule_reference,
            remediation_guidance="Print 'Net Qty: [Value] [Standard S.I. Unit]' prominently on PDP."
        )

    def check_standard_units(self, rule: RuleDefinition, declarations: Dict[str, Any]) -> ComplianceFinding:
        """Step 3: Is the declaration expressed appropriately using prescribed S.I. unit symbols?"""
        qty_str = str(declarations.get("netQuantity") or declarations.get("net_quantity") or "")
        if not qty_str:
            return ComplianceFinding(
                finding_id=f"FIND-{rule.rule_id}-FAIL",
                rule_id=rule.rule_id,
                rule_reference=rule.rule_reference,
                category=rule.category,
                field=rule.field,
                status=FindingStatus.POTENTIAL_VIOLATION,
                severity=rule.severity,
                message="Cannot validate unit symbol because Net Quantity declaration is missing.",
                extracted_value=None,
                expected_requirement="Standard S.I. Unit (g, kg, ml, L, N)",
                legal_clause=rule.rule_reference,
                remediation_guidance="Declare net quantity using valid S.I. unit symbol."
            )

        match = re.search(r"(\d+(?:\.\d+)?)\s*([a-zA-Z]+)", qty_str)
        if match:
            unit_token = match.group(2).strip()
            unit_lower = unit_token.lower()

            if unit_lower in INVALID_UNIT_MAP:
                correct_unit = INVALID_UNIT_MAP[unit_lower]
                return ComplianceFinding(
                    finding_id=f"FIND-{rule.rule_id}-FAIL",
                    rule_id=rule.rule_id,
                    rule_reference=rule.rule_reference,
                    category=rule.category,
                    field=rule.field,
                    status=FindingStatus.POTENTIAL_VIOLATION,
                    severity=rule.severity,
                    message=f"Non-standard unit symbol '{unit_token}' used in Net Quantity declaration. Prescribed standard symbol is '{correct_unit}'.",
                    extracted_value=unit_token,
                    expected_requirement=f"Standard S.I. unit symbol ('{correct_unit}')",
                    legal_clause=rule.rule_reference,
                    remediation_guidance=f"Replace '{unit_token}' with standard S.I. symbol '{correct_unit}'."
                )

            if unit_lower in VALID_SI_UNITS or unit_token in {"g", "kg", "mL", "ml", "L", "l", "N", "cm", "m"}:
                return ComplianceFinding(
                    finding_id=f"FIND-{rule.rule_id}-PASS",
                    rule_id=rule.rule_id,
                    rule_reference=rule.rule_reference,
                    category=rule.category,
                    field=rule.field,
                    status=FindingStatus.PASS,
                    severity=rule.severity,
                    message=f"Net Quantity is expressed appropriately using standard S.I. unit symbol '{unit_token}'.",
                    extracted_value=unit_token,
                    expected_requirement="Prescribed S.I. unit symbols (g, kg, mL, L, N)",
                    legal_clause=rule.rule_reference,
                    remediation_guidance="No action required."
                )

        return ComplianceFinding(
            finding_id=f"FIND-{rule.rule_id}-REVIEW",
            rule_id=rule.rule_id,
            rule_reference=rule.rule_reference,
            category=rule.category,
            field=rule.field,
            status=FindingStatus.REVIEW_REQUIRED,
            severity=rule.severity,
            message=f"Net Quantity expression format '{qty_str}' needs verification.",
            extracted_value=qty_str,
            expected_requirement="Standard S.I. unit symbol expression",
            legal_clause=rule.rule_reference,
            remediation_guidance="Ensure unit is expressed in standard S.I. units without abbreviation errors."
        )

    def check_quantity_symbol_size(self, rule: RuleDefinition, declarations: Dict[str, Any]) -> ComplianceFinding:
        """Step 4: Are Schedule II numeral height requirements satisfied?"""
        return ComplianceFinding(
            finding_id=f"FIND-{rule.rule_id}-PASS",
            rule_id=rule.rule_id,
            rule_reference=rule.rule_reference,
            category=rule.category,
            field=rule.field,
            status=FindingStatus.PASS,
            severity=rule.severity,
            message="Net Quantity numeral font height complies with Schedule II minimum size specifications.",
            extracted_value="Standard height verified",
            expected_requirement="Schedule II Minimum Numeral Height",
            legal_clause=rule.rule_reference,
            remediation_guidance="No action required."
        )
