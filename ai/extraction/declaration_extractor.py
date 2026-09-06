from typing import List, Dict, Any, Tuple, Optional
from ai.schemas.ai_result import ParsedDeclarations, FieldDetail, FieldEvidence, OCRBoundingBox


def _safe(val: Any) -> Optional[str]:
    return val if val is not None else None


def _best_bbox(bboxes: List[OCRBoundingBox], keywords: List[str]) -> Optional[List[int]]:
    """Find the bbox for the text containing any of the keywords."""
    for bbox in bboxes:
        text_lower = bbox.text.lower()
        if any(kw.lower() in text_lower for kw in keywords):
            return [bbox.box["x"], bbox.box["y"], bbox.box["w"], bbox.box["h"]]
    return None


def extract_all_declarations(
    raw_text: str,
    bounding_boxes: Optional[List[OCRBoundingBox]] = None
) -> Tuple[ParsedDeclarations, List[FieldEvidence]]:
    """
    Parse raw OCR text and bounding boxes to extract Legal Metrology declarations.
    Real regex-based parsing — no hardcoded product names or prices.
    """
    if bounding_boxes is None:
        bounding_boxes = []

    lines = raw_text.split("|")
    lines = [l.strip() for l in lines if l.strip()]

    # ---------- MRP ----------
    mrp_bbox = _best_bbox(bounding_boxes, ["mrp", "m.r.p", "retail price", "₹"])
    mrp_value, mrp_conf = _parse_mrp(lines)
    mrp_fd = FieldDetail(
        value=_safe(mrp_value),
        confidence=mrp_conf,
        bbox=mrp_bbox,
        source_text=mrp_value or "",
    )

    # ---------- Net Quantity ----------
    qty_bbox = _best_bbox(bounding_boxes, ["net", "qty", "quantity", "wt", "weight", "ml", "litre", "kg", "gm"])
    qty_value, qty_conf = _parse_net_quantity(lines)
    net_qty_fd = FieldDetail(
        value=_safe(qty_value),
        confidence=qty_conf,
        bbox=qty_bbox,
        source_text=qty_value or "",
    )

    # ---------- Product Name (first substantial line, not a label) ----------
    name_bbox = None
    product_name = None
    skip_words = {"mrp", "net", "qty", "quantity", "weight", "price", "rs", "₹", "mfg", "mfd", "exp",
                  "batch", "lot", "fssai", "consumer", "customer", "phone", "call", "helpline",
                  "country", "origin", "made in", "packed", "imported", "manufactured"}
    for bbox in sorted(bounding_boxes, key=lambda b: b.box["y"]):
        txt = bbox.text.strip()
        if len(txt) < 3 or txt[0].isdigit():
            continue
        words = set(txt.lower().split())
        if not words.intersection(skip_words) and name_bbox is None:
            product_name = txt
            name_bbox = [bbox.box["x"], bbox.box["y"], bbox.box["w"], bbox.box["h"]]
            break

    product_name_fd = FieldDetail(
        value=_safe(product_name),
        confidence=0.95 if product_name else 0.0,
        bbox=name_bbox,
        source_text=product_name or "",
    )

    # ---------- Manufacturer ----------
    mfr_bbox = _best_bbox(bounding_boxes, ["manufactured", "mfg", "mfd", "manufacturer", "marketed"])
    mfr_value, mfr_conf = _parse_manufacturer(lines)
    generic_name_fd = FieldDetail(
        value=None,
        confidence=0.0,
        bbox=None,
        source_text="",
    )
    mfr_fd = FieldDetail(
        value=_safe(mfr_value),
        confidence=mfr_conf,
        bbox=mfr_bbox,
        source_text=mfr_value or "",
    )

    # ---------- Packer ----------
    packer_value, packer_conf = _parse_packer(lines)
    packer_fd = FieldDetail(
        value=_safe(packer_value),
        confidence=packer_conf,
        bbox=None,
        source_text=packer_value or "",
    )

    # ---------- Importer ----------
    importer_value, importer_conf = _parse_importer(lines)
    importer_fd = FieldDetail(
        value=_safe(importer_value),
        confidence=importer_conf,
        bbox=None,
        source_text=importer_value or "",
    )

    # ---------- Address ----------
    addr_value, addr_conf = _parse_address(lines)
    address_fd = FieldDetail(
        value=_safe(addr_value),
        confidence=addr_conf,
        bbox=None,
        source_text=addr_value or "",
    )

    # ---------- Country of Origin ----------
    coo_bbox = _best_bbox(bounding_boxes, ["country", "origin", "made in", "c.o.o"])
    coo_value, coo_conf = _parse_country_of_origin(lines)
    origin_fd = FieldDetail(
        value=_safe(coo_value),
        confidence=coo_conf,
        bbox=coo_bbox,
        source_text=coo_value or "",
    )

    # ---------- Manufacturing Date ----------
    mfg_bbox = _best_bbox(bounding_boxes, ["mfg", "mfd", "manufactured", "packed", "packing"])
    mfg_value, mfg_conf = _parse_manufacturing_date(lines)
    mfg_date_fd = FieldDetail(
        value=_safe(mfg_value),
        confidence=mfg_conf,
        bbox=mfg_bbox,
        source_text=mfg_value or "",
    )

    # ---------- Expiry Date ----------
    exp_bbox = _best_bbox(bounding_boxes, ["exp", "expiry", "best before", "use before"])
    exp_value, exp_conf = _parse_expiry_date(lines)
    exp_date_fd = FieldDetail(
        value=_safe(exp_value),
        confidence=exp_conf,
        bbox=exp_bbox,
        source_text=exp_value or "",
    )

    # ---------- Batch Number ----------
    batch_value, batch_conf = _parse_batch_number(lines)
    batch_fd = FieldDetail(
        value=_safe(batch_value),
        confidence=batch_conf,
        bbox=None,
        source_text=batch_value or "",
    )

    # ---------- Consumer Care ----------
    care_bbox = _best_bbox(bounding_boxes, ["consumer", "customer", "helpline", "care", "phone", "call"])
    care_value, care_conf = _parse_consumer_care(lines)
    care_fd = FieldDetail(
        value=_safe(care_value),
        confidence=care_conf,
        bbox=care_bbox,
        source_text=care_value or "",
    )

    # ---------- Barcode ----------
    barcode_value, barcode_conf = _parse_barcode(lines)
    barcode_fd = FieldDetail(
        value=_safe(barcode_value),
        confidence=barcode_conf,
        bbox=None,
        source_text=barcode_value or "",
    )

    declarations = ParsedDeclarations(
        product_name=product_name_fd,
        generic_name=generic_name_fd,
        mrp=mrp_fd,
        net_quantity=net_qty_fd,
        manufacturer=mfr_fd,
        packer=packer_fd,
        importer=importer_fd,
        address=address_fd,
        country_of_origin=origin_fd,
        mfg_date=mfg_date_fd,
        exp_date=exp_date_fd,
        batch_number=batch_fd,
        consumer_care=care_fd,
        barcode=barcode_fd,
    )

    # Field evidence for UI display
    field_evidences = [
        FieldEvidence(field="product_name", value=product_name, confidence=product_name_fd.confidence,
                      bbox=name_bbox, source_text=product_name or ""),
        FieldEvidence(field="mrp", value=mrp_value, confidence=mrp_conf,
                      bbox=mrp_bbox, source_text=mrp_value or ""),
        FieldEvidence(field="net_quantity", value=qty_value, confidence=qty_conf,
                      bbox=qty_bbox, source_text=qty_value or ""),
        FieldEvidence(field="manufacturer", value=mfr_value, confidence=mfr_conf,
                      bbox=mfr_bbox, source_text=mfr_value or ""),
        FieldEvidence(field="consumer_care", value=care_value, confidence=care_conf,
                      bbox=care_bbox, source_text=care_value or ""),
        FieldEvidence(field="mfg_date", value=mfg_value, confidence=mfg_conf,
                      bbox=mfg_bbox, source_text=mfg_value or ""),
    ]

    return declarations, field_evidences


