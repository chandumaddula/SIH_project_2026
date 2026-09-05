import pytest
from fastapi.testclient import TestClient
from rule_engine import LegalMetrologyComplianceEngine, ProductContext, FindingStatus, SeverityLevel
from rule_engine.rule_loader import global_rule_loader, RuleLoader
from rule_engine.applicability.package_type import PackageTypeDetector, PackageTypeEnum
from rule_engine.applicability.applicability_engine import RuleApplicabilityEngine
from rule_engine.validators.font_validator import FontValidator
from rule_engine.validators.readability_validator import ReadabilityValidator
from rule_engine.validators.placement_validator import PlacementValidator
from app.main import app

client = TestClient(app)

def test_rule_loader_nested_schema_loading():
    loader = RuleLoader()
    rules = loader.get_all_rules()
    assert len(rules) > 0
    rule_ids = [r.rule_id for r in rules]
    assert "PC-001" in rule_ids
    assert "MRP-001" in rule_ids

    pc001 = loader.get_rule("PC-001")
    assert pc001 is not None
    assert pc001.identification.rule_id == "PC-001"
    assert pc001.identification.rule_reference == "Rule 6(1)(a)"
    assert pc001.applicability.commodity == "all"
    assert pc001.validation.field == "manufacturer"
    assert pc001.result.severity == SeverityLevel.HIGH

def test_package_type_detector():
    detector = PackageTypeDetector()

    ctx1 = ProductContext(product_name="Standard Cooking Oil 1L")
    assert detector.detect_package_type(ctx1) == PackageTypeEnum.SINGLE_PIECE

    ctx2 = ProductContext(product_name="Soap Pack of 4")
    assert detector.detect_package_type(ctx2) == PackageTypeEnum.MULTI_PIECE

    ctx3 = ProductContext(product_name="Shampoo + Conditioner Combo Kit")
    assert detector.detect_package_type(ctx3) == PackageTypeEnum.COMBINATION

    ctx4 = ProductContext(product_name="Sachet", package_weight_g=5.0)
    assert detector.detect_package_type(ctx4) == PackageTypeEnum.SMALL_PACKET

def test_font_validator_calibrated_vs_estimated():
    validator = FontValidator()
    loader = RuleLoader()
    font_rule = loader.get_rule("FONT-001")
    assert font_rule is not None

    decl_calibrated = {
        "bbox": [10, 10, 100, 30],
        "scale_info": {"pixels_per_mm": 10.0, "known_scale": True},
        "pdp_area_sq_cm": 150.0
    }
    res_cal = validator.validate(font_rule, decl_calibrated)
    assert res_cal.status == FindingStatus.PASS
    assert res_cal.confidence_score == 0.95

    decl_uncalibrated = {
        "font_height_px": 8.0,
        "image_metadata": {"height": 1000.0},
        "pdp_area_sq_cm": 150.0
    }
    res_uncal = validator.validate(font_rule, decl_uncalibrated)
    assert res_uncal.status == FindingStatus.REVIEW_REQUIRED
    assert res_uncal.confidence_score == 0.70

def test_readability_validator_defects():
    validator = ReadabilityValidator()

    good_decl = {"contrast_score": 0.85, "blur_score": 0.90, "glare_ratio": 0.05}
    res_good = validator.evaluate_field_readability("mrp", good_decl)
    assert res_good["readability"] == "EXCELLENT"
    assert res_good["confidence"] == 0.96
    assert len(res_good["defects"]) == 0

    bad_decl = {"contrast_score": 0.40, "blur_score": 0.50, "glare_ratio": 0.50}
    res_bad = validator.evaluate_field_readability("mrp", bad_decl)
    assert res_bad["readability"] == "POOR"
    assert "MOTION_BLUR" in res_bad["defects"]
    assert "LOW_CONTRAST" in res_bad["defects"]

