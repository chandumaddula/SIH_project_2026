import { CitizenComplaint } from '../../types/citizen';

export const mockCitizenComplaints: CitizenComplaint[] = [
  {
    id: 'comp-101',
    citizenId: 'cit-001',
    product: 'Medicine Plus Tablets',
    issue: 'Missing expiration date on package',
    placeOfPurchase: 'Downtown Pharmacy',
    date: '2024-03-15',
    description:
      'The expiration date is not printed on the package. I noticed this after purchase and am concerned about product freshness and safety.',
    packageImages: [
      'https://via.placeholder.com/300x200/3f51b5/ffffff?text=Medicine+Plus',
    ],
    supportingDocuments: [],
    status: 'Resolved',
    submittedAt: '2024-03-15T10:30:00Z',
    timeline: [
      {
        id: 'tl-101',
        status: 'Submitted',
        timestamp: '2024-03-15T10:30:00Z',
        note: 'Complaint submitted by citizen',
      },
      {
        id: 'tl-102',
        status: 'Received',
        timestamp: '2024-03-16T08:00:00Z',
        note: 'Complaint received and logged in the system',
      },
      {
        id: 'tl-103',
        status: 'Assigned',
        timestamp: '2024-03-17T09:30:00Z',
        note: 'Assigned to Officer John Martinez for review',
      },
      {
        id: 'tl-104',
        status: 'Inspection',
        timestamp: '2024-03-19T10:00:00Z',
        note: 'Physical inspection of the product sample',
      },
      {
        id: 'tl-105',
        status: 'Verification',
        timestamp: '2024-03-21T14:00:00Z',
        note: 'Verification of manufacturing records',
      },
      {
        id: 'tl-106',
        status: 'Resolved',
        timestamp: '2024-03-22T16:00:00Z',
        note: 'Vendor issued corrected packaging. Complaint resolved.',
      },
    ],
    summary: 'Medicine Plus Tablets - Missing expiration date (Downtown Pharmacy, 2024-03-15)',
  },
  {
    id: 'comp-102',
    citizenId: 'cit-001',
    product: 'Fresh Farms Vegetable Oil',
    issue: 'Net weight discrepancy suspected',
    placeOfPurchase: 'Westside Market',
    date: '2024-03-20',
    description:
      'The package claims 1L but when poured it seemed significantly less. I would like this to be checked.',
    packageImages: [
      'https://via.placeholder.com/300x200/e53935/ffffff?text=Vegetable+Oil',
    ],
    supportingDocuments: [],
    billEvidence: 'https://via.placeholder.com/200x150/cccccc/666666?text=Bill+Receipt',
    status: 'Inspection',
    submittedAt: '2024-03-20T14:15:00Z',
    timeline: [
      {
        id: 'tl-107',
        status: 'Submitted',
        timestamp: '2024-03-20T14:15:00Z',
        note: 'Complaint submitted by citizen',
      },
      {
        id: 'tl-108',
        status: 'Received',
        timestamp: '2024-03-21T08:00:00Z',
        note: 'Complaint received and logged in the system',
      },
      {
        id: 'tl-109',
        status: 'Assigned',
        timestamp: '2024-03-22T09:00:00Z',
        note: 'Assigned to Officer Sarah Johnson',
      },
      {
        id: 'tl-110',
        status: 'Inspection',
        timestamp: '2024-03-25T10:00:00Z',
        note: 'Physical inspection scheduled at City Supermarket',
      },
    ],
    summary: 'Fresh Farms Vegetable Oil - Net weight discrepancy suspected (Westside Market, 2024-03-20)',
  },
  {
    id: 'comp-103',
    citizenId: 'cit-001',
    product: 'Premium Honey',
    issue: 'MRP and country of origin missing on package',
    placeOfPurchase: 'Green Valley Market',
    date: '2024-03-25',
    description:
      'The honey jar does not show the MRP or the country of origin. This seems like missing mandatory information.',
    packageImages: [
      'https://via.placeholder.com/300x200/fbc02d/000000?text=Premium+Honey',
    ],
    supportingDocuments: [],
    status: 'Assigned',
    submittedAt: '2024-03-25T11:00:00Z',
    timeline: [
      {
        id: 'tl-111',
        status: 'Submitted',
        timestamp: '2024-03-25T11:00:00Z',
        note: 'Complaint submitted by citizen',
      },
      {
        id: 'tl-112',
        status: 'Received',
        timestamp: '2024-03-26T08:00:00Z',
        note: 'Complaint received and logged in the system',
      },
      {
        id: 'tl-113',
        status: 'Assigned',
        timestamp: '2024-03-27T09:30:00Z',
        note: 'Assigned to Officer Michael Chen',
      },
    ],
    summary: 'Premium Honey - MRP and country of origin missing (Green Valley Market, 2024-03-25)',
  },
];