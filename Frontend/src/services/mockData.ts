import { CitizenComplaint } from '../types/complaint';
import { ScanResult } from '../types/scan';
import { ComplianceResult } from '../types/compliance';
import { Inspection } from '../types/inspection';
import { GovtAnnouncement } from '../types/announcement';
import { MarketLocation } from '../types/map';

// Import from subdirectory for use in this file
import { mockEmployees } from './mockData/employees';
import { mockCitizens } from './mockData/citizens';
import { mockAdmins } from './mockData/admins';

// Re-export for external convenience
export { mockEmployees, mockEmployeePasswords } from './mockData/employees';
export { mockCitizens, mockCitizenPasswords } from './mockData/citizens';
export { mockAdmins, mockAdminPasswords } from './mockData/admins';

/* ==========================================================================
   Mock Citizen Complaints
   ========================================================================== */
export const mockComplaints: CitizenComplaint[] = [
  {
    id: 'comp-001',
    reporterId: 'cit-001',
    reporterName: 'Jane Smith',
    product: 'Medicine Plus Tablets',
    packageLabel: 'Batch #RX-2024-118',
    issue: 'Missing expiration date on package',
    status: 'NEW',
    submittedAt: '2024-03-15T10:30:00Z',
    location: 'Downtown Pharmacy',
    priority: 'HIGH',
    evidence: [],
    notes: [],
    timeline: [
      {
        id: 'tl-001',
        status: 'NEW',
        timestamp: '2024-03-15T10:30:00Z',
        note: 'Complaint submitted by citizen'
      }
    ]
  },
  {
    id: 'comp-002',
    reporterId: 'cit-002',
    reporterName: 'Anonymous',
    product: 'Fresh Farms Vegetable Oil',
    packageLabel: 'Lot #VEG-2024-045',
    issue: 'Seal broken on delivery package',
    status: 'ASSIGNED',
    submittedAt: '2024-03-12T14:15:00Z',
    location: 'Westside Market',
    priority: 'MEDIUM',
    evidence: [],
    notes: [],
    assignedTo: 'emp-001',
    timeline: [
      {
        id: 'tl-002',
        status: 'NEW',
        timestamp: '2024-03-12T14:15:00Z',
        note: 'Complaint submitted by citizen'
      },
      {
        id: 'tl-003',
        status: 'ASSIGNED',
        timestamp: '2024-03-13T09:00:00Z',
        note: 'Assigned to John Martinez for review',
        updatedBy: 'emp-001'
      }
    ]
  },
  {
    id: 'comp-003',
    reporterId: 'cit-003',
    reporterName: 'Michael Chen',
    product: 'Pure Water Filters',
    packageLabel: 'Batch #WF-2024-203',
    issue: 'Weight discrepancy - package labeled 500g, actual 475g',
    status: 'UNDER_INSPECTION',
    submittedAt: '2024-03-10T09:45:00Z',
    location: 'City Supermarket',
    priority: 'HIGH',
    evidence: [],
    notes: [],
    assignedTo: 'emp-002',
    timeline: [
      {
        id: 'tl-004',
        status: 'NEW',
        timestamp: '2024-03-10T09:45:00Z',
        note: 'Complaint submitted by citizen'
      },
      {
        id: 'tl-005',
        status: 'ASSIGNED',
        timestamp: '2024-03-11T08:00:00Z',
        note: 'Assigned to Sarah Johnson',
        updatedBy: 'emp-001'
      },
      {
        id: 'tl-006',
        status: 'UNDER_INSPECTION',
        timestamp: '2024-03-11T10:30:00Z',
        note: 'Physical inspection scheduled',
        updatedBy: 'emp-002'
      }
    ]
  },
  {
    id: 'comp-004',
    reporterId: 'cit-004',
    reporterName: 'Anonymous',
    product: 'Family Health Vitamins',
    packageLabel: 'Bottle #VIT-2024-88',
    issue: 'No nutritional information panel visible',
    status: 'RESOLVED',
    submittedAt: '2024-03-05T16:20:00Z',
    location: 'Eastside Health Store',
    priority: 'NORMAL',
    evidence: [],
    notes: [],
    assignedTo: 'emp-001',
    timeline: [
      {
        id: 'tl-007',
        status: 'NEW',
        timestamp: '2024-03-05T16:20:00Z',
        note: 'Complaint submitted by citizen'
      },
      {
        id: 'tl-008',
        status: 'ASSIGNED',
        timestamp: '2024-03-06T10:00:00Z',
        note: 'Investigation started',
        updatedBy: 'emp-001'
      },
      {
        id: 'tl-009',
        status: 'UNDER_INSPECTION',
        timestamp: '2024-03-07T09:00:00Z',
        note: 'Inspection underway',
        updatedBy: 'emp-001'
      },
      {
        id: 'tl-010',
        status: 'RESOLVED',
        timestamp: '2024-03-12T15:30:00Z',
        note: 'Issue resolved — vendor replaced non-compliant products',
        updatedBy: 'emp-001'
      }
    ]
  },
  {
    id: 'comp-005',
    reporterId: 'cit-005',
    reporterName: 'Sarah Johnson',
    product: 'Organic Jam Jars',
    packageLabel: 'Case #ORG-2024-012',
    issue: 'Sealed packages appearing damaged',
    status: 'NEW',
    submittedAt: '2024-03-08T11:00:00Z',
    location: 'Green Valley Market',
    priority: 'MEDIUM',
    evidence: [],
    notes: [],
    timeline: [
      {
        id: 'tl-011',
        status: 'NEW',
        timestamp: '2024-03-08T11:00:00Z',
        note: 'Complaint submitted by citizen'
      }
    ]
  }
];

