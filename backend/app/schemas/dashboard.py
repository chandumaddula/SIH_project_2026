from typing import Optional, List, Dict
from pydantic import BaseModel

class DashboardStats(BaseModel):
    totalInspections: int
    productsScanned: int
    pendingReviews: int
    openComplaints: int
    potentialIssues: int
    completedReports: int

class ComplianceOverview(BaseModel):
    pass_count: int
    reviewRequired: int
    potentialIssue: int

class RecentInspectionItem(BaseModel):
    id: str
    product: str
    location: str
    date: str
    time: str
    status: str
    officer: str

class RecentComplaintItem(BaseModel):
    id: str
    product: str
    issue: str
    location: str
    submittedAt: str
    priority: str
    status: str
    evidenceCount: int

class ActionItemSchema(BaseModel):
    id: str
    title: str
    description: str
    priority: str
    type: str
    referenceId: str
    dueDate: Optional[str] = None

class DashboardUpdateSchema(BaseModel):
    id: str
    title: str
    body: str
    date: str
    category: str
    office: str

class FullDashboardData(BaseModel):
    stats: DashboardStats
    complianceOverview: Dict[str, int]
    recentInspections: List[RecentInspectionItem]
    recentComplaints: List[RecentComplaintItem]
    actionItems: List[ActionItemSchema]
    updates: List[DashboardUpdateSchema]

class DashboardSummaryResponse(BaseModel):
    total_inspections: int
    compliant_rate: float
    total_violations: int
    pending_complaints: int
    recent_activity_count: int

class MetricTrendItem(BaseModel):
    date: str
    inspections: int
    violations: int

class DashboardMetricsResponse(BaseModel):
    summary: DashboardSummaryResponse
    trends: List[MetricTrendItem]
