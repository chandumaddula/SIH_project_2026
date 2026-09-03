import re
from typing import Dict, Any, Optional
from rule_engine.models.rule_model import RuleDefinition, ComplianceFinding, FindingStatus, SeverityLevel

class DeclarationValidator:
    """
    Validates general mandatory declarations (Manufacturer, Address, Generic Name, Country of Origin, Consumer Care).
    Follows workflow: Required? -> Detected? -> Complete? -> Satisfies legal requirements.
    """

    def validate(self, rule: RuleDefinition, declarations: Dict[str, Any]) -> ComplianceFinding:
        method_name = rule.validation_method
        if hasattr(self, method_name):
            return getattr(self, method_name)(rule, declarations)

        return self.check_generic_presence(rule, declarations)

    def check_manufacturer_presence(self, rule: RuleDefinition, declarations: Dict[str, Any]) -> ComplianceFinding:
        """Rule 6(1)(a): Required? -> Detected? -> Complete (Legal identity)?"""
        mfg = declarations.get("manufacturer") or declarations.get("packer") or declarations.get("importer")

        # Step 1: Was it detected?
        if not mfg or not str(mfg).strip():
            return ComplianceFinding(
                finding_id=f"FIND-{rule.rule_id}-FAIL",
                rule_id=rule.rule_id,
                rule_reference=rule.rule_reference,
                category=rule.category,
                field=rule.field,
                status=FindingStatus.POTENTIAL_VIOLATION,
                severity=rule.severity,
                message="Mandatory declaration of Manufacturer/Packer name is missing from label.",
                extracted_value=None,
                expected_requirement="Complete Name & Address of Manufacturer or Packer",
                legal_clause=rule.rule_reference,
                remediation_guidance="Print full legal name and registered address of Manufacturer/Packer on package."
            )

        # Step 2: Satisfies legal requirements?
        mfg_str = str(mfg).strip()
        return ComplianceFinding(
            finding_id=f"FIND-{rule.rule_id}-PASS",
            rule_id=rule.rule_id,
            rule_reference=rule.rule_reference,
            category=rule.category,
            field=rule.field,
            status=FindingStatus.PASS,
            severity=rule.severity,
            message=f"Manufacturer/Packer legal name is clearly declared as '{mfg_str}'.",
            extracted_value=mfg_str,
            expected_requirement="Name & Address of Manufacturer/Packer",
            legal_clause=rule.rule_reference,
            remediation_guidance="No action required."
        )

    def check_address_details(self, rule: RuleDefinition, declarations: Dict[str, Any]) -> ComplianceFinding:
        """Rule 6(1)(a): Address completeness (Street/Plot, City, State, 6-digit PIN code)."""
        address = declarations.get("address") or declarations.get("manufacturerAddress")
        mfg_text = str(declarations.get("manufacturer") or "")

        combined_address = str(address or mfg_text or "")

        # Check completeness (6-digit PIN code or street/city keywords)
        has_pin = bool(re.search(r"\b[1-9][0-9]{5}\b", combined_address))
        has_location_kw = any(k in combined_address.lower() for k in ["plot", "street", "road", "area", "dist", "city", "delhi", "mumbai", "bengaluru", "chennai", "kolkata", "hyderabad", "pune", "gujarat", "maharashtra", "india"])

        if has_pin and has_location_kw:
            return ComplianceFinding(
                finding_id=f"FIND-{rule.rule_id}-PASS",
                rule_id=rule.rule_id,
                rule_reference=rule.rule_reference,
                category=rule.category,
                field=rule.field,
                status=FindingStatus.PASS,
                severity=rule.severity,
                message="Manufacturer address contains complete location details including 6-digit postal PIN code.",
                extracted_value=combined_address,
                expected_requirement="Complete postal address with PIN code",
                legal_clause=rule.rule_reference,
                remediation_guidance="No action required."
            )

        if has_location_kw or len(combined_address) >= 15:
            return ComplianceFinding(
                finding_id=f"FIND-{rule.rule_id}-REVIEW",
                rule_id=rule.rule_id,
                rule_reference=rule.rule_reference,
                category=rule.category,
                field=rule.field,
                status=FindingStatus.REVIEW_REQUIRED,
                severity=rule.severity,
                message="Manufacturer address detected but missing explicit 6-digit postal PIN code.",
                extracted_value=combined_address,
                expected_requirement="Complete postal address with 6-digit PIN code",
                legal_clause=rule.rule_reference,
                remediation_guidance="Ensure 6-digit postal PIN code is included in manufacturer address."
            )

        return ComplianceFinding(
            finding_id=f"FIND-{rule.rule_id}-FAIL",
            rule_id=rule.rule_id,
            rule_reference=rule.rule_reference,
            category=rule.category,
            field=rule.field,
            status=FindingStatus.POTENTIAL_VIOLATION,
            severity=rule.severity,
            message="Manufacturer address details are incomplete or unreadable.",
            extracted_value=combined_address or None,
            expected_requirement="Complete street, city, state, and PIN code address",
            legal_clause=rule.rule_reference,
            remediation_guidance="Provide complete street address, district, state, and 6-digit PIN code."
        )

    def check_country_of_origin(self, rule: RuleDefinition, declarations: Dict[str, Any]) -> ComplianceFinding:
        """Rule 6(1)(a): Required on import? -> Detected? -> Satisfied?"""
        origin = declarations.get("countryOfOrigin") or declarations.get("country_of_origin")
        if origin and str(origin).strip():
            return ComplianceFinding(
                finding_id=f"FIND-{rule.rule_id}-PASS",
                rule_id=rule.rule_id,
                rule_reference=rule.rule_reference,
                category=rule.category,
                field=rule.field,
                status=FindingStatus.PASS,
                severity=rule.severity,
                message=f"Country of Origin is explicitly declared as '{origin}'.",
                extracted_value=origin,
                expected_requirement="Mandatory Country of Origin for imported items",
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
            message="Country of Origin declaration is missing on imported package.",
            extracted_value=None,
            expected_requirement="Explicit 'Country of Origin: [Country]' declaration",
            legal_clause=rule.rule_reference,
            remediation_guidance="Add prominent 'Country of Origin: [Country Name]' on label."
        )

    def check_generic_name_presence(self, rule: RuleDefinition, declarations: Dict[str, Any]) -> ComplianceFinding:
        """Rule 6(1)(b): Required? -> Detected? -> Satisfied?"""
        name = declarations.get("genericName") or declarations.get("productName")
        if name and str(name).strip():
            return ComplianceFinding(
                finding_id=f"FIND-{rule.rule_id}-PASS",
                rule_id=rule.rule_id,
                rule_reference=rule.rule_reference,
                category=rule.category,
                field=rule.field,
                status=FindingStatus.PASS,
                severity=rule.severity,
                message=f"Generic/Common name declared as '{name}'.",
                extracted_value=name,
                expected_requirement="Generic or common name of commodity",
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
            message="Generic or common name of the commodity is missing or unverified.",
            extracted_value=None,
            expected_requirement="Unambiguous common/generic product name",
            legal_clause=rule.rule_reference,
            remediation_guidance="Add common/generic name on PDP."
        )

    def check_consumer_care_details(self, rule: RuleDefinition, declarations: Dict[str, Any]) -> ComplianceFinding:
        """Rule 6(1)(f): Required? -> Detected? -> Complete (Phone helpline AND Email address)?"""
        care = declarations.get("consumerCare") or declarations.get("customer_care")
        raw_text = str(declarations.get("raw_text") or "")
        combined = f"{str(care or '')} {raw_text}"

        has_phone = bool(re.search(r"(\d{3,5}[-\s]?\d{3,5}[-\s]?\d{3,4}|1800[-\s]?\d+)", combined))
        has_email = bool(re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", combined))

        if has_phone and has_email:
            return ComplianceFinding(
                finding_id=f"FIND-{rule.rule_id}-PASS",
                rule_id=rule.rule_id,
                rule_reference=rule.rule_reference,
                category=rule.category,
                field=rule.field,
                status=FindingStatus.PASS,
                severity=rule.severity,
                message=f"Consumer Care contact details complete with both helpline telephone number and email ID.",
                extracted_value=str(care or combined[:100]),
                expected_requirement="Telephone number AND email address for consumer complaints",
                legal_clause=rule.rule_reference,
                remediation_guidance="No action required."
            )

        if has_phone or has_email:
            missing_medium = "email address" if not has_email else "telephone helpline number"
            return ComplianceFinding(
                finding_id=f"FIND-{rule.rule_id}-REVIEW",
                rule_id=rule.rule_id,
                rule_reference=rule.rule_reference,
                category=rule.category,
                field=rule.field,
                status=FindingStatus.REVIEW_REQUIRED,
                severity=rule.severity,
                message=f"Consumer Care details partially present, but missing {missing_medium}.",
                extracted_value=str(care or combined[:100]),
                expected_requirement="Both telephone helpline number AND email address",
                legal_clause=rule.rule_reference,
                remediation_guidance=f"Add missing {missing_medium} to Consumer Care declaration."
            )

        return ComplianceFinding(
            finding_id=f"FIND-{rule.rule_id}-FAIL",
            rule_id=rule.rule_id,
            rule_reference=rule.rule_reference,
            category=rule.category,
            field=rule.field,
            status=FindingStatus.POTENTIAL_VIOLATION,
            severity=rule.severity,
            message="Consumer Care helpline contact details are completely missing.",
            extracted_value=None,
            expected_requirement="Telephone helpline number and email address for consumer care",
            legal_clause=rule.rule_reference,
            remediation_guidance="Print 'Consumer Care: Tel: 1800-XXX-XXXX, Email: care@domain.com' on label."
        )

    def check_generic_presence(self, rule: RuleDefinition, declarations: Dict[str, Any]) -> ComplianceFinding:
        val = declarations.get(rule.field)
        status = FindingStatus.PASS if val else FindingStatus.REVIEW
        return ComplianceFinding(
            finding_id=f"FIND-{rule.rule_id}-GENERIC",
            rule_id=rule.rule_id,
            rule_reference=rule.rule_reference,
            category=rule.category,
            field=rule.field,
            status=status,
            severity=rule.severity,
            message=f"Declaration check for {rule.field}: {'FOUND' if val else 'NOT FOUND'}",
            extracted_value=val,
            expected_requirement=rule.description,
            legal_clause=rule.rule_reference
        )
