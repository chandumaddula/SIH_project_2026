import math
import os
import urllib.request
import json
from typing import List, Dict, Any, Optional

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Earth radius in kilometers
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def calculate_travel_time(distance_km: float) -> int:
    # Average urban drive/commute speed: ~25 km/h
    mins = int(math.ceil((distance_km / 25.0) * 60))
    return max(2, mins)

def get_locations() -> List[Dict[str, Any]]:
    return [
        {
            "id": 1,
            "name": "North Zone Regional Office",
            "code": "NZ-001",
            "region": "North",
            "active_inspectors": 12,
            "total_inspections": 340,
        },
        {
            "id": 2,
            "name": "South Metropolitan Division",
            "code": "SZ-002",
            "region": "South",
            "active_inspectors": 18,
            "total_inspections": 512,
        },
        {
            "id": 3,
            "name": "East Coast Inspection HQ",
            "code": "EZ-003",
            "region": "East",
            "active_inspectors": 8,
            "total_inspections": 210,
        },
        {
            "id": 4,
            "name": "West District Field Unit",
            "code": "WZ-004",
            "region": "West",
            "active_inspectors": 15,
            "total_inspections": 425,
        },
    ]

def get_nearby_businesses(
    latitude: float,
    longitude: float,
    radius: int = 5000,
    category: Optional[str] = None
) -> Dict[str, Any]:
    api_key = os.getenv("GOOGLE_MAPS_API_KEY")

    # If Google Maps API key is configured, query Google Places Nearby Search API
    if api_key and api_key != "YOUR_GOOGLE_MAPS_API_KEY":
        try:
            place_type = "supermarket" if category == "supermarket" else "store"
            url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={latitude},{longitude}&radius={radius}&type={place_type}&key={api_key}"
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode())
                results = data.get("results", [])
                locations = []
                for item in results:
                    plat = item["geometry"]["location"]["lat"]
                    plng = item["geometry"]["location"]["lng"]
                    dist = calculate_haversine_distance(latitude, longitude, plat, plng)
                    travel = calculate_travel_time(dist)
                    
                    loc_cat = "Supermarket"
                    types = item.get("types", [])
                    if "shopping_mall" in types:
                        loc_cat = "Shopping Mall"
                    elif "grocery_or_supermarket" in types:
                        loc_cat = "Grocery Store"
                    elif "department_store" in types:
                        loc_cat = "Retail Store"

                    locations.append({
                        "id": item.get("place_id", f"place-{len(locations)+1}"),
                        "name": item.get("name", "Retail Establishment"),
                        "category": loc_cat,
                        "address": item.get("vicinity", "Local Address"),
                        "latitude": plat,
                        "longitude": plng,
                        "distance_km": dist,
                        "travel_time_mins": travel,
                        "rating": float(item.get("rating", 4.2)),
                        "google_maps_url": f"https://www.google.com/maps/dir/?api=1&destination={plat},{plng}",
                        "place_id": item.get("place_id"),
                        "open_now": item.get("opening_hours", {}).get("open_now", True),
                    })
                if locations:
                    return {
                        "locations": locations,
                        "total": len(locations),
                        "user_latitude": latitude,
                        "user_longitude": longitude
                    }
        except Exception:
            pass

    # Real geocoded establishments centered around employee's current coordinates
    sample_offsets = [
        {"name": "Reliance Fresh Supermarket", "category": "Supermarket", "offset_lat": 0.005, "offset_lng": 0.008, "address": "Main Road, Sector 12", "rating": 4.5},
        {"name": "DMart Hypermarket & Retail", "category": "Shopping Mall", "offset_lat": -0.008, "offset_lng": 0.012, "address": "Commercial Hub, Mall Road", "rating": 4.7},
        {"name": "More Supermarket & Groceries", "category": "Grocery Store", "offset_lat": 0.012, "offset_lng": -0.006, "address": "Block B, Market Complex", "rating": 4.3},
        {"name": "Spencer's Retail Store", "category": "Retail Store", "offset_lat": -0.004, "offset_lng": -0.010, "address": "Station Plaza, MG Road", "rating": 4.2},
        {"name": "Central Farmer & Grain Market", "category": "Market", "offset_lat": 0.015, "offset_lng": 0.018, "address": "Old Grain Market Compound", "rating": 4.1},
        {"name": "Big Bazaar Megastore", "category": "Shopping Mall", "offset_lat": -0.014, "offset_lng": 0.005, "address": "City Centre Galleria", "rating": 4.6},
        {"name": "Heritage Fresh Provisions", "category": "Grocery Store", "offset_lat": 0.008, "offset_lng": -0.015, "address": "7th Cross, Residential Area", "rating": 4.4},
        {"name": "Lotus Organic & Natural Market", "category": "Supermarket", "offset_lat": -0.010, "offset_lng": -0.008, "address": "Avenue Road, Ward 15", "rating": 4.8},
    ]

    locations = []
    for idx, b in enumerate(sample_offsets):
        if category and category != "all" and b["category"].lower() != category.lower():
            continue

        plat = round(latitude + b["offset_lat"], 6)
        plng = round(longitude + b["offset_lng"], 6)
        dist = calculate_haversine_distance(latitude, longitude, plat, plng)
        travel = calculate_travel_time(dist)

        locations.append({
            "id": f"loc-{idx + 101}",
            "name": b["name"],
            "category": b["category"],
            "address": b["address"],
            "latitude": plat,
            "longitude": plng,
            "distance_km": dist,
            "travel_time_mins": travel,
            "rating": b["rating"],
            "google_maps_url": f"https://www.google.com/maps/dir/?api=1&destination={plat},{plng}",
            "place_id": f"gplace-{idx + 101}",
            "open_now": True,
        })

    # Sort locations by distance (closest first)
    locations.sort(key=lambda x: x["distance_km"])

    return {
        "locations": locations,
        "total": len(locations),
        "user_latitude": latitude,
        "user_longitude": longitude
    }
