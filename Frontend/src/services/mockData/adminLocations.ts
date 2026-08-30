import { AdminLocation, AdminKpis, AdminTrendPoint, AdminCategoryPoint, AdminActivityPoint, AdminAuditEntry } from '../../types/admin';

/* ==========================================================================
   Geographic hierarchy: India → State → District → Market → Retail
   ========================================================================== */

const today = new Date();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const mockAdminLocations: AdminLocation[] = [
  {
    id: 'loc-india',
    name: 'India',
    level: 'country',
    lat: 22.5937,
    lng: 78.9629,
    metrics: {
      inspectionCount: 0,
      complaintCount: 0,
      potentialIssues: 0,
      repeatLocations: 0,
      pendingInspections: 0,
    },
  },
  /* Maharashtra */
  {
    id: 'loc-mh',
    name: 'Maharashtra',
    level: 'state',
    parentId: 'loc-india',
    lat: 19.7515,
    lng: 75.7139,
    metrics: {
      inspectionCount: 184,
      complaintCount: 42,
      potentialIssues: 11,
      repeatLocations: 4,
      pendingInspections: 9,
    },
    lastInspection: daysAgo(1),
    children: [
      {
        id: 'loc-mh-mum',
        name: 'Mumbai District',
        level: 'district',
        parentId: 'loc-mh',
        lat: 19.0760,
        lng: 72.8777,
        metrics: { inspectionCount: 72, complaintCount: 18, potentialIssues: 5, repeatLocations: 2, pendingInspections: 4 },
        lastInspection: daysAgo(1),
        children: [
          {
            id: 'loc-mum-central',
            name: 'South Mumbai Market',
            level: 'market',
            parentId: 'loc-mh-mum',
            lat: 18.9388,
            lng: 72.8354,
            metrics: { inspectionCount: 24, complaintCount: 7, potentialIssues: 2, repeatLocations: 1, pendingInspections: 2 },
            lastInspection: daysAgo(2),
            children: [
              {
                id: 'loc-retail-1',
                name: 'Crawford Market — Reliance Mart',
                level: 'retail',
                parentId: 'loc-mum-central',
                lat: 18.9470,
                lng: 72.8347,
                metrics: { inspectionCount: 8, complaintCount: 3, potentialIssues: 1, repeatLocations: 1, pendingInspections: 1 },
                lastInspection: daysAgo(2),
              },
              {
                id: 'loc-retail-2',
                name: 'Colaba — Heritage Foods',
                level: 'retail',
                parentId: 'loc-mum-central',
                lat: 18.9067,
                lng: 72.8147,
                metrics: { inspectionCount: 5, complaintCount: 2, potentialIssues: 1, repeatLocations: 0, pendingInspections: 0 },
                lastInspection: daysAgo(6),
              },
            ],
          },
          {
            id: 'loc-mum-andheri',
            name: 'Andheri Market',
            level: 'market',
            parentId: 'loc-mh-mum',
            lat: 19.1136,
            lng: 72.8697,
            metrics: { inspectionCount: 31, complaintCount: 9, potentialIssues: 3, repeatLocations: 1, pendingInspections: 1 },
            lastInspection: daysAgo(3),
            children: [
              {
                id: 'loc-retail-3',
                name: 'Andheri West — D-Mart',
                level: 'retail',
                parentId: 'loc-mum-andheri',
                lat: 19.1364,
                lng: 72.8296,
                metrics: { inspectionCount: 12, complaintCount: 4, potentialIssues: 2, repeatLocations: 1, pendingInspections: 1 },
                lastInspection: daysAgo(3),
              },
              {
                id: 'loc-retail-4',
                name: 'Andheri East — Big Bazaar',
                level: 'retail',
                parentId: 'loc-mum-andheri',
                lat: 19.1197,
                lng: 72.8468,
                metrics: { inspectionCount: 8, complaintCount: 3, potentialIssues: 1, repeatLocations: 0, pendingInspections: 0 },
                lastInspection: daysAgo(8),
              },
            ],
          },
        ],
      },
      {
        id: 'loc-mh-pune',
        name: 'Pune District',
        level: 'district',
        parentId: 'loc-mh',
        lat: 18.5204,
        lng: 73.8567,
        metrics: { inspectionCount: 58, complaintCount: 14, potentialIssues: 4, repeatLocations: 1, pendingInspections: 3 },
        lastInspection: daysAgo(2),
        children: [
          {
            id: 'loc-pune-market',
            name: 'Pune Central Market',
            level: 'market',
            parentId: 'loc-mh-pune',
            lat: 18.5290,
            lng: 73.8470,
            metrics: { inspectionCount: 27, complaintCount: 8, potentialIssues: 2, repeatLocations: 1, pendingInspections: 1 },
            lastInspection: daysAgo(2),
            children: [
              {
                id: 'loc-retail-5',
                name: 'JM Road — Star Bazaar',
                level: 'retail',
                parentId: 'loc-pune-market',
                lat: 18.5245,
                lng: 73.8400,
                metrics: { inspectionCount: 9, complaintCount: 3, potentialIssues: 1, repeatLocations: 0, pendingInspections: 0 },
                lastInspection: daysAgo(4),
              },
            ],
          },
        ],
      },
      {
        id: 'loc-mh-nag',
        name: 'Nagpur District',
        level: 'district',
        parentId: 'loc-mh',
        lat: 21.1458,
        lng: 79.0882,
        metrics: { inspectionCount: 54, complaintCount: 10, potentialIssues: 2, repeatLocations: 1, pendingInspections: 2 },
        lastInspection: daysAgo(5),
      },
    ],
  },
  /* Karnataka */
  {
    id: 'loc-ka',
    name: 'Karnataka',
    level: 'state',
    parentId: 'loc-india',
    lat: 14.5204,
    lng: 75.7224,
    metrics: {
      inspectionCount: 142,
      complaintCount: 31,
      potentialIssues: 8,
      repeatLocations: 3,
      pendingInspections: 6,
    },
    lastInspection: daysAgo(0),
    children: [
      {
        id: 'loc-ka-blr',
        name: 'Bengaluru District',
        level: 'district',
        parentId: 'loc-ka',
        lat: 12.9716,
        lng: 77.5946,
        metrics: { inspectionCount: 86, complaintCount: 19, potentialIssues: 5, repeatLocations: 2, pendingInspections: 4 },
        lastInspection: daysAgo(0),
        children: [
          {
            id: 'loc-blr-market',
            name: 'Indiranagar Market',
            level: 'market',
            parentId: 'loc-ka-blr',
            lat: 12.9784,
            lng: 77.6408,
            metrics: { inspectionCount: 38, complaintCount: 9, potentialIssues: 3, repeatLocations: 1, pendingInspections: 2 },
            lastInspection: daysAgo(0),
            children: [
              {
                id: 'loc-retail-6',
                name: '100 Feet Road — More Retail',
                level: 'retail',
                parentId: 'loc-blr-market',
                lat: 12.9783,
                lng: 77.6410,
                metrics: { inspectionCount: 14, complaintCount: 4, potentialIssues: 2, repeatLocations: 1, pendingInspections: 1 },
                lastInspection: daysAgo(0),
              },
            ],
          },
          {
            id: 'loc-blr-market-2',
            name: 'Whitefield Market',
            level: 'market',
            parentId: 'loc-ka-blr',
            lat: 12.9698,
            lng: 77.7500,
            metrics: { inspectionCount: 24, complaintCount: 5, potentialIssues: 1, repeatLocations: 1, pendingInspections: 1 },
            lastInspection: daysAgo(3),
          },
        ],
      },
      {
        id: 'loc-ka-mys',
        name: 'Mysuru District',
        level: 'district',
        parentId: 'loc-ka',
        lat: 12.2958,
        lng: 76.6394,
        metrics: { inspectionCount: 32, complaintCount: 7, potentialIssues: 2, repeatLocations: 1, pendingInspections: 1 },
        lastInspection: daysAgo(4),
      },
    ],
  },
  /* Delhi */
  {
    id: 'loc-dl',
    name: 'Delhi',
    level: 'state',
    parentId: 'loc-india',
    lat: 28.6139,
    lng: 77.2090,
    metrics: {
      inspectionCount: 124,
      complaintCount: 28,
      potentialIssues: 7,
      repeatLocations: 2,
      pendingInspections: 5,
    },
    lastInspection: daysAgo(1),
    children: [
      {
        id: 'loc-dl-cen',
        name: 'Central Delhi',
        level: 'district',
        parentId: 'loc-dl',
        lat: 28.6517,
        lng: 77.2211,
        metrics: { inspectionCount: 64, complaintCount: 16, potentialIssues: 4, repeatLocations: 1, pendingInspections: 3 },
        lastInspection: daysAgo(1),
        children: [
          {
            id: 'loc-dl-conn',
            name: 'Connaught Place Market',
            level: 'market',
            parentId: 'loc-dl-cen',
            lat: 28.6315,
            lng: 77.2167,
            metrics: { inspectionCount: 30, complaintCount: 8, potentialIssues: 2, repeatLocations: 1, pendingInspections: 1 },
            lastInspection: daysAgo(1),
            children: [
              {
                id: 'loc-retail-7',
                name: 'CP — Spencer\'s',
                level: 'retail',
                parentId: 'loc-dl-conn',
                lat: 28.6320,
                lng: 77.2190,
                metrics: { inspectionCount: 11, complaintCount: 3, potentialIssues: 1, repeatLocations: 1, pendingInspections: 1 },
                lastInspection: daysAgo(1),
              },
            ],
          },
        ],
      },
    ],
  },
  /* Tamil Nadu */
  {
    id: 'loc-tn',
    name: 'Tamil Nadu',
    level: 'state',
    parentId: 'loc-india',
    lat: 11.1271,
    lng: 78.6569,
    metrics: {
      inspectionCount: 98,
      complaintCount: 22,
      potentialIssues: 6,
      repeatLocations: 2,
      pendingInspections: 4,
    },
    lastInspection: daysAgo(2),
    children: [
      {
        id: 'loc-tn-che',
        name: 'Chennai District',
        level: 'district',
        parentId: 'loc-tn',
        lat: 13.0827,
        lng: 80.2707,
        metrics: { inspectionCount: 56, complaintCount: 13, potentialIssues: 4, repeatLocations: 1, pendingInspections: 2 },
        lastInspection: daysAgo(2),
      },
    ],
  },
];

