import { CitizenScan, PreliminaryResult } from '../types/citizen';
import { mockCitizenScans } from './mockData/citizenScans';

/**
 * Mock service for citizen scan operations.
 * Simulates POST /api/scans and GET /api/scans.
 * Data is stored in-memory only (no persistence).
 */

export const citizenScanService = {
  /**
   * Retrieve all scans for the authenticated citizen.
   */
  async getScans(citizenId: string): Promise<CitizenScan[]> {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 250));
    return mockCitizenScans.filter(scan => scan.citizenId === citizenId);
  },

  /**
   * Retrieve a single scan by ID.
   */
  async getScan(scanId: string): Promise<CitizenScan | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockCitizenScans.find(scan => scan.id === scanId) || null;
  },

  /**
   * Create a new scan. Performs mock "analysis" and returns the result.
   */
  async createScan(citizenId: string, _images: File[]): Promise<CitizenScan> {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate mock analysis based on demo scenarios
    const result = generatePreliminaryResult();
    const scan: CitizenScan = buildMockScan(citizenId, result);
    mockCitizenScans.unshift(scan);
    return scan;
  },
};

/**
 * Generate a mock preliminary result for demo scenarios.
 * Rotates through the three possible outcomes.
 */
function generatePreliminaryResult(): 'no_issue' | 'review_recommended' | 'potential_issue' {
  // Deterministic rotation based on count, so first scan gets "no_issue",
  // second gets "review_recommended", third gets "potential_issue"
  const count = mockCitizenScans.length;
  const outcomes: ('no_issue' | 'review_recommended' | 'potential_issue')[] = [
    'no_issue',
    'review_recommended',
    'potential_issue',
  ];
  return outcomes[count % 3];
}

function generateScanId(): string {
  return `scan-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function buildMockScan(
  citizenId: string,
  resultType: 'no_issue' | 'review_recommended' | 'potential_issue'
): CitizenScan {
  const now = new Date().toISOString();
  const detection = buildDetectedInfo(resultType);
  const screening = buildScreening(resultType);

  return {
    id: generateScanId(),
    citizenId,
    images: [],
    detected: detection,
    screening,
    createdAt: now,
  };
}

function buildDetectedInfo(resultType: 'no_issue' | 'review_recommended' | 'potential_issue') {
  const baseInfo = {
    productName: 'Fresh Farms Vegetable Oil',
    genericName: 'Refined Soybean Oil',
    mrp: '₹ 240.00',
    netQuantity: '1 L (1000 ml)',
    manufacturer: 'Fresh Farms Ltd.',
    packer: 'Fresh Farms Ltd.',
    importer: 'Global Trade Importers',
    address: 'Plot 45, Industrial Area, Phase II, Delhi - 110001',
    countryOfOrigin: 'India',
    dateInformation: {
      mfgDate: '2024-06-15',
      expDate: '2025-06-14',
      batchNumber: 'VEG-2024-045',
      lotNumber: 'LOT-VEG-0624',
    },
    consumerCare: '1800-120-1234 | care@freshfarms.in',
    otherDetected: 'FSSAI License: 1123456789',
    licenseNumber: 'FSSAI: 1123456789',
    barcode: '8901234567890',
  };

  if (resultType === 'no_issue') {
    return baseInfo;
  }

  if (resultType === 'review_recommended') {
    return {
      ...baseInfo,
      productName: 'Pure Water Filters',
      netQuantity: '500 g',
      countryOfOrigin: 'Not clearly stated',
      consumerCare: 'Not detected',
      dateInformation: {
        mfgDate: '2024-06-15',
        expDate: 'Not clearly visible',
        batchNumber: 'WF-2024-203',
      },
    };
  }

  // potential_issue
  return {
    ...baseInfo,
    productName: 'Premium Honey',
    netQuantity: 'Not clearly stated',
    mrp: 'Not detected',
    countryOfOrigin: 'Not stated',
    dateInformation: {
      mfgDate: 'Not detected',
      expDate: 'Not detected',
      batchNumber: 'HNY-2024-019',
    },
    consumerCare: 'Not detected',
  };
}

function buildScreening(
  resultType: 'no_issue' | 'review_recommended' | 'potential_issue'
): any {
  const baseScreening = {
    detectedAt: new Date().toISOString(),
  };

  if (resultType === 'no_issue') {
    return {
      ...baseScreening,
      result: 'no_issue' as PreliminaryResult,
      explanation:
        'All required package information appears to be present and legible. No immediate concerns were identified.',
      confidence: 0.92,
      flags: [],
      suggestedNextStep: 'No action needed. You may scan another product if desired.',
    };
  }

  if (resultType === 'review_recommended') {
    return {
      ...baseScreening,
      result: 'review_recommended' as PreliminaryResult,
      explanation:
        'Some required information on the package could not be clearly verified. A review by an authorized inspection is recommended.',
      confidence: 0.65,
      flags: ['Expiry date not clearly legible', 'Consumer care information not detected'],
      suggestedNextStep:
        'If you have concerns about this product, you may choose to submit a complaint for review.',
    };
  }

  // potential_issue
  return {
    ...baseScreening,
    result: 'potential_issue' as PreliminaryResult,
    explanation:
      'Required package information appears to be missing or unclear. This may indicate a potential compliance concern that warrants further investigation.',
    confidence: 0.55,
    flags: [
      'Net quantity not stated',
      'MRP missing',
      'Country of origin not stated',
      'Manufacturing date not visible',
    ],
    suggestedNextStep:
      'You may submit a complaint to have this product reviewed through the authorized inspection process.',
  };
}

export default citizenScanService;