from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from app.schemas.location import LocationListResponse, LocationItem, NearbyLocationsResponse, NearbyLocationItem
from app.services import location_service

router = APIRouter(prefix="/locations", tags=["Locations & Maps"])

@router.get("", response_model=LocationListResponse)
@router.get("/", response_model=LocationListResponse)
def list_locations():
    locations_data = location_service.get_locations()
    items = [LocationItem(**loc) for loc in locations_data]
    return LocationListResponse(locations=items, total=len(items))

@router.get("/nearby", response_model=NearbyLocationsResponse)
def get_nearby_locations(
    latitude: float = Query(..., description="Employee current latitude (e.g. 28.6139)"),
    longitude: float = Query(..., description="Employee current longitude (e.g. 77.2090)"),
    radius: int = Query(5000, description="Search radius in meters"),
    category: Optional[str] = Query(None, description="Category filter (supermarket, grocery_store, retail_store, shopping_mall, market, all)")
):
    result = location_service.get_nearby_businesses(
        latitude=latitude,
        longitude=longitude,
        radius=radius,
        category=category,
    )
    items = [NearbyLocationItem(**loc) for loc in result["locations"]]
    return NearbyLocationsResponse(
        locations=items,
        total=result["total"],
        user_latitude=result["user_latitude"],
        user_longitude=result["user_longitude"],
    )
