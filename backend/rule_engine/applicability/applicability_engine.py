from typing import List, Dict, Any, Tuple, Optional
from rule_engine.models.rule_model import RuleDefinition, ProductContext
from rule_engine.applicability.exemption_checker import ExemptionChecker, ExemptionResult
from rule_engine.applicability.package_type import PackageTypeDetector, PackageTypeEnum

class RuleApplicabilityEngine:
    """
    Phase 7 Hierarchical Rule Applicability Engine.
    Workflow:
    Product Context -> Check Exemption -> YES (Modify/Exempt rules) / NO (Normal rule set).
    """
    def __init__(self):
        self.exemption_checker = ExemptionChecker()
        self.package_type_detector = PackageTypeDetector()

    def rule_applies(self, rule: RuleDefinition, context: ProductContext) -> bool:
        req_commodity = rule.applicability.commodity.lower()
        curr_commodity = (context.category or "GENERAL").lower()
        if req_commodity != "all" and req_commodity != curr_commodity:
            return False

        req_pkg = rule.applicability.package_type.lower()
        curr_pkg = (context.package_type or "SINGLE_PIECE").lower()
        if req_pkg != "all" and req_pkg != curr_pkg:
            return False

        if rule.rule_id == "PC-003" and not context.is_imported:
            return False

        return True

    def get_applicable_rules(
        self,
        all_rules: List[RuleDefinition],
        context: ProductContext,
        extracted_declarations: Optional[Dict[str, Any]] = None
    ) -> Tuple[List[RuleDefinition], List[RuleDefinition], List[str]]:
        extracted = extracted_declarations or {}

        pkg_type = self.package_type_detector.detect_package_type(context, extracted)
        context.package_type = pkg_type.value

        exemption_res = self.exemption_checker.evaluate_exemptions(context, extracted)

        applicable: List[RuleDefinition] = []
        non_applicable: List[RuleDefinition] = []

        # If full exemption (e.g. Rule 26(a) <= 10g), exempt all standard rules
        if exemption_res.is_exempt and "EXM-001" in "".join(exemption_res.reasons):
            return [], all_rules, exemption_res.reasons

        for rule in all_rules:
            if rule.category == "exemptions":
                non_applicable.append(rule)
                continue

            # Check if rule ID is explicitly exempted
            if rule.rule_id in exemption_res.exempted_rule_ids:
                non_applicable.append(rule)
                continue

            if self.rule_applies(rule, context):
                applicable.append(rule)
            else:
                non_applicable.append(rule)

        return applicable, non_applicable, exemption_res.reasons

    def filter_applicable_rules(
        self,
        all_rules: List[RuleDefinition],
        context: ProductContext,
        extracted_declarations: Dict[str, Any]
    ) -> Tuple[List[RuleDefinition], List[RuleDefinition], List[str]]:
        return self.get_applicable_rules(all_rules, context, extracted_declarations)
