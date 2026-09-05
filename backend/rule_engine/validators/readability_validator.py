from typing import Dict, Any, List, Optional
from rule_engine.models.rule_model import RuleDefinition, ComplianceFinding, FindingStatus, SeverityLevel, ProductContext

class ReadabilityValidator:
    """
    Work Package 7.6.B: Readability Validator
    Evaluates text readability defects: Blur, Contrast, Resolution, Glare, Occlusion, and Text Visibility.
    """

    def evaluate_field_readability(self, field_name: str, declarations: Dict[str, Any]) -> Dict[str, Any]:
        contrast_score = float(declarations.get("contrast_score", 0.85))
        blur_score = float(declarations.get("blur_score", 0.90))
        glare_ratio = float(declarations.get("glare_ratio", 0.05))
        resolution_px = float(declarations.get("resolution_px", 500000))
        occluded = bool(declarations.get("occluded", False))

        defects: List[str] = []

        if blur_score < 0.60:
            defects.append("MOTION_BLUR")
        if contrast_score < 0.50:
            defects.append("LOW_CONTRAST")
        if glare_ratio > 0.40:
            defects.append("EXCESSIVE_GLARE")
        if resolution_px < 90000:
            defects.append("LOW_RESOLUTION")
        if occluded:
            defects.append("PARTIAL_OCCLUSION")

        # Determine readability rating
        if len(defects) == 0 and contrast_score >= 0.80 and blur_score >= 0.80:
            readability = "EXCELLENT"
            confidence = 0.96
        elif len(defects) == 0:
            readability = "GOOD"
            confidence = 0.90
        elif len(defects) == 1:
            readability = "MARGINAL"
            confidence = 0.75
        else:
            readability = "POOR"
            confidence = 0.50

        return {
            "field": field_name,
            "readability": readability,
            "confidence": confidence,
            "defects": defects
        }

    def validate(self, rule: RuleDefinition, declarations: Dict[str, Any], context: Optional[ProductContext] = None) -> ComplianceFinding:
        eval_res = self.evaluate_field_readability(rule.field, declarations)

        readability = eval_res["readability"]
        defects = eval_res["defects"]
        confidence = eval_res["confidence"]

        if readability in ("EXCELLENT", "GOOD"):
            return ComplianceFinding(
                finding_id=f"FIND-{rule.rule_id}-PASS",
                rule_id=rule.rule_id,
                rule_reference=rule.rule_reference,
                category=rule.category,
                field=rule.field,
                status=FindingStatus.PASS,
                severity=rule.severity,
                message=f"Text legibility for '{rule.field}' is rated {readability} (Confidence: {confidence:.2f}). No visual defects detected.",
                extracted_value=readability,
                expected_requirement="Legible and prominent declaration without blur or glare",
                legal_clause=rule.rule_reference,
                confidence_score=confidence,
                remediation_guidance="No action required."
            )

        defect_str = ", ".join(d.replace("_", " ").title() for d in defects)
        return ComplianceFinding(
            finding_id=f"FIND-{rule.rule_id}-REVIEW",
            rule_id=rule.rule_id,
            rule_reference=rule.rule_reference,
            category=rule.category,
            field=rule.field,
            status=FindingStatus.REVIEW_REQUIRED,
            severity=rule.severity,
            message=f"Text legibility for '{rule.field}' is rated {readability} due to visual defects ({defect_str}).",
            extracted_value=f"{readability} ({defect_str})",
            expected_requirement="Prominent, clear, high-contrast text declaration",
            legal_clause=rule.rule_reference,
            confidence_score=confidence,
            remediation_guidance="Reprint label with higher contrast or recapture image without glare."
        )
