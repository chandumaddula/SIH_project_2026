from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from rule_engine.models.rule_model import ComplianceFinding, FindingStatus, ProductContext, FindingEvidence

class AuditTrailLogger:
    """
    Work Package 7.9: Evidence & Audit Trail Logger
    Constructs explainable, fully traceable evidence trails for legal metrology inspections.
    """
    def __init__(self):
        self.logs: List[Dict[str, Any]] = []

    def log_event(self, stage: str, message: str, details: Optional[Dict[str, Any]] = None) -> None:
        self.logs.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "stage": stage,
            "message": message,
            "details": details or {}
        })

    def format_finding_evidence(
        self,
        finding: ComplianceFinding,
        image_path: Optional[str] = None
    ) -> FindingEvidence:
        bbox = finding.extracted_value if isinstance(finding.extracted_value, (list, dict)) else None
        return FindingEvidence(
            image_path=image_path or "/static/scans/sample.jpg",
            bounding_box=bbox,
            highlighted_region={"field": finding.field, "clause": finding.legal_clause},
            ocr_raw_snippet=str(finding.extracted_value or "Not confidently detected")
        )

    def generate_audit_summary(
        self,
        scan_id: str,
        context: ProductContext,
        extracted_data: Dict[str, Any],
        exemptions_applied: List[str],
        findings: List[ComplianceFinding],
        overall_status: FindingStatus,
        compliance_score: float
    ) -> Dict[str, Any]:
        return {
            "inspection_meta": {
                "scan_id": scan_id,
                "evaluated_at": datetime.now(timezone.utc).isoformat(),
                "engine_version": "7.9.0",
                "framework": "Legal Metrology Packaged Commodities Rules 2011 (Amendments 2021/2022/2024)"
            },
            "product_context": context.model_dump(),
            "extracted_facts": extracted_data,
            "exemptions_applied": exemptions_applied,
            "overall_decision": {
                "status": overall_status.value,
                "compliance_score": compliance_score,
                "total_findings": len(findings),
                "violations_count": sum(1 for f in findings if f.status == FindingStatus.POTENTIAL_VIOLATION),
                "review_count": sum(1 for f in findings if f.status == FindingStatus.REVIEW_REQUIRED),
                "pass_count": sum(1 for f in findings if f.status == FindingStatus.PASS),
            },
            "execution_audit_trail": self.logs,
            "detailed_findings": [f.model_dump() for f in findings]
        }
