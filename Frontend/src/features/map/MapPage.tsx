import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';

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
}

export const MapPage: React.FC = () => {
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.2090 });
  const [locations, setLocations] = useState<NearbyLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<NearbyLocation | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [markerLayer, setMarkerLayer] = useState<L.LayerGroup | null>(null);
  const [locating, setLocating] = useState(false);

  const fetchNearbyLocations = async (lat: number, lng: number, category: string = 'all') => {
    try {
      const response = await fetch(
        `/api/v1/locations/nearby?latitude=${lat}&longitude=${lng}&category=${category}`
      );
      if (response.ok) {
        const data = await response.json();
        setLocations(data.locations || []);
      }
    } catch (e) {
      console.warn('Backend offline');
    }
  };

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
          console.error(error);
          fetchNearbyLocations(userCoords.lat, userCoords.lng, categoryFilter);
          setLocating(false);
        }
      );
    } else {
      fetchNearbyLocations(userCoords.lat, userCoords.lng, categoryFilter);
    }
  };

  useEffect(() => {
    handleGetCurrentLocation();
  }, []);

  useEffect(() => {
    const mapElement = document.getElementById('map');
    if (!mapElement || mapInstance) return;

    const instance = L.map('map', {
      center: [userCoords.lat, userCoords.lng],
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

  useEffect(() => {
    if (!markerLayer || !mapInstance) return;
    markerLayer.clearLayers();

    L.marker([userCoords.lat, userCoords.lng], {
      icon: L.divIcon({
        html: `<div style="background:#2563eb; color:white; width:34px; height:34px; border-radius:50%; border:3px solid white; display:flex; align-items:center; justify-content:center; font-size:16px;">📍</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      })
    }).addTo(markerLayer);

    locations.forEach((loc) => {
      const markerColor = loc.category === 'Supermarket' ? '#16a34a' : loc.category === 'Shopping Mall' ? '#9333ea' : '#ea580c';
      const marker = L.marker([loc.latitude, loc.longitude], {
        icon: L.divIcon({
          html: `<div style="background:${markerColor}; color:white; width:30px; height:30px; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:bold;">🏢</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        })
      }).addTo(markerLayer);

      marker.on('click', () => setSelectedLocation(loc));
    });

    if (locations.length > 0) {
      const allCoords = [[userCoords.lat, userCoords.lng], ...locations.map(l => [l.latitude, l.longitude])];
      mapInstance.fitBounds(L.latLngBounds(allCoords as L.LatLngBoundsLiteral), { padding: [40, 40] });
    }
  }, [markerLayer, locations, userCoords, mapInstance]);

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Market & Retail Locations Map</h1>
          <p className="page-subtitle">Real-time nearby establishments search & navigation</p>
        </div>
        <Button variant="primary" onClick={handleGetCurrentLocation} loading={locating}>
          📍 Get Current Location
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1rem', marginTop: '1rem' }}>
        <div>
          <Card>
            <CardHeader><CardTitle>Nearby Stores ({locations.length})</CardTitle></CardHeader>
            <CardBody>
              <select
                style={{ width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '6px' }}
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  fetchNearbyLocations(userCoords.lat, userCoords.lng, e.target.value);
                }}
              >
                <option value="all">All Categories</option>
                <option value="Supermarket">Supermarkets</option>
                <option value="Grocery Store">Grocery Stores</option>
                <option value="Retail Store">Retail Stores</option>
                <option value="Shopping Mall">Shopping Malls</option>
                <option value="Market">Markets</option>
              </select>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '450px', overflowY: 'auto' }}>
                {locations.map((loc) => (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc)}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      background: selectedLocation?.id === loc.id ? '#eff6ff' : '#f8fafc',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{loc.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{loc.address}</div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '11px', fontWeight: 600, color: '#2563eb' }}>
                      <span>📍 {loc.distance_km} km</span>
                      <span>⏱️ {loc.travel_time_mins} mins</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <div>
          <div id="map" style={{ height: '550px', borderRadius: '8px', overflow: 'hidden' }}></div>

          {selectedLocation && (
            <div style={{ marginTop: '12px' }}>
              <Card>
                <CardHeader>
                  <CardTitle>{selectedLocation.name}</CardTitle>
                </CardHeader>
                <CardBody>
                  <p><strong>Category:</strong> {selectedLocation.category}</p>
                  <p><strong>Address:</strong> {selectedLocation.address}</p>
                  <p><strong>Distance:</strong> {selectedLocation.distance_km} km</p>
                  <p><strong>Travel Time:</strong> {selectedLocation.travel_time_mins} mins drive</p>
                  <Button
                    variant="primary"
                    style={{ marginTop: '10px' }}
                    onClick={() => window.open(selectedLocation.google_maps_url, '_blank')}
                  >
                    🧭 Navigate on Google Maps
                  </Button>
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPage;