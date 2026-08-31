from fastapi import APIRouter
from app.schemas.location import LocationListResponse
from app.services import location_service

router = APIRouter(prefix="/locations", tags=["Locations"])

@router.get("", response_model=LocationListResponse)
@router.get("/", response_model=LocationListResponse)
def get_locations():
    locs = location_service.get_locations()
    return LocationListResponse(locations=locs, total=len(locs))