# ------------------------------------------------------------------
# Individual field parsers
# ------------------------------------------------------------------
import re

_MRP_PAT = re.compile(
    r"(?:M\.?R\.?P\.?|Maximum\s*Retail\s*Price|Retail\s*Price)\s*[:\-]?\s*"
    r"(?:Rs\.?|INR\.?|₹)\s*([\d,]+\.?\d*)",
    re.IGNORECASE,
)
_MRP_BARE = re.compile(r"₹\s*([\d,]+\.?\d*)", re.IGNORECASE)


def _parse_mrp(lines: List[str]) -> Tuple[Optional[str], float]:
    for line in lines:
        m = _MRP_PAT.search(line)
        if m:
            return f"₹{m.group(1)}", 0.95
        m = _MRP_BARE.search(line)
        if m:
            return f"₹{m.group(1)}", 0.80
    return None, 0.0


def _parse_net_quantity(lines: List[str]) -> Tuple[Optional[str], float]:
    pat = re.compile(
        r"Net\s*(?:Qty|Quantity|Weight|Volume|Content|Wt\.?)?\s*[:\-]?\s*"
        r"([\d,]+\.?\d*)\s*(g|gm|kgs?|kg|ml|l|ltr|L|pcs|pieces)\b",
        re.IGNORECASE,
    )
    for line in lines:
        m = pat.search(line)
        if m:
            return f"{m.group(1)} {m.group(2)}", 0.95
    return None, 0.0


