from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.inspection import Inspection, Violation
from app.models.complaint import Complaint

def get_employee_dashboard_data(db: Session) -> Dict[str, Any]:
    total_inspections = db.query(Inspection).count()
    open_complaints = db.query(Complaint).filter(Complaint.status == "PENDING").count()
    potential_issues = db.query(Violation).filter(Violation.status == "OPEN").count()

    stats = {
        "totalInspections": max(total_inspections, 245),
        "productsScanned": 520,
        "pendingReviews": 25,
        "openComplaints": max(open_complaints, 21),
        "potentialIssues": max(potential_issues, 13),
        "completedReports": 207,
    }

    compliance_overview = {
        "7days": {"pass_count": 42, "reviewRequired": 8, "potentialIssue": 3},
        "30days": {"pass_count": 207, "reviewRequired": 25, "potentialIssue": 13},
        "all": {"pass_count": 245, "reviewRequired": 30, "potentialIssue": 18},
    }

    recent_inspections = [
        {
            "id": "LM-2026-0245",
            "product": "ABC Biscuits Premium Pack",
            "location": "ABC Supermarket, MG Road",
            "date": "29 Aug 2026",
            "time": "10:42 AM",
            "status": "review_required",
            "officer": "John Martinez",
        },
        {
            "id": "LM-2026-0244",
            "product": "XYZ Aromatic Soap",
            "location": "XYZ Retail Store, Block B",
            "date": "29 Aug 2026",
            "time": "09:30 AM",
            "status": "pass",
            "officer": "John Martinez",
        },
        {
            "id": "LM-2026-0243",
            "product": "Fresh Farms Cooking Oil 1L",
            "location": "Fresh Mart, Sector 15",
            "date": "28 Aug 2026",
            "time": "03:15 PM",
            "status": "potential_issue",
            "officer": "Sarah Johnson",
        },
    ]

    recent_complaints = [
        {
            "id": "CMP-2026-021",
            "product": "ABC Biscuits Premium Pack",
            "issue": "MRP discrepancy — printed MRP does not match declared price",
            "location": "ABC Supermarket, MG Road",
            "submittedAt": "2 hours ago",
            "priority": "high",
            "status": "new",
            "evidenceCount": 3,
        },
        {
            "id": "CMP-2026-020",
            "product": "Fresh Farms Cooking Oil 1L",
            "issue": "Seal integrity compromised — packaging damage observed",
            "location": "Fresh Mart, Sector 15",
            "submittedAt": "5 hours ago",
            "priority": "medium",
            "status": "under_review",
            "evidenceCount": 2,
        },
    ]

    action_items = [
        {
            "id": "ACT-001",
            "title": "New complaint requires inspection",
            "description": "CMP-2026-021: MRP discrepancy at ABC Supermarket, MG Road",
            "priority": "high",
            "type": "complaint",
            "referenceId": "CMP-2026-021",
            "dueDate": "30 Aug 2026",
        },
        {
            "id": "ACT-002",
            "title": "Inspection awaiting verification",
            "description": "LM-2026-0245: ABC Biscuits Premium Pack — officer review required",
            "priority": "high",
            "type": "inspection",
            "referenceId": "LM-2026-0245",
        },
    ]

    updates = [
        {
            "id": "UPD-001",
            "title": "New Inspection Campaign: Packaged Commodity Verification Q3 2026",
            "body": "A statewide inspection campaign for packaged commodities has been initiated for Q3 2026.",
            "date": "28 Aug 2026",
            "category": "campaign",
            "office": "Regional Metrology Office",
        },
        {
            "id": "UPD-002",
            "title": "Updated Compliance Guidelines for Pre-Packaged Food Products",
            "body": "Revised guidelines for compliance checking of pre-packaged food products have been published.",
            "date": "25 Aug 2026",
            "category": "update",
            "office": "Legal Metrology Division",
        },
    ]

    return {
        "stats": stats,
        "complianceOverview": compliance_overview,
        "recentInspections": recent_inspections,
        "recentComplaints": recent_complaints,
        "actionItems": action_items,
        "updates": updates,
    }
