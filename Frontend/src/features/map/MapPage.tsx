import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MarketLocation } from '../../types/map';
import { mockLocations } from '../../services/mockData';
import { Loading } from '../../components/Loading';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';

export const MapPage: React.FC = () => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [locations] = useState<MarketLocation[]>(mockLocations);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Leaflet map after DOM is ready
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    setTimeout(() => {
      const instance = L.map('map', {
        center: [40.7500, -73.9800] as L.LatLngExpression, // Default: New York City area
        zoom: 11,
        preferCanvas: true,
        attributionControl: false,
      });

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      }).addTo(instance);

      // Add markers for each location
      locations.forEach((location) => {
        const marker = L.marker(location.coords as L.LatLngExpression, {
          icon: L.divIcon({
            html: `
              <div style="
                background: #3f51b5;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.7rem;
                font-weight: bold;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
              ">
                ${location.name.charAt(0)}
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
        }).addTo(instance);

        marker.bindPopup(`
          <b>${location.name}</b><br>
          <small>${location.address}</small><br>
          <small>Type: ${location.type}</small>
        `);
      });

      // Fit bounds to show all markers
      if (locations.length > 0) {
        const bounds = L.latLngBounds(
          locations.map((loc) => L.latLng(loc.coords as L.LatLngExpression))
        );
        instance.fitBounds(bounds, { padding: [20, 20] });
      }

      setMap(instance);
      setLoading(false);
    }, 100);
  }, []);

  useEffect(() => {
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [map]);

  return (
    <div className="page">
      {loading && <Loading size="md" text="Loading map..." />}

      <div className="page-header">
        <h1 className="page-title">Map</h1>
        <p className="page-subtitle">Market/Retail locations for inspections</p>
      </div>

      <div id="map" style={{ height: 'calc(100vh - 200px)', borderRadius: '8px', overflow: 'hidden' }} aria-label="Market locations map"></div>

      <div className="page-content">
        <Card className="map__locations">
          <CardHeader>
            <CardTitle>Market/Retail Locations</CardTitle>
          </CardHeader>
          <CardBody>
            {locations.map((location) => (
              <div key={location.id} className="map__location-item">
                <div className="map__location-icon">
                  <span style={{ background: '#3f51b5', color: 'white', width: 24, height: 24, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {location.name.charAt(0)}
                  </span>
                </div>
                <div className="map__location-details">
                  <h4 className="map__location-name">{location.name}</h4>
                  <p className="map__location-address">{location.address}</p>
                  <div className="map__location-type">
                    <span style={{ color: '#3f51b5' }}>{location.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card className="map__info">
          <CardHeader>
            <CardTitle>Map Information</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="map__info-text">
              The map above shows retail and market locations relevant to
              metrology inspections. These locations can be used to plan
              inspection routes and track visited sites.
            </p>
            <p className="map__info-text">
              Phase 1: Using OpenStreetMap (no API key required). Production
              deployment may integrate additional mapping providers.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default MapPage;