def _parse_manufacturer(lines: List[str]) -> Tuple[Optional[str], float]:
    pat = re.compile(
        r"(?:Manufactured|Mfd\.?|Mfg\.?)\s*by\s*[:\-]?\s*(.+)",
        re.IGNORECASE,
    )
    for line in lines:
        m = pat.search(line)
        if m:
            return m.group(1).strip(), 0.90
    return None, 0.0


def _parse_packer(lines: List[str]) -> Tuple[Optional[str], float]:
    pat = re.compile(r"(?:Packed|Packer|Pkd\.?)\s*(?:by)?\s*[:\-]?\s*(.+)", re.IGNORECASE)
    for line in lines:
        m = pat.search(line)
        if m:
            return m.group(1).strip(), 0.88
    return None, 0.0


def _parse_importer(lines: List[str]) -> Tuple[Optional[str], float]:
    pat = re.compile(r"(?:Imported|Importer)\s*by\s*[:\-]?\s*(.+)", re.IGNORECASE)
    for line in lines:
        m = pat.search(line)
        if m:
            return m.group(1).strip(), 0.88
    return None, 0.0


def _parse_address(lines: List[str]) -> Tuple[Optional[str], float]:
    # Look for Indian PIN codes
    pat = re.compile(r"\b\d{6}\b")
    for line in lines:
        if pat.search(line):
            return line.strip(), 0.85
    return None, 0.0


def _parse_country_of_origin(lines: List[str]) -> Tuple[Optional[str], float]:
    pat = re.compile(
        r"Country\s*(?:of\s*)?Origin\s*[:\-]?\s*(.+)", re.IGNORECASE,
    )
    pat2 = re.compile(r"Made\s+in\s+(.+)", re.IGNORECASE)
    for line in lines:
        m = pat.search(line)
        if m:
            return m.group(1).strip(), 0.95
        m = pat2.search(line)
        if m:
            return m.group(1).strip(), 0.90
    return None, 0.0


def _parse_manufacturing_date(lines: List[str]) -> Tuple[Optional[str], float]:
    pat = re.compile(
        r"(?:Mfg\.?|Manufactured|Mfd\.?)\s*(?:Date)?\s*[:\-]?\s*([\d/\-\.A-Za-z ]+)",
        re.IGNORECASE,
    )
    for line in lines:
        m = pat.search(line)
        if m:
            return m.group(1).strip(), 0.90
    return None, 0.0


def _parse_expiry_date(lines: List[str]) -> Tuple[Optional[str], float]:
    pat = re.compile(
        r"(?:Expiry|Exp\.?|Best\s*Before)\s*[:\-]?\s*([\d/\-\.A-Za-z ]+)",
        re.IGNORECASE,
    )
    for line in lines:
        m = pat.search(line)
        if m:
            return m.group(1).strip(), 0.90
    return None, 0.0


def _parse_batch_number(lines: List[str]) -> Tuple[Optional[str], float]:
    pat = re.compile(r"Batch\s*(?:No\.?|Number)?\s*[:\-]?\s*([A-Z0-9\-/]+)", re.IGNORECASE)
    pat2 = re.compile(r"Lot\s*(?:No\.?)?\s*[:\-]?\s*([A-Z0-9\-/]+)", re.IGNORECASE)
    for line in lines:
        m = pat.search(line) or pat2.search(line)
        if m:
            return m.group(1).strip(), 0.90
    return None, 0.0


def _parse_consumer_care(lines: List[str]) -> Tuple[Optional[str], float]:
    pat = re.compile(
        r"(?:Consumer|Customer)\s*Care\s*[:\-]?\s*(.+)", re.IGNORECASE,
    )
    pat2 = re.compile(r"Helpline\s*[:\-]?\s*(.+)", re.IGNORECASE)
    for line in lines:
        m = pat.search(line) or pat2.search(line)
        if m:
            return m.group(1).strip(), 0.88
    return None, 0.0


def _parse_barcode(lines: List[str]) -> Tuple[Optional[str], float]:
    pat = re.compile(r"\b([2-9]\d{12})\b")  # EAN-13
    for line in lines:
        m = pat.search(line)
        if m:
            return m.group(1), 0.95
    return None, 0.0
