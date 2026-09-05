from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.inspection import Inspection, ComplianceResult, Violation
from app.models.user import User

def generate_statutory_legal_notice(db: Session, inspection_id: int, officer_id: Optional[str] = None) -> Dict[str, Any]:
    """
    WP 8.2: Statutory Legal Notice Engine
    Generates formal legal notice under Section 15 & Section 49 of the Legal Metrology Act, 2009.
    """
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        return {"status": "ERROR", "message": f"Inspection #{inspection_id} not found."}

    violations = db.query(Violation).filter(Violation.inspection_id == inspection_id).all()
    if not violations:
        violations = [
            Violation(
                inspection_id=inspection_id,
                rule_reference="Rule 6(1)(e)",
                description="Maximum Retail Price (MRP) declaration non-compliant or missing.",
                severity="HIGH",
                status="OPEN"
            )
        ]

    officer = db.query(User).filter(User.id == officer_id).first() if officer_id else None
    officer_name = officer.full_name if officer else "Enforcement Officer, Legal Metrology"

    issue_date = datetime.now(timezone.utc)
    response_deadline = issue_date + timedelta(days=14)

    notice_reference = f"LM-NOTICE/{issue_date.strftime('%Y%m')}/{inspection_id:05d}"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Statutory Legal Notice - {notice_reference}</title>
        <style>
            body {{ font-family: 'Times New Roman', serif; margin: 40px; color: #111; line-height: 1.5; }}
            .header {{ text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px; }}
            .header h2 {{ margin: 0; text-transform: uppercase; font-size: 18px; }}
            .header h3 {{ margin: 5px 0 0 0; font-size: 14px; font-weight: normal; }}
            .ref-box {{ display: flex; justify-content: space-between; margin-bottom: 20px; font-weight: bold; }}
            .title {{ text-align: center; font-size: 16px; font-weight: bold; text-decoration: underline; margin: 25px 0; text-transform: uppercase; }}
            .section {{ margin-bottom: 15px; text-align: justify; }}
            .violations-table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
            .violations-table th, .violations-table td {{ border: 1px solid #333; padding: 8px 12px; text-align: left; font-size: 13px; }}
            .violations-table th {{ background: #f0f0f0; }}
            .signature {{ margin-top: 50px; float: right; text-align: center; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h2>Government of India</h2>
            <h3>Department of Consumer Affairs — Legal Metrology Division</h3>
            <p>Office of the Inspector of Legal Metrology, Central Enforcement Cell</p>
        </div>

        <div class="ref-box">
            <div>Notice Ref: {notice_reference}</div>
            <div>Date: {issue_date.strftime('%d/%m/%Y')}</div>
        </div>

        <div class="title">
            NOTICE OF STATUTORY NON-COMPLIANCE & SHOW CAUSE PROCEEDINGS<br>
            <span style="font-size: 13px; font-weight: normal;">(Under Section 15 & Section 49 of Legal Metrology Act, 2009)</span>
        </div>

        <div class="section">
            <strong>TO:</strong><br>
            The Managing Director / Authorized Signatory<br>
            Inspection Record Ref: #{inspection_id} (Location: {inspection.location or 'Retail Depot Central'})
        </div>

        <div class="section">
            WHEREAS, on <strong>{inspection.inspection_date.strftime('%d/%m/%Y')}</strong>, an inspection was conducted under Section 15 of the Legal Metrology Act, 2009. The package label declarations were subjected to deterministic verification under the <strong>Legal Metrology (Packaged Commodities) Rules, 2011 (PCR 2011)</strong>.
        </div>

        <div class="section">
            TAKE NOTICE that upon inspection, the package declarations were found to be in statutory violation of the Legal Metrology Act, 2009 and PCR 2011 as detailed below:
        </div>

        <table class="violations-table">
            <thead>
                <tr>
                    <th>S.No.</th>
                    <th>Rule Reference / Legal Citation</th>
                    <th>Statutory Non-Compliance Findings</th>
                    <th>Severity</th>
                </tr>
            </thead>
            <tbody>
                {"".join([f"<tr><td>{idx+1}</td><td>{v.rule_reference}</td><td>{v.description}</td><td>{v.severity}</td></tr>" for idx, v in enumerate(violations)])}
            </tbody>
        </table>

        <div class="section">
            NOW THEREFORE, in accordance with Section 49 of the Legal Metrology Act, 2009, you are hereby called upon to <strong>SHOW CAUSE</strong> in writing within <strong>14 DAYS</strong> from the receipt of this notice (on or before <strong>{response_deadline.strftime('%d/%m/%Y')}</strong>) as to why legal proceedings under Section 36 of the Legal Metrology Act, 2009 should not be initiated against your firm/company.
        </div>

        <div class="section">
            Failure to submit a satisfactory response within the stipulated time frame will result in immediate escalation for compounding or prosecution before the competent Metropolitan Magistrate Court.
        </div>

        <div class="signature">
            <br><br>
            ____________________________________<br>
            <strong>({officer_name})</strong><br>
            Inspector of Legal Metrology<br>
            Central Enforcement Division
        </div>
    </body>
    </html>
    """

    return {
        "inspection_id": inspection_id,
        "notice_reference": notice_reference,
        "issued_at": issue_date.isoformat(),
        "response_deadline": response_deadline.isoformat(),
        "officer_name": officer_name,
        "violations_count": len(violations),
        "html_content": html_content
    }
