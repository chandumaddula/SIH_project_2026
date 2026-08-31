from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class LocationItem(BaseModel):
    id: int
    name: str
    code: str
    region: str
    active_inspectors: int = 0
    total_inspections: int = 0

    model_config = ConfigDict(from_attributes=True)

class LocationListResponse(BaseModel):
    locations: List[LocationItem]
    total: int

class NearbyLocationItem(BaseModel):
    id: str
    name: str
    category: str  # 'Supermarket' | 'Grocery Store' | 'Retail Store' | 'Shopping Mall' | 'Market'
    address: str
    latitude: float
    longitude: float
    distance_km: float
    travel_time_mins: int
    rating: float
    google_maps_url: str
    place_id: Optional[str] = None
    open_now: Optional[bool] = True

class NearbyLocationsResponse(BaseModel):
    locations: List[NearbyLocationItem]
    total: int
    user_latitude: float
    user_longitude: float
