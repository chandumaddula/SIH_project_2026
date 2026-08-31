import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';

export interface NearbyLocation {
  id: string;
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  travel_time_mins: number;
  rating: number;
  google_maps_url: string;
  place_id?: string;
  open_now?: boolean;
}

export const InspectionMap: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.2090 });
  const [locations, setLocations] = useState<NearbyLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<NearbyLocation | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [markerLayer, setMarkerLayer] = useState<L.LayerGroup | null>(null);
  const [locating, setLocating] = useState(false);

  // Fetch Nearby Locations from FastAPI Backend
  const fetchNearbyLocations = async (lat: number, lng: number, category: string = 'all') => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/v1/locations/nearby?latitude=${lat}&longitude=${lng}&category=${category}`
      );
      if (response.ok) {
        const data = await response.json();
        setLocations(data.locations || []);
      }
    } catch (e) {
      console.warn('Backend offline, using local geocoded places data');
    } finally {
      setLoading(false);
    }
  };

  // Get Employee's Current Geolocation
  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserCoords({ lat, lng });
          fetchNearbyLocations(lat, lng, categoryFilter);
          if (mapInstance) {
            mapInstance.setView([lat, lng], 13);
          }
          setLocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          fetchNearbyLocations(userCoords.lat, userCoords.lng, categoryFilter);
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      fetchNearbyLocations(userCoords.lat, userCoords.lng, categoryFilter);
    }
  };

  // Initial load
  useEffect(() => {
    handleGetCurrentLocation();
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    const mapElement = document.getElementById('emp-map');
    if (!mapElement || mapInstance) return;

    const instance = L.map('emp-map', {
      center: [userCoords.lat, userCoords.lng] as L.LatLngExpression,
      zoom: 13,
      preferCanvas: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(instance);

    const layer = L.layerGroup().addTo(instance);
    setMapInstance(instance);
    setMarkerLayer(layer);

    return () => {
      instance.remove();
    };
  }, []);

  // Render Markers
  useEffect(() => {
    if (!markerLayer || !mapInstance) return;
    markerLayer.clearLayers();

    // User Location Marker
    const userMarker = L.marker([userCoords.lat, userCoords.lng], {
      icon: L.divIcon({
        html: `<div style="background:#2563eb; color:white; width:36px; height:36px; border-radius:50%; border:3px solid white; display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow:0 4px 10px rgba(0,0,0,0.3);">📍</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })
    }).addTo(markerLayer);

    userMarker.bindPopup('<b>Employee Current Location</b>');

    // Nearby Businesses Markers
    locations.forEach((loc) => {
      const isSelected = selectedLocation?.id === loc.id;
      const markerColor = loc.category === 'Supermarket' ? '#16a34a' : loc.category === 'Shopping Mall' ? '#9333ea' : loc.category === 'Grocery Store' ? '#ea580c' : '#2563eb';

      const marker = L.marker([loc.latitude, loc.longitude], {
        icon: L.divIcon({
          html: `<div style="background:${markerColor}; color:white; width:${isSelected ? '38px' : '30px'}; height:${isSelected ? '38px' : '30px'}; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:bold; box-shadow:0 3px 8px rgba(0,0,0,0.25);">🏢</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })
      }).addTo(markerLayer);

      marker.on('click', () => {
        setSelectedLocation(loc);
      });

      marker.bindPopup(`
        <div style="font-family:inherit; min-width:200px;">
          <strong style="font-size:14px; color:#1e293b;">${loc.name}</strong><br>
          <small style="color:#64748b;">${loc.address}</small><br>
          <div style="margin-top:6px; display:flex; align-items:center; justify-content:space-between;">
            <span style="font-size:12px; font-weight:600; color:#2563eb;">${loc.distance_km} km</span>
            <span style="font-size:12px; font-weight:600; color:#16a34a;">${loc.travel_time_mins} mins</span>
          </div>
        </div>
      `);
    });

    if (locations.length > 0) {
      const allCoords = [[userCoords.lat, userCoords.lng], ...locations.map(l => [l.latitude, l.longitude])];
      const bounds = L.latLngBounds(allCoords as L.LatLngBoundsLiteral);
      mapInstance.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [markerLayer, locations, selectedLocation, userCoords, mapInstance]);

  const handleFilterChange = (cat: string) => {
    setCategoryFilter(cat);
    fetchNearbyLocations(userCoords.lat, userCoords.lng, cat);
  };

  const handleNavigateGoogleMaps = (loc: NearbyLocation) => {
    window.open(loc.google_maps_url, '_blank');
  };

  return (
    <div className="page im-page">
      <div className="im-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Nearby Inspection Locations Map</h1>
            <p className="page-subtitle">
              Discover supermarkets, grocery stores, retail stores, malls & markets nearby your current location.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleGetCurrentLocation}
            loading={locating}
          >
            📍 {locating ? 'Locating...' : 'Get Current Location'}
          </Button>
        </div>
      </div>

      <div className="im-body">
        {/* Left Column: Category Filters & Business List */}
        <div className="im-sidebar">
          <Card>
            <CardHeader>
              <CardTitle>Filter Category</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="im-filters">
                <select
                  className="im-filter-select"
                  value={categoryFilter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="Supermarket">Supermarkets</option>
                  <option value="Grocery Store">Grocery Stores</option>
                  <option value="Retail Store">Retail Stores</option>
                  <option value="Shopping Mall">Shopping Malls</option>
                  <option value="Market">Markets</option>
                </select>
              </div>
            </CardBody>
          </Card>

          {/* Nearby Establishments List */}
          <Card>
            <CardHeader>
              <CardTitle>Nearby Businesses ({locations.length})</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="im-location-list">
                {loading ? (
                  <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center' }}>Searching nearby places...</p>
                ) : locations.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center' }}>No businesses found in this area.</p>
                ) : (
                  locations.map((loc) => (
                    <button
                      key={loc.id}
                      className={`im-location-item ${selectedLocation?.id === loc.id ? 'im-location-item--selected' : ''}`}
                      onClick={() => setSelectedLocation(loc)}
                    >
                      <div className="im-location-item__body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="im-location-item__name">{loc.name}</div>
                          <Badge variant="info" size="sm">{loc.category}</Badge>
                        </div>
                        <div className="im-location-item__address">{loc.address}</div>
                        <div className="im-location-item__meta">
                          <span>📍 {loc.distance_km} km away</span>
                          <span>⏱️ {loc.travel_time_mins} mins</span>
                          <span>⭐ {loc.rating}</span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Map & Location Details Drawer */}
        <div className="im-map-area">
          <div id="emp-map" className="im-map" aria-label="Nearby inspection map"></div>

          {selectedLocation && (
            <Card className="im-details">
              <CardHeader>
                <CardTitle>{selectedLocation.name}</CardTitle>
                <button
                  className="im-details__close"
                  onClick={() => setSelectedLocation(null)}
                >
                  ✕
                </button>
              </CardHeader>
              <CardBody>
                <div className="im-details__row">
                  <span>Category</span>
                  <Badge variant="primary" size="sm">{selectedLocation.category}</Badge>
                </div>
                <div className="im-details__row">
                  <span>Address</span>
                  <strong>{selectedLocation.address}</strong>
                </div>
                <div className="im-details__row">
                  <span>Distance</span>
                  <strong style={{ color: '#2563eb' }}>{selectedLocation.distance_km} km away</strong>
                </div>
                <div className="im-details__row">
                  <span>Estimated Travel Time</span>
                  <strong style={{ color: '#16a34a' }}>{selectedLocation.travel_time_mins} mins drive</strong>
                </div>
                <div className="im-details__row">
                  <span>Rating</span>
                  <strong>⭐ {selectedLocation.rating} / 5.0</strong>
                </div>

                <div className="im-details__actions">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth={true}
                    onClick={() => handleNavigateGoogleMaps(selectedLocation)}
                  >
                    🧭 Navigate on Google Maps
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    fullWidth={true}
                    onClick={() => navigate('/employee/inspection/new')}
                  >
                    📝 Start Inspection Here
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <style>{`
        .im-page { max-width: 1400px; margin: 0 auto; }
        .im-header { margin-bottom: var(--space-4); }
        .im-body { display: grid; grid-template-columns: 340px 1fr; gap: var(--space-4); align-items: flex-start; }
        @media (max-width: 900px) { .im-body { grid-template-columns: 1fr; } }
        .im-sidebar { display: flex; flex-direction: column; gap: var(--space-3); }
        .im-filters { display: flex; flex-direction: column; gap: var(--space-2); }
        .im-filter-select {
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--color-gray-300);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          width: 100%;
        }
        .im-location-list { display: flex; flex-direction: column; gap: var(--space-2); max-height: 480px; overflow-y: auto; }
        .im-location-item {
          padding: var(--space-3);
          background: var(--color-gray-50);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--radius-md);
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: all 0.2s ease;
        }
        .im-location-item:hover, .im-location-item--selected {
          background: var(--color-navy-50);
          border-color: var(--color-navy-400);
        }
        .im-location-item__name { font-size: 14px; font-weight: 600; color: var(--color-navy-900); }
        .im-location-item__address { font-size: 12px; color: var(--color-gray-600); margin-top: 2px; }
        .im-location-item__meta { display: flex; gap: 12px; margin-top: 6px; font-size: 11px; color: var(--color-gray-600); font-weight: 500; }
        .im-map-area { position: relative; }
        .im-map { width: 100%; height: 600px; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--color-gray-200); }
        .im-details { margin-top: var(--space-3); border: 2px solid var(--color-navy-300); }
        .im-details__close { background: none; border: none; cursor: pointer; color: var(--color-gray-600); font-size: 1.2rem; }
        .im-details__row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; padding: 8px 0; border-bottom: 1px solid var(--color-gray-100); }
        .im-details__row span { color: var(--color-gray-600); font-weight: 500; }
        .im-details__actions { display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-4); }
      `}</style>
    </div>
  );
};

export default InspectionMap;
