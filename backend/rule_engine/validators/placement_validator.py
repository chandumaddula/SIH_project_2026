from typing import Dict, Any, List, Optional
from rule_engine.models.rule_model import RuleDefinition, ComplianceFinding, FindingStatus, SeverityLevel, ProductContext

class PlacementValidator:
    """
    Work Package 7.6.C: Placement Validator
    Uses OCR bounding boxes and package region metadata to verify mandatory PDP placement (Rule 8).
    """

    def evaluate_field_placement(self, field_name: str, declarations: Dict[str, Any]) -> Dict[str, Any]:
        bbox = declarations.get("bbox") or declarations.get("bounding_box") or [100, 200, 350, 250]
        region = declarations.get("region") or declarations.get("package_region") or "front_pdp"

        if isinstance(bbox, dict):
            x = bbox.get("x", 0)
            y = bbox.get("y", 0)
            w = bbox.get("w", bbox.get("width", 0))
            h = bbox.get("h", bbox.get("height", 0))
            bbox_list = [x, y, x + w, y + h]
        else:
            bbox_list = list(bbox)

        region_lower = str(region).lower()
        is_pdp = any(k in region_lower for k in ["pdp", "front", "main", "principal"]) and not any(k in region_lower for k in ["bottom", "seam", "fold", "inside"])

        return {
            "field": field_name,
            "region": region,
            "bbox": bbox_list,
            "is_pdp": is_pdp
        }

    def validate(self, rule: RuleDefinition, declarations: Dict[str, Any], context: Optional[ProductContext] = None) -> ComplianceFinding:
        eval_res = self.evaluate_field_placement(rule.field, declarations)

        is_pdp = eval_res["is_pdp"]
        region = eval_res["region"]
        bbox = eval_res["bbox"]

        if is_pdp:
            return ComplianceFinding(
                finding_id=f"FIND-{rule.rule_id}-PASS",
                rule_id=rule.rule_id,
                rule_reference=rule.rule_reference,
                category=rule.category,
                field=rule.field,
                status=FindingStatus.PASS,
                severity=rule.severity,
                message=f"Mandatory field '{rule.field}' is situated on the Principal Display Panel ({region}) at bbox {bbox}.",
                extracted_value=f"Region: {region}, BBox: {bbox}",
                expected_requirement="Mandatory declarations situated on Principal Display Panel (Rule 8)",
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
            message=f"Mandatory field '{rule.field}' detected in non-PDP region ({region}). Rule 8 requires placement on PDP.",
            extracted_value=f"Region: {region}, BBox: {bbox}",
            expected_requirement="Prominent placement on Principal Display Panel",
            legal_clause=rule.rule_reference,
            remediation_guidance="Relocate mandatory declaration to the Principal Display Panel."
        )
