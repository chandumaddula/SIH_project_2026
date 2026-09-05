import re
from enum import Enum
from typing import Dict, Any, Optional
from rule_engine.models.rule_model import ProductContext

class PackageTypeEnum(str, Enum):
    SINGLE_PIECE = "SINGLE_PIECE"
    MULTI_PIECE = "MULTI_PIECE"
    COMBINATION = "COMBINATION"
    GROUP = "GROUP"
    WHOLESALE = "WHOLESALE"
    SMALL_PACKET = "SMALL_PACKET"

class PackageTypeDetector:
    """
    Classifies pre-packaged commodity type under Legal Metrology Rules:
    - SINGLE_PIECE: Standard single individual consumer package.
    - MULTI_PIECE: Package containing two or more individual pieces of identical quantity.
    - COMBINATION: Package containing individual pieces of different commodities.
    - GROUP: Group of packages intended for retail display.
    - WHOLESALE: Package intended for sale to retailers/wholesalers in bulk.
    - SMALL_PACKET: Package with net weight/volume <= 10g or 10ml.
    """

    def detect_package_type(self, context: ProductContext, extracted_declarations: Optional[Dict[str, Any]] = None) -> PackageTypeEnum:
        extracted = extracted_declarations or {}
        raw_text = str(extracted.get("raw_text") or "").lower()
        prod_name = str(context.product_name or extracted.get("productName") or "").lower()
        comb_text = f"{prod_name} {raw_text}"

        # 1. Small packet check
        weight_g = context.package_weight_g
        volume_ml = context.package_volume_ml
        if (weight_g is not None and weight_g <= 10.0) or (volume_ml is not None and volume_ml <= 10.0):
            return PackageTypeEnum.SMALL_PACKET

        # 2. Wholesale check
        if context.consumer_type in ("WHOLESALE", "INDUSTRIAL", "INSTITUTIONAL") or "wholesale" in comb_text or "bulk pack" in comb_text:
            return PackageTypeEnum.WHOLESALE

        # 3. Multi-piece check (e.g. "Pack of 6", "Set of 4", "6 Units")
        if re.search(r"\b(pack of|set of|buy \d+ get|\d+\s*units|\d+\s*pieces|\d+\s*packs)\b", comb_text):
            return PackageTypeEnum.MULTI_PIECE

        # 4. Combination check (e.g. "Combo", "Shampoo + Conditioner")
        if re.search(r"\b(combo|combination|kit|gift pack|\+|\bwith free\b)\b", comb_text):
            return PackageTypeEnum.COMBINATION

        # Default fallback
        if context.package_type and context.package_type.upper() in PackageTypeEnum.__members__:
            return PackageTypeEnum[context.package_type.upper()]

        return PackageTypeEnum.SINGLE_PIECE
