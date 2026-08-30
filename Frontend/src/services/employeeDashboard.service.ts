/* ==========================================================================
   Employee Dashboard Service
   Provides mock data for the Employee Home Dashboard.
   Replace with real API calls when backend is available.
   ========================================================================== */

/* ---- Types ---- */

export type ComplianceStatus = 'pass' | 'review_required' | 'potential_issue';
export type ActionPriority = 'high' | 'medium' | 'normal';
export type AnnouncementCategory = 'announcement' | 'campaign' | 'update' | 'system' | 'notification';

export interface DashboardStats {
  totalInspections: number;
  productsScanned: number;
  pendingReviews: number;
  openComplaints: number;
  potentialIssues: number;
  completedReports: number;
}

export interface ComplianceOverview {
  pass: number;
  reviewRequired: number;
  potentialIssue: number;
}

export interface RecentInspection {
  id: string;
  product: string;
  location: string;
  date: string;
  time: string;
  status: 'pass' | 'review_required' | 'potential_issue';
  officer: string;
}

export interface RecentComplaint {
  id: string;
  product: string;
  issue: string;
  location: string;
  submittedAt: string;
  priority: 'high' | 'medium' | 'normal';
  status: 'new' | 'under_review' | 'resolved';
  evidenceCount: number;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: ActionPriority;
  type: 'complaint' | 'inspection' | 'issue' | 'follow_up' | 'report';
  referenceId: string;
  dueDate?: string;
}

export interface DashboardUpdate {
  id: string;
  title: string;
  body: string;
  date: string;
  category: AnnouncementCategory;
  office: string;
}

/* ---- Mock Data ---- */

const MOCK_STATS: DashboardStats = {
  totalInspections: 245,
  productsScanned: 520,
  pendingReviews: 25,
  openComplaints: 21,
  potentialIssues: 13,
  completedReports: 207,
};

const MOCK_COMPLIANCE: Record<string, ComplianceOverview> = {
  '7days': { pass: 42, reviewRequired: 8, potentialIssue: 3 },
  '30days': { pass: 207, reviewRequired: 25, potentialIssue: 13 },
  'all': { pass: 245, reviewRequired: 30, potentialIssue: 18 },
};

const MOCK_RECENT_INSPECTIONS: RecentInspection[] = [
  {
    id: 'LM-2026-0245',
    product: 'ABC Biscuits Premium Pack',
    location: 'ABC Supermarket, MG Road',
    date: '29 Aug 2026',
    time: '10:42 AM',
    status: 'review_required',
    officer: 'John Martinez',
  },
  {
    id: 'LM-2026-0244',
    product: 'XYZ Aromatic Soap',
    location: 'XYZ Retail Store, Block B',
    date: '29 Aug 2026',
    time: '09:30 AM',
    status: 'pass',
    officer: 'John Martinez',
  },
  {
    id: 'LM-2026-0243',
    product: 'Fresh Farms Cooking Oil 1L',
    location: 'Fresh Mart, Sector 15',
    date: '28 Aug 2026',
    time: '03:15 PM',
    status: 'potential_issue',
    officer: 'Sarah Johnson',
  },
  {
    id: 'LM-2026-0242',
    product: 'PureLife Mineral Water 2L',
    location: 'PureLife Distributors',
    date: '28 Aug 2026',
    time: '11:00 AM',
    status: 'pass',
    officer: 'John Martinez',
  },
  {
    id: 'LM-2026-0241',
    product: 'GoldStar Wheat Flour 5kg',
    location: 'GoldStar Wholesale',
    date: '27 Aug 2026',
    time: '02:30 PM',
    status: 'review_required',
    officer: 'Sarah Johnson',
  },
  {
    id: 'LM-2026-0240',
    product: 'TastySnacks Chips Variety',
    location: 'TastySnacks Retail',
    date: '27 Aug 2026',
    time: '10:15 AM',
    status: 'pass',
    officer: 'John Martinez',
  },
];

const MOCK_RECENT_COMPLAINTS: RecentComplaint[] = [
  {
    id: 'CMP-2026-021',
    product: 'ABC Biscuits Premium Pack',
    issue: 'MRP discrepancy — printed MRP does not match the declared price',
    location: 'ABC Supermarket, MG Road',
    submittedAt: '2 hours ago',
    priority: 'high',
    status: 'new',
    evidenceCount: 3,
  },
  {
    id: 'CMP-2026-020',
    product: 'Fresh Farms Cooking Oil 1L',
    issue: 'Seal integrity compromised — packaging damage observed',
    location: 'Fresh Mart, Sector 15',
    submittedAt: '5 hours ago',
    priority: 'medium',
    status: 'under_review',
    evidenceCount: 2,
  },
  {
    id: 'CMP-2026-019',
    product: 'GoldStar Wheat Flour 5kg',
    issue: 'Weight less than declared — customer complaint',
    location: 'GoldStar Wholesale',
    submittedAt: '1 day ago',
    priority: 'high',
    status: 'under_review',
    evidenceCount: 4,
  },
  {
    id: 'CMP-2026-018',
    product: 'PureLife Mineral Water 2L',
    issue: 'Missing batch number on label',
    location: 'PureLife Distributors',
    submittedAt: '2 days ago',
    priority: 'normal',
    status: 'resolved',
    evidenceCount: 1,
  },
];