/* ==========================================================================
   KPIs
   ========================================================================== */

export const mockAdminKpis: AdminKpis = {
  totalInspections: 548,
  productsScanned: 1284,
  openComplaints: 28,
  potentialIssues: 32,
  employees: 24,
  reportsGenerated: 86,
  pendingVerification: 14,
};

/* ==========================================================================
   Trend data
   ========================================================================== */

export const mockComplianceDistribution: AdminTrendPoint[] = [
  { label: 'Pass', value: 412 },
  { label: 'Review', value: 94 },
  { label: 'Potential Issue', value: 42 },
];

export const mockMonthlyInspections: AdminTrendPoint[] = [
  { label: 'Jan', value: 38 },
  { label: 'Feb', value: 52 },
  { label: 'Mar', value: 71 },
  { label: 'Apr', value: 64 },
  { label: 'May', value: 89 },
  { label: 'Jun', value: 95 },
  { label: 'Jul', value: 76 },
  { label: 'Aug', value: 63 },
];

export const mockComplaintTrend: AdminTrendPoint[] = [
  { label: 'Jan', value: 8 },
  { label: 'Feb', value: 11 },
  { label: 'Mar', value: 17 },
  { label: 'Apr', value: 14 },
  { label: 'May', value: 22 },
  { label: 'Jun', value: 19 },
  { label: 'Jul', value: 13 },
  { label: 'Aug', value: 9 },
];

