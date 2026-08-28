class FontValidator:
    """
    Validates minimum font size / numeral height requirements for declarations
    relative to net weight / package size under Rule 9 of PCR 2011.
    """
    def validate_font_height(self, declared_weight_g: float, height_mm: float) -> bool:
        if declared_weight_g <= 50:
            return height_mm >= 1.0
        elif declared_weight_g <= 100:
            return height_mm >= 1.5
        elif declared_weight_g <= 500:
            return height_mm >= 2.0
        else:
            return height_mm >= 4.0