def test_placement_validator_bbox_pdp():
    validator = PlacementValidator()

    pdp_decl = {"field": "mrp", "region": "front_pdp", "bbox": [100, 200, 350, 250]}
    res_pdp = validator.evaluate_field_placement("mrp", pdp_decl)
    assert res_pdp["is_pdp"] is True
    assert res_pdp["region"] == "front_pdp"

    non_pdp_decl = {"field": "mrp", "region": "bottom_fold", "bbox": [100, 900, 350, 950]}
    res_non_pdp = validator.evaluate_field_placement("mrp", non_pdp_decl)
    assert res_non_pdp["is_pdp"] is False

def test_wp79_evidence_and_audit_trail():
    engine = LegalMetrologyComplianceEngine()
    extracted = {
        "productName": "Sample Commodity",
        "genericName": "Cooking Oil",
        "mrp": "₹ 100.00 (Incl. of all taxes)",
        "netQuantity": "500 ml",
        "manufacturer": "ABC Foods Ltd, Delhi - 110001",
        "consumerCare": "1800-111-0000",
        "mfgDate": "01/2024",
        "image_path": "/static/scans/package_101.jpg",
        "bbox": [50, 100, 300, 150]
    }
    report = engine.evaluate_package_compliance(extracted, scan_id="SCAN-999")

    assert report.scan_id == "SCAN-999"
    assert report.overall_status in (FindingStatus.REVIEW_REQUIRED, FindingStatus.PASS)

    for f in report.findings:
        assert f.evidence is not None
        assert f.evidence.image_path == "/static/scans/package_101.jpg"
        assert f.evidence.bounding_box is not None
        assert f.timestamp is not None
        assert f.officer_decision in ("PENDING_REVIEW", "APPROVED")

def test_compliance_api_endpoints():
    # 1. Test POST /api/v1/compliance/check
    check_payload = {
        "product_name": "API Test Cooking Oil",
        "mrp_present": True,
        "net_quantity_present": True,
        "manufacturer_present": True,
        "consumer_care_present": True
    }
    res = client.post("/api/v1/compliance/check", json=check_payload)
    assert res.status_code == 200
    data = res.json()
    assert "overall_status" in data
    assert "compliance_score" in data
    assert "summary" in data
    assert "checks" in data

    # 2. Test GET /api/v1/compliance/violations
    viol_res = client.get("/api/v1/compliance/violations")
    assert viol_res.status_code == 200
    assert isinstance(viol_res.json(), list)

    # 3. Test POST /api/v1/compliance/evaluate
    eval_payload = {
        "extracted_declarations": {
            "productName": "API Eval Product",
            "mrp": "₹ 100.00 (Incl. of all taxes)",
            "netQuantity": "500 g",
            "manufacturer": "Good Foods Ltd, Delhi - 110001",
            "consumerCare": "1800-000-1111 care@goodfoods.in",
            "mfgDate": "01/2024"
        }
    }
    eval_res = client.post("/api/v1/compliance/evaluate", json=eval_payload)
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    assert eval_data["overall_status"] == "PASS"
    assert len(eval_data["checks"]) > 0

def test_small_pack_exemption():
    engine = LegalMetrologyComplianceEngine()
    extracted = {
        "productName": "Mini Shampoo Sachet",
        "netQuantity": "6 ml"
    }
    context = ProductContext(
        product_name="Mini Shampoo Sachet",
        package_volume_ml=6.0
    )
    report = engine.evaluate_package_compliance(extracted, context=context, scan_id="TEST-004")
    assert report.overall_status == FindingStatus.PASS
    assert len(report.exemptions_applied) > 0

def test_institutional_exemption():
    engine = LegalMetrologyComplianceEngine()
    extracted = {
        "productName": "Bulk Hotel Soap",
        "netQuantity": "5 kg",
        "manufacturer": "Hotel Supplies Ltd, Industrial Estate, Delhi - 110001",
        "mfgDate": "05/2024"
    }
    context = ProductContext(
        product_name="Bulk Hotel Soap",
        consumer_type="INSTITUTIONAL"
    )
    report = engine.evaluate_package_compliance(extracted, context=context, scan_id="TEST-005")
    assert report.overall_status == FindingStatus.PASS
    assert len(report.exemptions_applied) > 0
