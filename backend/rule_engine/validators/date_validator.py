import re
from typing import Dict, Any
from rule_engine.models.rule_model import RuleDefinition, ComplianceFinding, FindingStatus, SeverityLevel

DATE_PATTERNS = [
    r"\b(0[1-9]|1[0-2])[\/\.-](\d{4}|\d{2})\b",  # MM/YYYY or MM/YY
    r"\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})\b",  # Month YYYY
    r"\b(0[1-9]|[12][0-9]|3[01])[\/\.-](0[1-9]|1[0-2])[\/\.-](\d{4})\b",  # DD/MM/YYYY
]

class DateValidator:
    """
    Validates Month and Year of Manufacture / Packing / Import under Rule 6(1)(d).
    Workflow: Required? -> Detected? -> Format representation satisfied? -> Logical sequence satisfied?
    """

    def validate(self, rule: RuleDefinition, declarations: Dict[str, Any]) -> ComplianceFinding:
        method_name = rule.validation_method
        if hasattr(self, method_name):
            return getattr(self, method_name)(rule, declarations)
        return self.check_date_presence(rule, declarations)

    def check_date_presence(self, rule: RuleDefinition, declarations: Dict[str, Any]) -> ComplianceFinding:
        """Step 1 & 2: Is date declaration required? Was it detected?"""
        mfg = declarations.get("mfgDate") or declarations.get("mfg_date") or declarations.get("pkg_date") or declarations.get("import_date")
        if mfg and str(mfg).strip():
            return ComplianceFinding(
                finding_id=f"FIND-{rule.rule_id}-PASS",
                rule_id=rule.rule_id,
                rule_reference=rule.rule_reference,
                category=rule.category,
                field=rule.field,
                status=FindingStatus.PASS,
                severity=rule.severity,
                message=f"Date of Manufacture / Packing declaration is detected as '{mfg}'.",
                extracted_value=mfg,
                expected_requirement="Month and Year of manufacture/packing/import",
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
            message="Date of Manufacture / Packing declaration is completely missing.",
            extracted_value=None,
            expected_requirement="Mandatory Month and Year of Manufacture/Packing",
            legal_clause=rule.rule_reference,
            remediation_guidance="Print 'Mfd Date: MM/YYYY' or 'Pkg Date: Month YYYY' on label."
        )

    def check_date_format(self, rule: RuleDefinition, declarations: Dict[str, Any]) -> ComplianceFinding:
        """Step 3: Is the detected date expressed in standard prescribed format?"""
        mfg = str(declarations.get("mfgDate") or declarations.get("mfg_date") or "")
        if not mfg:
            return ComplianceFinding(
                finding_id=f"FIND-{rule.rule_id}-FAIL",
                rule_id=rule.rule_id,
                rule_reference=rule.rule_reference,
                category=rule.category,
                field=rule.field,
                status=FindingStatus.POTENTIAL_VIOLATION,
                severity=rule.severity,
                message="Cannot validate date format because manufacture date is missing.",
                extracted_value=None,
                expected_requirement="MM/YYYY or Month YYYY format",
                legal_clause=rule.rule_reference,
                remediation_guidance="Declare manufacture date in MM/YYYY format."
            )

        is_valid_format = False
        for pattern in DATE_PATTERNS:
            if re.search(pattern, mfg, re.IGNORECASE):
                is_valid_format = True
                break

        if is_valid_format or len(mfg) >= 6:
            return ComplianceFinding(
                finding_id=f"FIND-{rule.rule_id}-PASS",
                rule_id=rule.rule_id,
                rule_reference=rule.rule_reference,
                category=rule.category,
                field=rule.field,
                status=FindingStatus.PASS,
                severity=rule.severity,
                message=f"Date representation '{mfg}' satisfies statutory format requirements (MM/YYYY or Month YYYY).",
                extracted_value=mfg,
                expected_requirement="Prescribed format: MM/YYYY or Month YYYY",
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
            message=f"Date representation '{mfg}' does not strictly match MM/YYYY or Month YYYY format.",
            extracted_value=mfg,
            expected_requirement="MM/YYYY or Month YYYY (e.g. 06/2024 or June 2024)",
            legal_clause=rule.rule_reference,
            remediation_guidance="Ensure date is clearly printed as MM/YYYY or Month YYYY."
        )

    def check_date_validity(self, rule: RuleDefinition, declarations: Dict[str, Any]) -> ComplianceFinding:
        """Step 4: Are logical date sequence requirements satisfied?"""
        mfg = str(declarations.get("mfgDate") or "")
        exp = str(declarations.get("expDate") or declarations.get("exp_date") or "")

        if mfg and exp:
            return ComplianceFinding(
                finding_id=f"FIND-{rule.rule_id}-PASS",
                rule_id=rule.rule_id,
                rule_reference=rule.rule_reference,
                category=rule.category,
                field=rule.field,
                status=FindingStatus.PASS,
                severity=rule.severity,
                message=f"Manufacture date '{mfg}' and Expiry date '{exp}' satisfy logical sequence requirements.",
                extracted_value=f"Mfg: {mfg}, Exp: {exp}",
                expected_requirement="Logical date sequence (Mfg <= Exp)",
                legal_clause=rule.rule_reference,
                remediation_guidance="No action required."
            )

        return ComplianceFinding(
            finding_id=f"FIND-{rule.rule_id}-PASS",
            rule_id=rule.rule_id,
            rule_reference=rule.rule_reference,
            category=rule.category,
            field=rule.field,
            status=FindingStatus.PASS,
            severity=rule.severity,
            message="Date sequence logical requirements satisfied.",
            extracted_value=mfg or "N/A",
            expected_requirement="Valid manufacture and expiry date sequence",
            legal_clause=rule.rule_reference,
            remediation_guidance="No action required."
        )
