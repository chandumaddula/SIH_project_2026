/* ==========================================================================
   Inspection Map Service
   Mock inspection location data for the Employee map.

   Provides:
   - getInspectionLocations()
   - getLocationById(id)

   Reuses mockLocations from mockData.ts.
   ========================================================================== */

import { MarketLocation } from '../types/map';
import { mockLocations } from './mockData';

/* ---- Types ---- */

export type MapPriority = 'high' | 'medium' | 'low';
export type InspectionMapStatus = 'inspected' | 'pending' | 'high_priority';

export interface InspectionLocation extends MarketLocation {
  priority: MapPriority;
  mapStatus: InspectionMapStatus;
  lastInspection?: string;
  inspectionCount: number;
  products: string[];
  openComplaints: number;
  latestStatus: string;
}

/* ---- Mock enrichment ---- */

const MOCK_INSPECTION_DATA: Record<string, {
  priority: MapPriority;
  mapStatus: InspectionMapStatus;
  lastInspection?: string;
  inspectionCount: number;
  products: string[];
  openComplaints: number;
  latestStatus: string;
}> = {
  'loc-001': { priority: 'low', mapStatus: 'inspected', lastInspection: '2024-03-15', inspectionCount: 5, products: ['Medicine Plus Tablets', 'Family Health Vitamins'], openComplaints: 0, latestStatus: 'Compliant' },
  'loc-002': { priority: 'high', mapStatus: 'pending', lastInspection: '2024-03-14', inspectionCount: 3, products: ['Fresh Farms Vegetable Oil'], openComplaints: 1, latestStatus: 'Potential Issue' },
  'loc-003': { priority: 'medium', mapStatus: 'pending', lastInspection: '2024-03-13', inspectionCount: 2, products: ['Pure Water Filters'], openComplaints: 0, latestStatus: 'Review Required' },
  'loc-004': { priority: 'medium', mapStatus: 'inspected', lastInspection: '2024-03-12', inspectionCount: 1, products: ['Family Health Vitamins'], openComplaints: 0, latestStatus: 'Review Required' },
  'loc-005': { priority: 'high', mapStatus: 'high_priority', lastInspection: '2024-03-11', inspectionCount: 2, products: ['Organic Jam Jars'], openComplaints: 1, latestStatus: 'Potential Issue' },
  'loc-006': { priority: 'low', mapStatus: 'inspected', lastInspection: '2024-03-10', inspectionCount: 1, products: ['Crispy Snacks Variety Pack'], openComplaints: 0, latestStatus: 'Pending' },
  'loc-007': { priority: 'medium', mapStatus: 'pending', inspectionCount: 0, products: [], openComplaints: 0, latestStatus: 'Not Inspected' },
  'loc-008': { priority: 'low', mapStatus: 'inspected', lastInspection: '2024-03-08', inspectionCount: 4, products: ['Medicine Plus Tablets', 'Family Health Vitamins'], openComplaints: 0, latestStatus: 'Compliant' },
};

/* ---- Enrich locations ---- */

export const getInspectionLocations = (): InspectionLocation[] => {
  return mockLocations.map(loc => {
    const extra = MOCK_INSPECTION_DATA[loc.id] ?? {
      priority: 'low' as MapPriority,
      mapStatus: 'pending' as InspectionMapStatus,
      inspectionCount: 0,
      products: [],
      openComplaints: 0,
      latestStatus: 'Not Inspected',
    };
    return { ...loc, ...extra };
  });
};

export const getLocationById = (id: string): InspectionLocation | null => {
  const all = getInspectionLocations();
  return all.find(l => l.id === id) ?? null;
};

/* ---- Marker style helpers ---- */

export const MARKER_STYLE: Record<MapPriority, { color: string; bgColor: string; borderColor: string; label: string }> = {
  high: { color: '#d32f2f', bgColor: '#ffebee', borderColor: '#d32f2f', label: 'High Priority' },
  medium: { color: '#f57c00', bgColor: '#fff3e0', borderColor: '#f57c00', label: 'Pending' },
  low: { color: '#2e7d32', bgColor: '#e8f5e9', borderColor: '#2e7d32', label: 'Recently Inspected' },
};
