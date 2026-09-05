from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.models.inspection import Inspection, ComplianceResult, Violation
from app.models.complaint import Complaint
from app.models.product import Product

def get_summary_report(db: Session) -> Dict[str, Any]:
    total_products = db.query(Product).count()
    total_inspections = db.query(Inspection).count()
    total_complaints = db.query(Complaint).count()
    total_violations = db.query(Violation).count()

    compliant_count = db.query(Inspection).filter(Inspection.status == "COMPLIANT").count()
    non_compliant_count = db.query(Inspection).filter(Inspection.status == "NON_COMPLIANT").count()

    compliance_rate = (compliant_count / total_inspections * 100) if total_inspections > 0 else 100.0

    return {
        "total_products": total_products,
        "total_inspections": total_inspections,
        "total_complaints": total_complaints,
        "total_violations": total_violations,
        "compliant_inspections": compliant_count,
        "non_compliant_inspections": non_compliant_count,
        "compliance_rate_percentage": round(compliance_rate, 2),
    }

def get_inspection_report(db: Session, inspection_id: int) -> Optional[Dict[str, Any]]:
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        return None
    
    compliance = db.query(ComplianceResult).filter(ComplianceResult.inspection_id == inspection_id).first()
    violations = db.query(Violation).filter(Violation.inspection_id == inspection_id).all()

    report_date = inspection.inspection_date or datetime.now(timezone.utc)

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Legal Metrology Official Inspection Report #{inspection_id}</title>
        <style>
            body {{ font-family: 'Arial', sans-serif; margin: 30px; color: #1e293b; background: #fff; }}
            .header {{ text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }}
            .header h1 {{ margin: 0; font-size: 20px; color: #0f172a; text-transform: uppercase; }}
            .header p {{ margin: 4px 0 0 0; font-size: 13px; color: #64748b; }}
            .meta-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; font-size: 13px; }}
            .meta-item {{ background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; }}
            .section-title {{ font-size: 15px; font-weight: bold; margin: 20px 0 10px 0; border-left: 4px solid #2563eb; padding-left: 8px; text-transform: uppercase; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }}
            th, td {{ border: 1px solid #cbd5e1; padding: 10px; text-align: left; }}
            th {{ background: #f1f5f9; color: #334155; }}
            .badge-pass {{ background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 4px; font-weight: bold; }}
            .badge-fail {{ background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 4px; font-weight: bold; }}
            .footer {{ margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: right; font-size: 12px; color: #64748b; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Government of India — Department of Consumer Affairs</h1>
            <p>Legal Metrology Enforcement Division — Official Inspection Certificate</p>
        </div>

        <div class="meta-grid">
            <div class="meta-item"><strong>Inspection Record ID:</strong> #{inspection.id:05d}</div>
            <div class="meta-item"><strong>Inspection Date:</strong> {report_date.strftime('%d/%m/%Y %H:%M UTC')}</div>
            <div class="meta-item"><strong>Inspection Location:</strong> {inspection.location or 'Central Retail Store #1'}</div>
            <div class="meta-item"><strong>Overall Compliance Status:</strong> <span class="{ 'badge-pass' if inspection.status == 'COMPLIANT' else 'badge-fail' }">{inspection.status}</span></div>
        </div>

        <div class="section-title">Legal Metrology Compliance Findings</div>
        <table>
            <thead>
                <tr>
                    <th>Rule Citation</th>
                    <th>Requirement Finding</th>
                    <th>Severity</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {"".join([f"<tr><td>{v.rule_reference}</td><td>{v.description}</td><td>{v.severity}</td><td><span class='badge-fail'>{v.status}</span></td></tr>" for v in violations]) if violations else "<tr><td colspan='4'><span class='badge-pass'>PASS — All mandatory declarations compliant with PCR 2011</span></td></tr>"}
            </tbody>
        </table>

        <div class="footer">
            <p>Verified & Signed Electronically by Inspector of Legal Metrology</p>
            <p>Central Enforcement Portal • Report Token: {inspection_id}-LM-2026</p>
        </div>
    </body>
    </html>
    """

    return {
        "inspection_id": inspection.id,
        "employee_id": inspection.employee_id,
        "product_id": inspection.product_id,
        "status": inspection.status,
        "location": inspection.location,
        "inspection_date": str(inspection.inspection_date),
        "compliance_score": compliance.compliance_score if compliance else 1.0,
        "violations_count": len(violations),
        "violations": [
            {
                "rule_reference": v.rule_reference,
                "description": v.description,
                "severity": v.severity,
                "status": v.status
            }
            for v in violations
        ],
        "html_content": html_content
    }