/* ==========================================================================
   Mock Inspection Data
   ========================================================================== */
export const mockInspections: Inspection[] = [
  {
    id: 'insp-001',
    location: 'City Supermarket - Aisle 3',
    date: '2024-03-15',
    time: '09:30',
    status: 'completed',
    product: 'Medicine Plus Tablets',
    result: 'Packaging compliant, seal intact',
    compliance: 'compliant',
    complaintRaised: false,
    inspectorId: 'emp-001'
  },
  {
    id: 'insp-002',
    location: 'Westside Market - Entrance',
    date: '2024-03-14',
    time: '14:45',
    status: 'completed',
    product: 'Fresh Farms Vegetable Oil',
    result: 'Damage observed, seal compromised',
    compliance: 'non_compliant',
    complaintRaised: true,
    inspectorId: 'emp-001'
  },
  {
    id: 'insp-003',
    location: 'Downtown Pharmacy - Shelf B',
    date: '2024-03-13',
    time: '10:15',
    status: 'flagged',
    product: 'Pure Water Filters',
    result: 'Weight discrepancy detected',
    compliance: 'non_compliant',
    complaintRaised: false,
    inspectorId: 'emp-001'
  },
  {
    id: 'insp-004',
    location: 'Eastside Health Store',
    date: '2024-03-12',
    time: '09:00',
    status: 'completed',
    product: 'Family Health Vitamins',
    result: 'Missing nutrition panel',
    compliance: 'non_compliant',
    complaintRaised: false,
    inspectorId: 'emp-001'
  },
  {
    id: 'insp-005',
    location: 'Green Valley Market',
    date: '2024-03-11',
    time: '15:30',
    status: 'completed',
    product: 'Organic Jam Jars',
    result: 'Seal damage, refrigeration needed',
    compliance: 'non_compliant',
    complaintRaised: true,
    inspectorId: 'emp-001'
  },
  {
    id: 'insp-006',
    location: 'City Supermarket - Snack Aisle',
    date: '2024-03-10',
    time: '11:45',
    status: 'scheduled',
    product: 'Crispy Snacks Variety Pack',
    result: 'Awaiting inspection',
    compliance: undefined,
    complaintRaised: false,
    inspectorId: 'emp-001'
  }
];

/* ==========================================================================
   Mock Compliance Results
   ========================================================================== */
export const mockComplianceResults: ComplianceResult[] = [
  {
    id: 'comp-res-001',
    scanId: 'scan-001',
    product: 'Medicine Plus Tablets',
    compliant: true,
    missingInfo: [],
    inspectedAt: '2024-03-15T09:35:00Z',
    inspector: 'John Martinez',
    notes: 'Package meets all regulatory requirements'
  },
  {
    id: 'comp-res-002',
    scanId: 'scan-002',
    product: 'Fresh Farms Vegetable Oil',
    compliant: false,
    missingInfo: ['Seal Integrity', 'Damage Assessment'],
    inspectedAt: '2024-03-14T14:50:00Z',
    inspector: 'John Martinez',
    notes: 'Package seal compromised, requires replacement'
  },
  {
    id: 'comp-res-003',
    scanId: 'scan-003',
    product: 'Pure Water Filters',
    compliant: false,
    missingInfo: ['Weight Verification'],
    inspectedAt: '2024-03-13T10:20:00Z',
    inspector: 'John Martinez',
    notes: 'Weight discrepancy exceeds tolerance'
  }
];

/* ==========================================================================
   Mock Scan Results
   ========================================================================== */