export const mockPotentialIssueTrend: AdminTrendPoint[] = [
  { label: 'Jan', value: 4 },
  { label: 'Feb', value: 6 },
  { label: 'Mar', value: 9 },
  { label: 'Apr', value: 5 },
  { label: 'May', value: 11 },
  { label: 'Jun', value: 8 },
  { label: 'Jul', value: 6 },
  { label: 'Aug', value: 3 },
];

export const mockProductCategories: AdminCategoryPoint[] = [
  { category: 'Food & Beverages', count: 318, potentialIssues: 14 },
  { category: 'Pharmaceuticals', count: 92, potentialIssues: 8 },
  { category: 'Home & Kitchen', count: 76, potentialIssues: 4 },
  { category: 'Health & Supplements', count: 54, potentialIssues: 3 },
  { category: 'Personal Care', count: 41, potentialIssues: 2 },
  { category: 'Electronics', count: 28, potentialIssues: 1 },
];

export const mockInspectionActivity: AdminActivityPoint[] = [
  { date: 'Mon', inspections: 24, complaints: 6, scans: 41 },
  { date: 'Tue', inspections: 31, complaints: 8, scans: 49 },
  { date: 'Wed', inspections: 28, complaints: 5, scans: 53 },
  { date: 'Thu', inspections: 36, complaints: 9, scans: 61 },
  { date: 'Fri', inspections: 42, complaints: 11, scans: 72 },
  { date: 'Sat', inspections: 22, complaints: 4, scans: 38 },
  { date: 'Sun', inspections: 15, complaints: 2, scans: 24 },
];

/* ==========================================================================
   Audit log
   ========================================================================== */

export const mockAdminAudit: AdminAuditEntry[] = [
  { id: 'aud-001', timestamp: daysAgo(0), actor: 'System Administrator', action: 'Updated rule pack', target: 'Rule Pack v3.2', category: 'config', ip: '10.20.4.12' },
  { id: 'aud-002', timestamp: daysAgo(0), actor: 'System Administrator', action: 'Login', target: 'Admin Console', category: 'auth', ip: '10.20.4.12' },
  { id: 'aud-003', timestamp: daysAgo(1), actor: 'John Martinez', action: 'Closed complaint', target: 'comp-006', category: 'data', ip: '10.20.5.34' },
  { id: 'aud-004', timestamp: daysAgo(1), actor: 'Sarah Johnson', action: 'Generated report', target: 'Q1-Inspections-Report', category: 'data', ip: '10.20.5.55' },
  { id: 'aud-005', timestamp: daysAgo(2), actor: 'System Administrator', action: 'Granted role', target: 'emp-003 (Senior Inspector)', category: 'access', ip: '10.20.4.12' },
  { id: 'aud-006', timestamp: daysAgo(3), actor: 'System Administrator', action: 'Deactivated user', target: 'cit-009 (inactive)', category: 'access', ip: '10.20.4.12' },
  { id: 'aud-007', timestamp: daysAgo(3), actor: 'Michael Chen', action: 'Updated inspection', target: 'insp-014', category: 'data', ip: '10.20.6.78' },
  { id: 'aud-008', timestamp: daysAgo(4), actor: 'System Administrator', action: 'Created announcement', target: 'New rule update notice', category: 'config', ip: '10.20.4.12' },
];
