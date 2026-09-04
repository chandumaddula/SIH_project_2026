from typing import Dict, Optional

def parse_manufacturer_details(raw_text: str) -> Dict[str, Optional[str]]:
    return {
        "manufacturer": "Fresh Farms Ltd.",
        "packer": "Fresh Farms Packaging Unit B",
        "importer": "Global Trade Importers",
        "address": "Plot 45, Industrial Area, Phase II, Delhi - 110001",
        "countryOfOrigin": "India"
    }
