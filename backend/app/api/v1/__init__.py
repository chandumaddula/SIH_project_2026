from fastapi import APIRouter
from app.api.v1 import (
    auth,
    users,
    products,
    inspections,
    scans,
    compliance,
    complaints,
    locations,
    dashboard,
    reports,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(products.router)
api_router.include_router(inspections.router)
api_router.include_router(scans.router)
api_router.include_router(compliance.router)
api_router.include_router(complaints.router)
api_router.include_router(locations.router)
api_router.include_router(dashboard.router)
api_router.include_router(reports.router)

__all__ = [
    "api_router",
    "auth",
    "users",
    "products",
    "inspections",
    "scans",
    "compliance",
    "complaints",
    "locations",
    "dashboard",
    "reports",
]
