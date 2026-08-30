/* ==========================================================================
   Inspection Map Page
   Task K — Inspection Map

   Leaflet + OpenStreetMap with mock inspection locations.
   Markers categorized by priority. Popup shows business details.
   Filters and legend.

   Reuses Leaflet (already a dependency). Markers styled via SVG-style
   divIcons (no emoji in actual map UI).
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import {
  InspectionLocation,
  MapPriority,
  getInspectionLocations,
  MARKER_STYLE,
} from '../../services/inspectionMap.service';

type PriorityFilter = 'all' | MapPriority;
type DateFilter = 'all' | 'week' | 'month';
type StatusFilter = 'all' | 'inspected' | 'pending' | 'high_priority';

export const InspectionMap: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'loading' | 'done'>('loading');
  const [locations, setLocations] = useState<InspectionLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<InspectionLocation | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [markerLayer, setMarkerLayer] = useState<L.LayerGroup | null>(null);

  /* ---- Load data on mount ---- */

  useEffect(() => {
    setTimeout(() => {
      setLocations(getInspectionLocations());
      setPhase('done');
    }, 300);
  }, []);

  /* ---- Initialize map after first render ---- */

  useEffect(() => {
    if (phase !== 'done') return;
    const mapElement = document.getElementById('emp-map');
    if (!mapElement) return;

    setTimeout(() => {
      const instance = L.map('emp-map', {
        center: [40.7520, -73.9650] as L.LatLngExpression,
        zoom: 12,
        preferCanvas: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      }).addTo(instance);

      const layer = L.layerGroup().addTo(instance);

      setMapInstance(instance);
      setMarkerLayer(layer);
    }, 100);

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ---- Filtered locations ---- */

  const filteredLocations = locations.filter(loc => {
    if (priorityFilter !== 'all' && loc.priority !== priorityFilter) return false;
    if (statusFilter !== 'all' && loc.mapStatus !== statusFilter) return false;
    if (categoryFilter !== 'all' && loc.type !== categoryFilter) return false;
    if (dateFilter !== 'all') {
      if (!loc.lastInspection) return false;
      const d = new Date(loc.lastInspection);
      const now = new Date();
      const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      if (dateFilter === 'week' && diffDays > 7) return false;
      if (dateFilter === 'month' && diffDays > 30) return false;
    }
    return true;
  });

  /* ---- Render markers ---- */

  useEffect(() => {
    if (!markerLayer) return;
    markerLayer.clearLayers();

    filteredLocations.forEach(loc => {
      const style = MARKER_STYLE[loc.priority];
      const marker = L.marker(loc.coords as L.LatLngExpression, {
        icon: L.divIcon({
          html: `
            <div style="
              background: ${style.bgColor};
              color: ${style.color};
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 3px solid ${style.borderColor};
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 0.85rem;
              font-weight: bold;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ">
              ${loc.priority === 'high' ? '!' : loc.priority === 'medium' ? '◐' : '✓'}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        }),
      }).addTo(markerLayer);

      marker.bindPopup(`
        <div style="min-width:200px; font-family: inherit;">
          <strong style="font-size:14px;">${loc.name}</strong><br>
          <small style="color:#666;">${loc.address}</small><br>
          <div style="margin-top:6px;">
            <span style="display:inline-block; padding:2px 8px; background:${style.bgColor}; color:${style.color}; border-radius:10px; font-size:11px; font-weight:600;">
              ${style.label}
            </span>
          </div>
          <div style="margin-top:6px; font-size:12px;">
            <div>Inspections: <strong>${loc.inspectionCount}</strong></div>
            <div>Status: <strong>${loc.latestStatus}</strong></div>
            ${loc.openComplaints > 0 ? `<div style="color:#d32f2f;">Open complaints: <strong>${loc.openComplaints}</strong></div>` : ''}
          </div>
        </div>
      `);
    });

    if (filteredLocations.length > 0 && mapInstance) {
      const bounds = L.latLngBounds(
        filteredLocations.map((loc) => L.latLng(loc.coords as L.LatLngExpression))
      );
      mapInstance.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [markerLayer, filteredLocations, mapInstance]);

  /* ---- Handlers ---- */

  const handleClearFilters = () => {
    setPriorityFilter('all');
    setStatusFilter('all');
    setDateFilter('all');
    setCategoryFilter('all');
  };

  const handleViewDetails = (loc: InspectionLocation) => {
    setSelectedLocation(loc);
  };

  const handleStartInspection = () => {
    navigate('/employee/inspection/new');
  };

  const handleViewInspections = (loc: InspectionLocation) => {
    setSelectedLocation(loc);
  };

  /* ---- Render ---- */

  if (phase === 'loading') {
    return (
      <div className="page im-page">
        <h1 className="page-title">Inspection Map</h1>
        <p className="page-subtitle">Loading map...</p>
        <style>{imStyles}</style>
      </div>
    );
  }

  return (
    <div className="page im-page">
      {/* Header */}
      <div className="im-header">
        <h1 className="page-title">Inspection Map</h1>
        <p className="page-subtitle">
          View inspection locations by priority. Click markers for details.
        </p>
      </div>

      <div className="im-body">
        {/* Left column: filters + legend + location list */}
        <div className="im-sidebar">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="im-filters">
                <div className="im-filter-group">
                  <label className="im-filter-label">Priority</label>
                  <select
                    className="im-filter-select"
                    value={priorityFilter}
                    onChange={e => setPriorityFilter(e.target.value as PriorityFilter)}
                  >
                    <option value="all">All</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="im-filter-group">
                  <label className="im-filter-label">Status</label>
                  <select
                    className="im-filter-select"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as StatusFilter)}
                  >
                    <option value="all">All</option>
                    <option value="inspected">Recently Inspected</option>
                    <option value="pending">Pending</option>
                    <option value="high_priority">High Priority</option>
                  </select>
                </div>
                <div className="im-filter-group">
                  <label className="im-filter-label">Date</label>
                  <select
                    className="im-filter-select"
                    value={dateFilter}
                    onChange={e => setDateFilter(e.target.value as DateFilter)}
                  >
                    <option value="all">All</option>
                    <option value="week">Past 7 Days</option>
                    <option value="month">Past 30 Days</option>
                  </select>
                </div>
                <div className="im-filter-group">
                  <label className="im-filter-label">Category</label>
                  <select
                    className="im-filter-select"
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="supermarket">Supermarket</option>
                    <option value="market">Market</option>
                    <option value="retail">Retail</option>
                  </select>
                </div>
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle>Legend</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="im-legend">
                <div className="im-legend__row">
                  <span className="im-legend__dot" style={{ background: '#d32f2f', borderColor: '#d32f2f' }}>!</span>
                  <span>High Priority</span>
                </div>
                <div className="im-legend__row">
                  <span className="im-legend__dot" style={{ background: '#f57c00', borderColor: '#f57c00' }}>◐</span>
                  <span>Pending Inspection</span>
                </div>
                <div className="im-legend__row">
                  <span className="im-legend__dot" style={{ background: '#2e7d32', borderColor: '#2e7d32' }}>✓</span>
                  <span>Recently Inspected</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Location list */}
          <Card>
            <CardHeader>
              <CardTitle>Locations</CardTitle>
              <span className="im-count">{filteredLocations.length}</span>
            </CardHeader>
            <CardBody>
              <div className="im-location-list">
                {filteredLocations.map(loc => {
                  const style = MARKER_STYLE[loc.priority];
                  return (
                    <button
                      key={loc.id}
                      className="im-location-item"
                      onClick={() => handleViewDetails(loc)}
                    >
                      <span
                        className="im-location-item__dot"
                        style={{ background: style.bgColor, color: style.color, borderColor: style.borderColor }}
                      >
                        {loc.priority === 'high' ? '!' : loc.priority === 'medium' ? '◐' : '✓'}
                      </span>
                      <div className="im-location-item__body">
                        <div className="im-location-item__name">{loc.name}</div>
                        <div className="im-location-item__address">{loc.address}</div>
                        <div className="im-location-item__meta">
                          <Badge variant={loc.priority === 'high' ? 'error' : loc.priority === 'medium' ? 'warning' : 'success'} size="sm">
                            {style.label}
                          </Badge>
                          <span>{loc.inspectionCount} inspection(s)</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Map + details */}
        <div className="im-map-area">
          <div id="emp-map" className="im-map" aria-label="Inspection locations map"></div>

          {selectedLocation && (
            <Card className="im-details">
              <CardHeader>
                <CardTitle>{selectedLocation.name}</CardTitle>
                <button
                  className="im-details__close"
                  onClick={() => setSelectedLocation(null)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </CardHeader>
              <CardBody>
                <div className="im-details__row">
                  <span>Address</span>
                  <strong>{selectedLocation.address}</strong>
                </div>
                <div className="im-details__row">
                  <span>Last Inspection</span>
                  <strong>{selectedLocation.lastInspection ?? 'Not yet inspected'}</strong>
                </div>
                <div className="im-details__row">
                  <span>Inspection Count</span>
                  <strong>{selectedLocation.inspectionCount}</strong>
                </div>
                <div className="im-details__row">
                  <span>Products Inspected</span>
                  <strong>{selectedLocation.products.length > 0 ? selectedLocation.products.join(', ') : 'None'}</strong>
                </div>
                <div className="im-details__row">
                  <span>Open Complaints</span>
                  <strong style={{ color: selectedLocation.openComplaints > 0 ? '#d32f2f' : 'inherit' }}>
                    {selectedLocation.openComplaints}
                  </strong>
                </div>
                <div className="im-details__row">
                  <span>Latest Status</span>
                  <Badge variant={selectedLocation.priority === 'high' ? 'error' : selectedLocation.priority === 'medium' ? 'warning' : 'success'} size="sm">
                    {selectedLocation.latestStatus}
                  </Badge>
                </div>
                <div className="im-details__actions">
                  <Button variant="primary" size="sm" onClick={handleStartInspection}>
                    Start Inspection
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleViewInspections(selectedLocation)}>
                    View Inspections
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <style>{imStyles}</style>
    </div>
  );
};

export default InspectionMap;

/* ==========================================================================
   Styles
   ========================================================================== */

const imStyles = `
  .im-page { max-width: 1400px; margin: 0 auto; }
  .im-header { margin-bottom: var(--space-4); }

  .im-body { display: grid; grid-template-columns: 300px 1fr; gap: var(--space-4); align-items: flex-start; }
  @media (max-width: 900px) { .im-body { grid-template-columns: 1fr; } }

  /* Sidebar */
  .im-sidebar { display: flex; flex-direction: column; gap: var(--space-3); }
  .im-count { background: var(--color-navy-100); color: var(--color-navy-700); padding: 2px 8px; border-radius: 12px; font-size: var(--font-size-xs); }

  /* Filters */
  .im-filters { display: flex; flex-direction: column; gap: var(--space-2); }
  .im-filter-group { display: flex; flex-direction: column; gap: var(--space-1); }
  .im-filter-label { font-size: 11px; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.3px; font-weight: var(--font-weight-bold); }
  .im-filter-select {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-gray-300);
    border-radius: var(--radius-md);
    font-family: inherit;
    font-size: var(--font-size-sm);
    color: var(--color-navy-900);
    background: var(--color-white);
  }
  .im-filter-select:focus { outline: none; border-color: var(--color-navy-500); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }

  /* Legend */
  .im-legend { display: flex; flex-direction: column; gap: var(--space-2); }
  .im-legend__row { display: flex; align-items: center; gap: var(--space-2); font-size: var(--font-size-sm); color: var(--color-gray-700); }
  .im-legend__dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 12px;
  }

  /* Location list */
  .im-location-list { display: flex; flex-direction: column; gap: var(--space-2); max-height: 400px; overflow-y: auto; }
  .im-location-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    padding: var(--space-2);
    background: var(--color-gray-50);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-sm);
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    transition: all var(--transition-fast);
  }
  .im-location-item:hover { background: var(--color-navy-50); border-color: var(--color-navy-300); }
  .im-location-item__dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 11px;
    flex-shrink: 0;
  }
  .im-location-item__body { flex: 1; min-width: 0; }
  .im-location-item__name { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-navy-900); }
  .im-location-item__address { font-size: 11px; color: var(--color-gray-600); }
  .im-location-item__meta { display: flex; align-items: center; gap: var(--space-2); margin-top: 4px; font-size: 11px; color: var(--color-gray-500); }

  /* Map area */
  .im-map-area { position: relative; }
  .im-map {
    width: 100%;
    height: 600px;
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 1px solid var(--color-gray-200);
  }
  @media (max-width: 768px) { .im-map { height: 400px; } }

  /* Location details */
  .im-details { margin-top: var(--space-3); }
  .im-details__close {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-gray-600);
    font-size: 1.1rem;
    padding: var(--space-1);
    line-height: 1;
  }
  .im-details__row { display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-sm); padding: var(--space-2) 0; border-bottom: 1px solid var(--color-gray-100); }
  .im-details__row span { color: var(--color-gray-500); font-size: 11px; text-transform: uppercase; }
  .im-details__actions { display: flex; gap: var(--space-2); margin-top: var(--space-3); }
`;
