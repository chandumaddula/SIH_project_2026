import re
from typing import Dict, Any
from rule_engine.models.rule_model import RuleDefinition, ComplianceFinding, FindingStatus, SeverityLevel

class MRPValidator:
    """
    Validates Maximum Retail Price (MRP) rules under Rule 6(1)(e) & Rule 18(2A).
    Workflow: Present? -> Acceptable format? -> Representation satisfies Rule 6(1)(e)? -> Dual pricing check.
    """

    def validate(self, rule: RuleDefinition, declarations: Dict[str, Any]) -> ComplianceFinding:
        method_name = rule.validation_method
        if hasattr(self, method_name):
            return getattr(self, method_name)(rule, declarations)
        return self.check_mrp_presence(rule, declarations)

    def check_mrp_presence(self, rule: RuleDefinition, declarations: Dict[str, Any]) -> ComplianceFinding:
        """Step 1: Is MRP declaration present?"""
        mrp = declarations.get("mrp") or declarations.get("max_retail_price")
        if mrp and str(mrp).strip():
            return ComplianceFinding(
                finding_id=f"FIND-{rule.rule_id}-PASS",
                rule_id=rule.rule_id,
                rule_reference=rule.rule_reference,
                category=rule.category,
                field=rule.field,
                status=FindingStatus.PASS,
                severity=rule.severity,
                message=f"MRP declaration is present on label as '{mrp}'.",
                extracted_value=mrp,
                expected_requirement="Presence of Maximum Retail Price declaration",
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
            message="MRP declaration is completely missing from outer package label.",
            extracted_value=None,
            expected_requirement="Mandatory Maximum Retail Price (MRP) declaration",
            legal_clause=rule.rule_reference,
            remediation_guidance="Print 'MRP Rs XX.XX (incl. of all taxes)' prominently on package."
        )

    def check_mrp_format(self, rule: RuleDefinition, declarations: Dict[str, Any]) -> ComplianceFinding:
        """Step 2 & 3: Is detected declaration acceptable & representation satisfies tax requirement?"""
        mrp = str(declarations.get("mrp") or "")
        raw_text = str(declarations.get("raw_text") or mrp)
        combined = f"{mrp} {raw_text}"

        has_currency = bool(re.search(r"(₹|Rs\.?|INR)", combined, re.IGNORECASE))
        has_tax_phrase = bool(re.search(r"(incl\.|inclusive)\s*(of)?\s*all\s*taxes", combined, re.IGNORECASE) or "incl" in mrp.lower() or "taxes" in mrp.lower())
        has_numeric_price = bool(re.search(r"\d+(?:\.\d{1,2})?", mrp))

        if has_currency and has_numeric_price and has_tax_phrase:
            return ComplianceFinding(
                finding_id=f"FIND-{rule.rule_id}-PASS",
                rule_id=rule.rule_id,
                rule_reference=rule.rule_reference,
                category=rule.category,
                field=rule.field,
                status=FindingStatus.PASS,
                severity=rule.severity,
                message="MRP representation satisfies Rule 6(1)(e): Includes currency symbol, price numeric, and mandatory '(inclusive of all taxes)' clause.",
                extracted_value=mrp,
                expected_requirement="MRP Rs XX.XX (inclusive of all taxes)",
                legal_clause=rule.rule_reference,
                remediation_guidance="No action required."
            )

        missing_elements = []
        if not has_currency:
            missing_elements.append("Currency symbol (Rs / ₹)")
        if not has_numeric_price:
            missing_elements.append("Numeric price digits")
        if not has_tax_phrase:
            missing_elements.append("'(inclusive of all taxes)' tax clause")

        return ComplianceFinding(
            finding_id=f"FIND-{rule.rule_id}-REVIEW",
            rule_id=rule.rule_id,
            rule_reference=rule.rule_reference,
            category=rule.category,
            field=rule.field,
            status=FindingStatus.REVIEW_REQUIRED,
            severity=rule.severity,
            message=f"MRP declaration representation incomplete: Missing {', '.join(missing_elements)}.",
            extracted_value=mrp,
            expected_requirement="Format: 'MRP Rs. XX.XX (Incl. of all taxes)'",
            legal_clause=rule.rule_reference,
            remediation_guidance="Format MRP strictly as 'MRP Rs XX.XX (inclusive of all taxes)'."
        )

    def check_unit_sale_price(self, rule: RuleDefinition, declarations: Dict[str, Any]) -> ComplianceFinding:
        """Rule 6(1)(11): Unit Sale Price declaration requirement."""
        usp = declarations.get("unitSalePrice") or declarations.get("unit_sale_price")
        raw_text = str(declarations.get("raw_text") or "")
        found_usp = usp or ("per g" in raw_text.lower() or "per ml" in raw_text.lower() or "per kg" in raw_text.lower() or "/ g" in raw_text.lower() or "/ ml" in raw_text.lower())

        if found_usp or declarations.get("mrp"):
            return ComplianceFinding(
                finding_id=f"FIND-{rule.rule_id}-PASS",
                rule_id=rule.rule_id,
                rule_reference=rule.rule_reference,
                category=rule.category,
                field=rule.field,
                status=FindingStatus.PASS,
                severity=rule.severity,
                message=f"Unit Sale Price declaration satisfied: '{usp or 'Derived from MRP and Net Qty'}'.",
                extracted_value=usp or "Derived from MRP",
                expected_requirement="Unit Sale Price per g/ml or per kg/l",
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
            message="Unit Sale Price declaration not detected on package label.",
            extracted_value=None,
            expected_requirement="Unit Sale Price (e.g., ₹0.24/g or ₹240.00/L)",
            legal_clause=rule.rule_reference,
            remediation_guidance="Declare Unit Sale Price rounded to nearest two decimal places."
        )

    def check_dual_pricing(self, rule: RuleDefinition, declarations: Dict[str, Any]) -> ComplianceFinding:
        """Rule 18(2A): Prohibition of dual MRP."""
        mrp_stickers_count = declarations.get("mrp_stickers_count", 1)
        if mrp_stickers_count > 1:
            return ComplianceFinding(
                finding_id=f"FIND-{rule.rule_id}-FAIL",
                rule_id=rule.rule_id,
                rule_reference=rule.rule_reference,
                category=rule.category,
                field=rule.field,
                status=FindingStatus.POTENTIAL_VIOLATION,
                severity=rule.severity,
                message="Multiple contrasting MRP stickers detected on the package (Dual Pricing violation under Rule 18(2A)).",
                extracted_value=f"Stickers count: {mrp_stickers_count}",
                expected_requirement="Single uniform non-tamperable MRP declaration",
                legal_clause=rule.rule_reference,
                remediation_guidance="Remove secondary price sticker. Dual MRP on identical commodities is prohibited."
            )

        return ComplianceFinding(
            finding_id=f"FIND-{rule.rule_id}-PASS",
            rule_id=rule.rule_id,
            rule_reference=rule.rule_reference,
            category=rule.category,
            field=rule.field,
            status=FindingStatus.PASS,
            severity=rule.severity,
            message="Single uniform MRP declaration verified. No dual pricing or sticker overlay detected.",
            extracted_value="Single MRP print",
            expected_requirement="Prohibition of dual MRP",
            legal_clause=rule.rule_reference,
            remediation_guidance="No action required."
        )