export const mockScanResults: ScanResult[] = [
  {
    id: 'scan-001',
    imageUrl: 'https://via.placeholder.com/300x200/3f51b5/ffffff?text=Medicine+Plus',
    capturedAt: '2024-03-15T09:25:00Z',
    detected: {
      productName: 'Medicine Plus Tablets',
      mfgDate: '2024-01-15',
      expDate: '2025-01-15',
      batchNumber: 'RX-2024-118',
      licenseNumber: 'MED-GOV-2024-001'
    },
    missing: [],
    isCompliant: true,
    inspectorId: 'emp-001'
  },
  {
    id: 'scan-002',
    imageUrl: 'https://via.placeholder.com/300x200/e53935/ffffff?text=Vegetable+Oil',
    capturedAt: '2024-03-14T14:30:00Z',
    detected: {
      productName: 'Fresh Farms Vegetable Oil',
      batchNumber: 'VEG-2024-045',
      weight: '1L'
    },
    missing: ['Manufacturing Date', 'Expiry Date', 'License Number', 'Ingredients'],
    isCompliant: false,
    inspectorId: 'emp-001'
  },
  {
    id: 'scan-003',
    imageUrl: 'https://via.placeholder.com/300x200/43a047/ffffff?text=Water+Filters',
    capturedAt: '2024-03-13T09:55:00Z',
    detected: {
      productName: 'Pure Water Filters',
      batchNumber: 'WF-2024-203',
      weight: '500g'
    },
    missing: ['Manufacturing Date', 'Expiry Date', 'License Number', 'Usage Instructions'],
    isCompliant: false,
    inspectorId: 'emp-001'
  }
];

/* ==========================================================================
   Mock Government Announcements
   ========================================================================== */
export const mockAnnouncements: GovtAnnouncement[] = [
  {
    id: 'ann-001',
    title: 'New Product Labeling Regulations Effective April 2024',
    body: 'All products must now include clearer ingredient lists and nutrition panels. Updated compliance guidelines are available on the portal.',
    office: 'Regional Metrology Office',
    publishedAt: '2024-03-10T08:00:00Z',
    priority: 'high'
  },
  {
    id: 'ann-002',
    title: 'Quarterly Inspection Schedule Released',
    body: 'The schedule for Q1-Q2 2024 inspections has been published. Please check your assigned locations.',
    office: 'Regional Metrology Office',
    publishedAt: '2024-03-08T10:00:00Z',
    priority: 'medium'
  },
  {
    id: 'ann-003',
    title: 'New Digital Complaint System Beta Available',
    body: 'Try the new citizen complaint portal and provide feedback. Look for the "Report Issue" button on your dashboard.',
    office: 'Digital Services Division',
    publishedAt: '2024-03-05T14:00:00Z',
    priority: 'medium'
  },
  {
    id: 'ann-004',
    title: 'System Maintenance - March 20, 2024',
    body: 'Scheduled maintenance window from 01:00 to 05:00 GMT. Dashboard will be temporarily unavailable.',
    office: 'IT Services',
    publishedAt: '2024-03-01T09:00:00Z',
    priority: 'high'
  },
  {
    id: 'ann-005',
    title: 'Staff Training - New Compliance Checks',
    body: 'Mandatory training sessions scheduled for next week. Please check the internal calendar for details.',
    office: 'Training Division',
    publishedAt: '2024-02-28T11:30:00Z',
    priority: 'low'
  },
  {
    id: 'ann-006',
    title: 'Public Holiday Closure Notice',
    body: 'Office will be closed on March 29, 2024 for Good Friday. Regular inspections will resume March 30.',
    office: 'Regional Metrology Office',
    publishedAt: '2024-02-26T16:00:00Z',
    priority: 'medium'
  }
];

/* ==========================================================================
   Mock Map Locations
   ========================================================================== */
export const mockLocations: MarketLocation[] = [
  {
    id: 'loc-001',
    name: 'City Supermarket',
    type: 'supermarket',
    address: '123 Main Street, Downtown',
    coords: [-73.9857, 40.7484]
  },
  {
    id: 'loc-002',
    name: 'Westside Market',
    type: 'market',
    address: '456 West Avenue, Midtown',
    coords: [-73.9750, 40.7505]
  },
  {
    id: 'loc-003',
    name: 'Downtown Pharmacy',
    type: 'retail',
    address: '789 Broad Street, Downtown',
    coords: [-73.9783, 40.7505]
  },
  {
    id: 'loc-004',
    name: 'Eastside Health Store',
    type: 'retail',
    address: '321 East Road, Upper East Side',
    coords: [-73.9587, 40.7750]
  },
  {
    id: 'loc-005',
    name: 'Green Valley Market',
    type: 'market',
    address: '555 Green Lane, Green Valley',
    coords: [-73.9300, 40.7600]
  },
  {
    id: 'loc-006',
    name: 'City Fresh Food Market',
    type: 'market',
    address: '999 Food Plaza, Central District',
    coords: [-73.9500, 40.7450]
  },
  {
    id: 'loc-007',
    name: 'Express Grocery',
    type: 'retail',
    address: '111 Express Lane, Downtown',
    coords: [-73.9800, 40.7450]
  },
  {
    id: 'loc-008',
    name: 'Premium Supermarket',
    type: 'supermarket',
    address: '777 Premium Boulevard, Midtown',
    coords: [-73.9650, 40.7530]
  }
];

/* ==========================================================================
   Mock Data Aggregates
   ========================================================================== */
export const mockData = {
  employees: mockEmployees,
  citizens: mockCitizens,
  admins: mockAdmins,
  complaints: mockComplaints,
  inspections: mockInspections,
  complianceResults: mockComplianceResults,
  scanResults: mockScanResults,
  announcements: mockAnnouncements,
  locations: mockLocations
};