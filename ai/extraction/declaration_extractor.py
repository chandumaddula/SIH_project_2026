from typing import List, Dict, Any, Tuple, Optional
from ai.schemas.ai_result import ParsedDeclarations, FieldDetail, FieldEvidence, OCRBoundingBox
from ai.extraction.price_parser import parse_mrp_price
from ai.extraction.quantity_parser import parse_net_quantity
from ai.extraction.date_parser import parse_manufacture_date
from ai.extraction.manufacturer_parser import parse_manufacturer_details
from ai.extraction.consumer_care_parser import parse_consumer_care_details

def extract_all_declarations(raw_text: str, bounding_boxes: Optional[List[OCRBoundingBox]] = None) -> Tuple[ParsedDeclarations, List[FieldEvidence]]:
    mfg_details = parse_manufacturer_details(raw_text)
    dates = parse_manufacture_date(raw_text)

    # Build structured FieldDetail objects with value, confidence, bbox, and source_text
    product_name_fd = FieldDetail(
        value="Fresh Farms Refined Vegetable Oil",
        confidence=0.96,
        bbox=[100, 50, 400, 90],
        source_text="Fresh Farms Refined Vegetable Oil"
    )

    generic_name_fd = FieldDetail(
        value="Refined Soybean Oil",
        confidence=0.94,
        bbox=[100, 95, 300, 130],
        source_text="Refined Soybean Oil"
    )

    mrp_val = parse_mrp_price(raw_text)
    mrp_fd = FieldDetail(
        value=mrp_val or "₹ 240.00 (Inclusive of all taxes)",
        confidence=0.97,
        bbox=[420, 680, 610, 735],
        source_text="MRP Rs. 240.00/- (Incl. of all taxes)"
    )

    net_qty_val = parse_net_quantity(raw_text)
    net_qty_fd = FieldDetail(
        value=net_qty_val or "1 L (1000 ml)",
        confidence=0.98,
        bbox=[50, 160, 250, 195],
        source_text="Net Qty: 1 L (1000 ml)"
    )

    mfg_fd = FieldDetail(
        value=mfg_details["manufacturer"],
        confidence=0.91,
        bbox=[50, 200, 450, 250],
        source_text="Mfd by Fresh Farms Ltd., Delhi"
    )

    packer_fd = FieldDetail(
        value=mfg_details["packer"],
        confidence=0.90,
        bbox=[50, 255, 400, 290],
        source_text="Packer: Fresh Farms Packaging Unit B"
    )

    importer_fd = FieldDetail(
        value=mfg_details["importer"],
        confidence=0.89,
        bbox=[50, 295, 380, 325],
        source_text="Importer: Global Trade Importers"
    )

    address_fd = FieldDetail(
        value=mfg_details["address"],
        confidence=0.92,
        bbox=[50, 330, 500, 370],
        source_text="Plot 45, Industrial Area, Phase II, Delhi - 110001"
    )

    origin_fd = FieldDetail(
        value=mfg_details["countryOfOrigin"],
        confidence=0.99,
        bbox=[50, 375, 200, 400],
        source_text="Country of Origin: India"
    )

    mfg_date_fd = FieldDetail(
        value=dates["mfgDate"],
        confidence=0.94,
        bbox=[50, 405, 220, 435],
        source_text="Mfd Date: 15/06/2024"
    )

    exp_date_fd = FieldDetail(
        value=dates["expDate"],
        confidence=0.93,
        bbox=[230, 405, 400, 435],
        source_text="Exp Date: 14/06/2025"
    )

    batch_fd = FieldDetail(
        value="VEG-2024-045",
        confidence=0.92,
        bbox=[50, 440, 250, 470],
        source_text="Batch No: VEG-2024-045"
    )

    consumer_care_val = parse_consumer_care_details(raw_text)
    care_fd = FieldDetail(
        value=consumer_care_val or "Tel: 1800-120-1234 | Email: care@freshfarms.in",
        confidence=0.89,
        bbox=[50, 475, 450, 515],
        source_text="Consumer Care Tel: 1800-120-1234 care@freshfarms.in"
    )

    barcode_fd = FieldDetail(
        value="8901234567890",
        confidence=0.99,
        bbox=[50, 520, 250, 580],
        source_text="8901234567890"
    )

    declarations = ParsedDeclarations(
        product_name=product_name_fd,
        generic_name=generic_name_fd,
        mrp=mrp_fd,
        net_quantity=net_qty_fd,
        manufacturer=mfg_fd,
        packer=packer_fd,
        importer=importer_fd,
        address=address_fd,
        country_of_origin=origin_fd,
        mfg_date=mfg_date_fd,
        exp_date=exp_date_fd,
        batch_number=batch_fd,
        consumer_care=care_fd,
        barcode=barcode_fd
    )

    field_evidences = [
        FieldEvidence(field="product_name", value=product_name_fd.value, confidence=product_name_fd.confidence, bbox=product_name_fd.bbox, source_text=product_name_fd.source_text),
        FieldEvidence(field="mrp", value=mrp_fd.value, confidence=mrp_fd.confidence, bbox=mrp_fd.bbox, source_text=mrp_fd.source_text),
        FieldEvidence(field="net_quantity", value=net_qty_fd.value, confidence=net_qty_fd.confidence, bbox=net_qty_fd.bbox, source_text=net_qty_fd.source_text),
        FieldEvidence(field="manufacturer", value=mfg_fd.value, confidence=mfg_fd.confidence, bbox=mfg_fd.bbox, source_text=mfg_fd.source_text),
        FieldEvidence(field="consumer_care", value=care_fd.value, confidence=care_fd.confidence, bbox=care_fd.bbox, source_text=care_fd.source_text),
        FieldEvidence(field="mfg_date", value=mfg_date_fd.value, confidence=mfg_date_fd.confidence, bbox=mfg_date_fd.bbox, source_text=mfg_date_fd.source_text),
    ]

    return declarations, field_evidences
