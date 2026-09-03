import math
from typing import Dict, Any, Optional, Union
from rule_engine.models.rule_model import RuleDefinition, ComplianceFinding, FindingStatus, SeverityLevel, ProductContext

class FontValidator:
    """
    Work Package 7.6.A: Font Validator
    Evaluates numeral & letter font height against Rule 9 & Schedule II standards.
    Supports calibrated scale measurements vs mobile photo estimated measurements.
    """

    def get_required_min_height(self, pdp_area_sq_cm: float, is_net_qty: bool = False) -> float:
        if pdp_area_sq_cm <= 50:
            return 1.5 if is_net_qty else 1.0
        elif pdp_area_sq_cm <= 100:
            return 2.0 if is_net_qty else 1.5
        elif pdp_area_sq_cm <= 500:
            return 4.0 if is_net_qty else 2.5
        else:
            return 6.0 if is_net_qty else 4.0

    def validate(self, rule: RuleDefinition, declarations: Dict[str, Any], context: Optional[ProductContext] = None) -> ComplianceFinding:
        pdp_area = context.pdp_area_sq_cm if context else float(declarations.get("pdp_area_sq_cm", 100.0))
        is_net_qty = (rule.field == "net_quantity")

        req_min_mm = self.get_required_min_height(pdp_area, is_net_qty=is_net_qty)

        # Extract bbox & image metadata
        bbox = declarations.get("bbox") or declarations.get("bounding_box")
        img_meta = declarations.get("image_metadata") or declarations.get("dimensions") or {}
        scale_info = declarations.get("scale_info") or declarations.get("reference_scale") or {}

        pixels_per_mm = scale_info.get("pixels_per_mm")
        known_scale = bool(scale_info.get("known_scale", False) or (pixels_per_mm and pixels_per_mm > 0))

        img_height = float(img_meta.get("height", 1000.0))
        
        # Parse bbox height
        bbox_height = 0.0
        if isinstance(bbox, (list, tuple)) and len(bbox) >= 4:
            bbox_height = float(bbox[3])
        elif isinstance(bbox, dict):
            bbox_height = float(bbox.get("h", bbox.get("height", 0.0)))
        else:
            bbox_height = float(declarations.get("font_height_px", 20.0))

        # Calculation logic
        if known_scale and pixels_per_mm and pixels_per_mm > 0:
            measured_mm = round(bbox_height / pixels_per_mm, 2)
            confidence = 0.95
            is_estimated = False
            scale_note = f"Calibrated measurement: {measured_mm} mm (at {pixels_per_mm:.1f} px/mm)"
        else:
            # Mobile photo estimation based on PDP height ratio
            pdp_height_estimate_mm = math.sqrt(pdp_area * 100) # square root of PDP area in mm^2
            measured_mm = round((bbox_height / max(1.0, img_height)) * pdp_height_estimate_mm, 2)
            confidence = 0.70
            is_estimated = True
            scale_note = f"Estimated measurement: ~{measured_mm} mm (Uncalibrated mobile photo image)"

        # Check compliance
        if measured_mm >= req_min_mm:
            return ComplianceFinding(
                finding_id=f"FIND-{rule.rule_id}-PASS",
                rule_id=rule.rule_id,
                rule_reference=rule.rule_reference,
                category=rule.category,
                field=rule.field,
                status=FindingStatus.PASS,
                severity=rule.severity,
                message=f"Font height ({scale_note}) satisfies Rule 9 minimum requirement of {req_min_mm:.1f} mm for PDP area {pdp_area:.1f} cm².",
                extracted_value=f"{measured_mm} mm ({'Calibrated' if not is_estimated else 'Estimated'})",
                expected_requirement=f"Minimum font height of {req_min_mm:.1f} mm",
                legal_clause=rule.rule_reference,
                confidence_score=confidence,
                remediation_guidance="No action required."
            )

        if is_estimated:
            return ComplianceFinding(
                finding_id=f"FIND-{rule.rule_id}-REVIEW",
                rule_id=rule.rule_id,
                rule_reference=rule.rule_reference,
                category=rule.category,
                field=rule.field,
                status=FindingStatus.REVIEW_REQUIRED,
                severity=rule.severity,
                message=f"Estimated font height ({measured_mm} mm) is below required minimum ({req_min_mm:.1f} mm). Uncalibrated photo requires physical officer verification.",
                extracted_value=f"~{measured_mm} mm (Estimated)",
                expected_requirement=f"Minimum font height of {req_min_mm:.1f} mm",
                legal_clause=rule.rule_reference,
                confidence_score=confidence,
                remediation_guidance="Officer review: Measure physical sample with legal metrology scale gauge."
            )

        return ComplianceFinding(
            finding_id=f"FIND-{rule.rule_id}-FAIL",
            rule_id=rule.rule_id,
            rule_reference=rule.rule_reference,
            category=rule.category,
            field=rule.field,
            status=FindingStatus.POTENTIAL_VIOLATION,
            severity=rule.severity,
            message=f"Calibrated font height ({measured_mm} mm) is less than required minimum ({req_min_mm:.1f} mm) under Rule 9.",
            extracted_value=f"{measured_mm} mm (Calibrated)",
            expected_requirement=f"Minimum font height of {req_min_mm:.1f} mm",
            legal_clause=rule.rule_reference,
            confidence_score=confidence,
            remediation_guidance=f"Increase font height of mandatory declaration to at least {req_min_mm:.1f} mm."
        )
