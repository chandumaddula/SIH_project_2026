from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.report import SummaryReportResponse, InspectionReportResponse
from app.services import report_service, notice_service

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

@router.get("/inspection/{inspection_id}/pdf", response_class=HTMLResponse)
def download_inspection_report_pdf(inspection_id: int, db: Session = Depends(get_db)):
    """GET /reports/inspection/{id}/pdf: Returns printable HTML/PDF inspection report."""
    report = report_service.get_inspection_report(db, inspection_id)
    if not report or "html_content" not in report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection report #{inspection_id} not found."
        )
    return HTMLResponse(content=report["html_content"], status_code=200)

@router.get("/inspection/{inspection_id}/notice", response_class=HTMLResponse)
def generate_statutory_legal_notice(inspection_id: int, db: Session = Depends(get_db)):
    """GET /reports/inspection/{id}/notice: Returns statutory legal notice under Sec 15/49 of LM Act 2009."""
    notice = notice_service.generate_statutory_legal_notice(db, inspection_id)
    if notice.get("status") == "ERROR":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=notice["message"]
        )
    return HTMLResponse(content=notice["html_content"], status_code=200)
