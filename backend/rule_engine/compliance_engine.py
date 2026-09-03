from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from rule_engine.models.rule_model import (
    RuleDefinition,
    ProductContext,
    ComplianceFinding,
    FindingStatus,
    SeverityLevel,
    ComplianceSummary,
    IndividualCheck,
    FindingEvidence,
    ComplianceReport,
)
from rule_engine.rule_loader import global_rule_loader, RuleLoader
from rule_engine.applicability.applicability_engine import RuleApplicabilityEngine
from rule_engine.validators.declaration_validator import DeclarationValidator
from rule_engine.validators.mrp_validator import MRPValidator
from rule_engine.validators.quantity_validator import NetQuantityValidator
from rule_engine.validators.date_validator import DateValidator
from rule_engine.validators.font_validator import FontValidator
from rule_engine.validators.readability_validator import ReadabilityValidator
from rule_engine.validators.placement_validator import PlacementValidator
from rule_engine.audit.audit_trail import AuditTrailLogger

class LegalMetrologyComplianceEngine:
    """
    Phase 7 Compliance Decision Engine (WP 7.7, 7.8 & 7.9).
    Combines Applicable Rules + AI Extracted Data + Validator Results into:
    - Overall Status (PASS, REVIEW_REQUIRED, POTENTIAL_VIOLATION)
    - Structured Summary (total_checks, passed, review_required, potential_violations)
    - Granular Individual Checks array for complete explainability
    - Traceable Finding Evidence (Image path, Bounding box, Timestamp, Officer Decision).
    """
    def __init__(self, loader: Optional[RuleLoader] = None):
        self.loader = loader or global_rule_loader
        self.applicability_engine = RuleApplicabilityEngine()

        self.declaration_validator = DeclarationValidator()
        self.mrp_validator = MRPValidator()
        self.quantity_validator = NetQuantityValidator()
        self.date_validator = DateValidator()
        self.font_validator = FontValidator()
        self.readability_validator = ReadabilityValidator()
        self.placement_validator = PlacementValidator()

    def evaluate_package_compliance(
        self,
        extracted_declarations: Dict[str, Any],
        context: Optional[ProductContext] = None,
        scan_id: Optional[str] = None
    ) -> ComplianceReport:
        if context is None:
            context = ProductContext(
                product_name=extracted_declarations.get("productName"),
                category=extracted_declarations.get("category", "GENERAL"),
                pdp_area_sq_cm=float(extracted_declarations.get("pdp_area_sq_cm", 100.0)),
                is_imported=bool(extracted_declarations.get("importer") or extracted_declarations.get("is_imported"))
            )

        audit = AuditTrailLogger()
        now_iso = datetime.now(timezone.utc).isoformat()
        image_path = str(extracted_declarations.get("image_path") or "/static/scans/sample.jpg")

        audit.log_event("INITIALIZATION", f"Starting Legal Metrology evaluation for scan '{scan_id or 'anon'}'.", {"context": context.model_dump()})

        all_rules = self.loader.get_all_rules()
        applicable_rules, non_applicable, exemption_reasons = self.applicability_engine.filter_applicable_rules(
            all_rules, context, extracted_declarations
        )

        audit.log_event(
            "APPLICABILITY_CHECK",
            f"Filtered {len(applicable_rules)} applicable rule(s) and {len(non_applicable)} non-applicable/exempt rule(s).",
            {"exemptions": exemption_reasons}
        )

        findings: List[ComplianceFinding] = []
        individual_checks: List[IndividualCheck] = []

        # If fully exempt under Rule 26/Rule 3, generate EXEMPTED findings
        if exemption_reasons and not applicable_rules:
            for rule in all_rules:
                ev = FindingEvidence(
                    image_path=image_path,
                    bounding_box=None,
                    highlighted_region={"field": rule.field, "exemption": exemption_reasons[0]},
                    ocr_raw_snippet="Exempted"
                )
                findings.append(ComplianceFinding(
                    finding_id=f"FIND-{rule.rule_id}-EXEMPT",
                    rule_id=rule.rule_id,
                    rule_reference=rule.rule_reference,
                    category=rule.category,
                    field=rule.field,
                    status=FindingStatus.EXEMPTED,
                    severity=SeverityLevel.INFO,
                    message=f"Rule exempted: {'; '.join(exemption_reasons)}",
                    extracted_value=None,
                    expected_requirement="Exemption applies under Rule 26 / Rule 3",
                    legal_clause=rule.rule_reference,
                    evidence=ev,
                    timestamp=now_iso,
                    officer_decision="EXEMPTED",
                    remediation_guidance="No action required due to statutory exemption."
                ))
                individual_checks.append(IndividualCheck(
                    field=rule.field,
                    rule_id=rule.rule_id,
                    status=FindingStatus.EXEMPTED,
                    confidence=1.0,
                    message=f"Statutory exemption applied ({'; '.join(exemption_reasons)})",
                    extracted_value=None,
                    legal_clause=rule.rule_reference,
                    evidence=ev,
                    timestamp=now_iso,
                    officer_decision="EXEMPTED"
                ))

            summary = ComplianceSummary(
                total_checks=len(all_rules),
                passed=0,
                review_required=0,
                potential_violations=0,
                exempted=len(all_rules)
            )

            report = ComplianceReport(
                scan_id=scan_id,
                timestamp=now_iso,
                overall_status=FindingStatus.PASS,
                compliance_score=100.0,
                summary=summary,
                checks=individual_checks,
                findings=findings,
                audit_trail=audit.logs,
                exemptions_applied=exemption_reasons
            )
            return report

        # Evaluate each applicable rule
        for rule in applicable_rules:
            category = rule.category.lower()

            if category == "declarations":
                finding = self.declaration_validator.validate(rule, extracted_declarations)
            elif category == "mrp":
                finding = self.mrp_validator.validate(rule, extracted_declarations)
            elif category == "quantity":
                finding = self.quantity_validator.validate(rule, extracted_declarations)
            elif category == "dates":
                finding = self.date_validator.validate(rule, extracted_declarations)
            elif category == "font":
                finding = self.font_validator.validate(rule, extracted_declarations, context)
            elif category == "placement":
                finding = self.placement_validator.validate(rule, extracted_declarations, context)
            else:
                finding = self.declaration_validator.validate(rule, extracted_declarations)

            # Build WP 7.9 Evidence object
            bbox = extracted_declarations.get("bbox") or extracted_declarations.get("bounding_box") or [100, 200, 350, 250]
            evidence = FindingEvidence(
                image_path=image_path,
                bounding_box=bbox,
                highlighted_region={"field": rule.field, "clause": rule.rule_reference, "region": "front_pdp"},
                ocr_raw_snippet=str(finding.extracted_value or "Not confidently detected")
            )
            finding.evidence = evidence
            finding.timestamp = now_iso
            finding.officer_decision = "PENDING_REVIEW" if finding.status in (FindingStatus.REVIEW_REQUIRED, FindingStatus.POTENTIAL_VIOLATION) else "APPROVED"

            findings.append(finding)

            # Build granular WP 7.8 & 7.9 Individual Check object
            individual_checks.append(IndividualCheck(
                field=rule.field,
                rule_id=rule.rule_id,
                status=finding.status,
                confidence=finding.confidence_score,
                message=finding.message,
                extracted_value=finding.extracted_value,
                legal_clause=finding.legal_clause,
                evidence=evidence,
                timestamp=now_iso,
                officer_decision=finding.officer_decision
            ))

            audit.log_event("RULE_EVALUATED", f"Evaluated Rule {rule.rule_id} ({rule.rule_reference}): {finding.status.value}", finding.model_dump())

        # Determine overall status (WP 7.7)
        has_violation = any(f.status == FindingStatus.POTENTIAL_VIOLATION for f in findings)
        has_review = any(f.status == FindingStatus.REVIEW_REQUIRED or str(f.status) == "REVIEW" for f in findings)

        if has_violation:
            overall_status = FindingStatus.POTENTIAL_VIOLATION
        elif has_review:
            overall_status = FindingStatus.REVIEW_REQUIRED
        else:
            overall_status = FindingStatus.PASS

        passed_count = sum(1 for f in findings if f.status == FindingStatus.PASS)
        review_count = sum(1 for f in findings if f.status == FindingStatus.REVIEW_REQUIRED or str(f.status) == "REVIEW")
        violation_count = sum(1 for f in findings if f.status == FindingStatus.POTENTIAL_VIOLATION)
        exempted_count = sum(1 for f in findings if f.status == FindingStatus.EXEMPTED)
        total_checks = len(findings)

        compliance_score = round((passed_count / max(1, total_checks)) * 100.0, 1)

        summary = ComplianceSummary(
            total_checks=total_checks,
            passed=passed_count,
            review_required=review_count,
            potential_violations=violation_count,
            exempted=exempted_count
        )

        audit.log_event(
            "COMPLIANCE_SUMMARY",
            f"Evaluation finished with overall status {overall_status.value}. Score: {compliance_score}%",
            {
                "overall_status": overall_status.value,
                "score": compliance_score,
                "summary": summary.model_dump()
            }
        )

        return ComplianceReport(
            scan_id=scan_id,
            timestamp=now_iso,
            overall_status=overall_status,
            compliance_score=compliance_score,
            summary=summary,
            checks=individual_checks,
            findings=findings,
            audit_trail=audit.logs,
            exemptions_applied=exemption_reasons
        )
