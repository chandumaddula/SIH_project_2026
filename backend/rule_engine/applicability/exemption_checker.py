import re
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from rule_engine.models.rule_model import ProductContext

class ExemptionResult(BaseModel):
    is_exempt: bool
    exempted_rule_ids: List[str] = Field(default_factory=list)
    modified_rule_ids: List[str] = Field(default_factory=list)
    reasons: List[str] = Field(default_factory=list)

class ExemptionChecker:
    """
    Evaluates Legal Metrology statutory exemptions under Rule 26 and Rule 3:
    1. Rule 26(a): Net weight <= 10g or net volume <= 10ml (exempt from standard declaration rules)
    2. Rule 26(b): Net weight <= 20g or net volume <= 20ml for confectionery & fast-moving items
    3. Rule 3: Industrial / Institutional consumers (exempt from retail pricing & consumer care)
    4. Bulk Agricultural: Commodities in quantities > 50kg
    """

    def evaluate_exemptions(self, context: ProductContext, extracted_declarations: Dict[str, Any]) -> ExemptionResult:
        exempted_rules: List[str] = []
        modified_rules: List[str] = []
        reasons: List[str] = []

        weight_g = context.package_weight_g
        volume_ml = context.package_volume_ml

        # Extract net quantity numbers if not explicitly in context
        net_qty_str = str(extracted_declarations.get("netQuantity") or extracted_declarations.get("net_quantity") or "")
        if weight_g is None and volume_ml is None and net_qty_str:
            match_g = re.search(r"(\d+(?:\.\d+)?)\s*(?:g|gm|grams)", net_qty_str, re.IGNORECASE)
            match_ml = re.search(r"(\d+(?:\.\d+)?)\s*(?:ml|mL|millilitres)", net_qty_str, re.IGNORECASE)
            if match_g:
                weight_g = float(match_g.group(1))
            if match_ml:
                volume_ml = float(match_ml.group(1))

        # 1. Rule 26(a) Small Pack Exemption (<= 10g / <= 10ml)
        if (weight_g is not None and weight_g <= 10.0) or (volume_ml is not None and volume_ml <= 10.0):
            exempted_rules.extend(["PC-001", "PC-002", "PC-004", "PC-005", "MRP-001", "MRP-002", "MRP-003", "QTY-001", "QTY-002", "DATE-001", "DATE-002"])
            reasons.append("EXM-001: Net weight/volume <= 10g/10ml (Rule 26(a) Small Pack Exemption applied)")

        # 2. Rule 26(b) Small Confectionery Exemption (<= 20g / <= 20ml)
        elif context.category == "CONFECTIONERY" and ((weight_g is not None and weight_g <= 20.0) or (volume_ml is not None and volume_ml <= 20.0)):
            exempted_rules.extend(["PC-002", "PC-004", "MRP-003"])
            reasons.append("EXM-004: Confectionery package <= 20g/20ml (Rule 26(b) Partial Exemption applied)")

        # 3. Rule 3 Institutional / Industrial Consumer Exemption
        if context.consumer_type in ("INSTITUTIONAL", "INDUSTRIAL"):
            exempted_rules.extend(["MRP-001", "MRP-002", "MRP-003", "PC-005"])
            modified_rules.append("PC-001")
            reasons.append(f"EXM-002: Package intended for {context.consumer_type} Consumer (Rule 3 Exemption applied)")

        # 4. Bulk Agricultural Package Exemption (> 50kg)
        if weight_g is not None and weight_g > 50000 and context.category == "AGRICULTURAL":
            exempted_rules.extend(["PC-001", "PC-002", "PC-004", "PC-005", "MRP-001", "MRP-002", "QTY-001"])
            reasons.append("EXM-003: Bulk agricultural package > 50 kg (Exempt from retail pre-packaged rules)")

        is_exempt = len(exempted_rules) > 0 or len(reasons) > 0

        return ExemptionResult(
            is_exempt=is_exempt,
            exempted_rule_ids=list(set(exempted_rules)),
            modified_rule_ids=list(set(modified_rules)),
            reasons=reasons
        )