const MOCK_ACTION_ITEMS: ActionItem[] = [
  {
    id: 'ACT-001',
    title: 'New complaint requires inspection',
    description: 'CMP-2026-021: MRP discrepancy at ABC Supermarket, MG Road',
    priority: 'high',
    type: 'complaint',
    referenceId: 'CMP-2026-021',
    dueDate: '30 Aug 2026',
  },
  {
    id: 'ACT-002',
    title: 'Inspection awaiting verification',
    description: 'LM-2026-0245: ABC Biscuits Premium Pack — officer review required',
    priority: 'high',
    type: 'inspection',
    referenceId: 'LM-2026-0245',
  },
  {
    id: 'ACT-003',
    title: 'Potential issue needs review',
    description: 'LM-2026-0243: Fresh Farms Cooking Oil — seal integrity flagged',
    priority: 'high',
    type: 'issue',
    referenceId: 'LM-2026-0243',
  },
  {
    id: 'ACT-004',
    title: 'Weight complaint — follow-up needed',
    description: 'CMP-2026-019: GoldStar Wheat Flour 5kg — follow-up inspection',
    priority: 'medium',
    type: 'follow_up',
    referenceId: 'CMP-2026-019',
    dueDate: '01 Sep 2026',
  },
  {
    id: 'ACT-005',
    title: 'Report pending completion',
    description: 'LM-2026-0240: TastySnacks Chips — inspection report not finalized',
    priority: 'normal',
    type: 'report',
    referenceId: 'LM-2026-0240',
    dueDate: '02 Sep 2026',
  },
  {
    id: 'ACT-006',
    title: 'Low confidence OCR — re-inspection recommended',
    description: 'LM-2026-0241: GoldStar Wheat Flour — OCR confidence below 70%',
    priority: 'medium',
    type: 'inspection',
    referenceId: 'LM-2026-0241',
  },
];

const MOCK_UPDATES: DashboardUpdate[] = [
  {
    id: 'UPD-001',
    title: 'New Inspection Campaign: Packaged Commodity Verification Q3 2026',
    body: 'A statewide inspection campaign for packaged commodities has been initiated for Q3 2026. Officers are requested to prioritize markets and retail locations in their assigned regions.',
    date: '28 Aug 2026',
    category: 'campaign',
    office: 'Regional Metrology Office',
  },
  {
    id: 'UPD-002',
    title: 'Updated Compliance Guidelines for Pre-Packaged Food Products',
    body: 'Revised guidelines for compliance checking of pre-packaged food products have been published. The updated rule matrix reflects recent regulatory changes. Officers should review before next inspection cycle.',
    date: '25 Aug 2026',
    category: 'update',
    office: 'Legal Metrology Division',
  },
  {
    id: 'UPD-003',
    title: 'System Maintenance — Scheduled Downtime',
    body: 'The Metrology Portal will be unavailable on 01 Sep 2026 from 02:00 to 06:00 IST for scheduled maintenance. Officers are advised to complete pending inspections before this window.',
    date: '27 Aug 2026',
    category: 'system',
    office: 'IT Services',
  },
  {
    id: 'UPD-004',
    title: 'Quarterly Review Meeting — Officers Required',
    body: 'The Q3 quarterly review meeting for all Legal Metrology officers is scheduled for 05 Sep 2026 at 10:00 AM. Attendance is mandatory. Agenda includes compliance statistics, pending cases, and campaign planning.',
    date: '26 Aug 2026',
    category: 'announcement',
    office: 'Regional Metrology Office',
  },
];

/* ---- Service ---- */

export const employeeDashboardService = {
  getStats(): DashboardStats {
    return { ...MOCK_STATS };
  },

  getComplianceOverview(filter: 'today' | '7days' | '30days' | 'all' = '30days'): ComplianceOverview {
    return { ...MOCK_COMPLIANCE[filter] };
  },

  getRecentInspections(): RecentInspection[] {
    return [...MOCK_RECENT_INSPECTIONS];
  },

  getRecentComplaints(): RecentComplaint[] {
    return [...MOCK_RECENT_COMPLAINTS];
  },

  getActionItems(): ActionItem[] {
    return [...MOCK_ACTION_ITEMS];
  },

  getUpdates(): DashboardUpdate[] {
    return [...MOCK_UPDATES];
  },
};

export default employeeDashboardService;
