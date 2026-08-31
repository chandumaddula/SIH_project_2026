from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("")
@router.get("/")
def get_dashboard_summary(db: Session = Depends(get_db)):
    return dashboard_service.get_employee_dashboard_data(db)

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    data = dashboard_service.get_employee_dashboard_data(db)
    return data["stats"]

@router.get("/compliance-overview")
def get_compliance_overview(
    filter: str = Query("30days", description="Filter period: today | 7days | 30days | all"),
    db: Session = Depends(get_db)
):
    data = dashboard_service.get_employee_dashboard_data(db)
    overview_map = data["complianceOverview"]
    return overview_map.get(filter, overview_map.get("30days"))

@router.get("/recent-inspections")
def get_recent_inspections(db: Session = Depends(get_db)):
    data = dashboard_service.get_employee_dashboard_data(db)
    return data["recentInspections"]

@router.get("/recent-complaints")
def get_recent_complaints(db: Session = Depends(get_db)):
    data = dashboard_service.get_employee_dashboard_data(db)
    return data["recentComplaints"]

@router.get("/action-items")
def get_action_items(db: Session = Depends(get_db)):
    data = dashboard_service.get_employee_dashboard_data(db)
    return data["actionItems"]

@router.get("/updates")
def get_updates(db: Session = Depends(get_db)):
    data = dashboard_service.get_employee_dashboard_data(db)
    return data["updates"]
