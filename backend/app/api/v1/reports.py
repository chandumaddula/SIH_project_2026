from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.report import SummaryReportResponse, InspectionReportResponse
from app.services import report_service

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/summary", response_model=SummaryReportResponse)
def get_summary_report(db: Session = Depends(get_db)):
    return report_service.get_summary_report(db)

@router.get("/inspection/{inspection_id}", response_model=InspectionReportResponse)
def get_inspection_report(inspection_id: int, db: Session = Depends(get_db)):
    report = report_service.get_inspection_report(db, inspection_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection report not found"
        )
    return report
