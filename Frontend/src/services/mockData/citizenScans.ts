import { CitizenScan } from '../../types/citizen';

export const mockCitizenScans: CitizenScan[] = [
  {
    id: 'scan-001',
    citizenId: 'cit-001',
    images: [
      {
        id: 'img-001',
        type: 'front',
        dataUrl: 'https://via.placeholder.com/300x200/e53935/ffffff?text=Vegetable+Oil',
        uploadedAt: '2024-03-15T10:30:00Z',
        quality: {
          blur: 'low',
          lighting: 'good',
        },
      },
    ],
    detected: {
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
    },
    screening: {
      result: 'no_issue',
      explanation:
        'All required package information appears to be present and legible. No immediate concerns were identified.',
      confidence: 0.92,
      flags: [],
      suggestedNextStep: 'No action needed. You may scan another product if desired.',
      detectedAt: '2024-03-15T10:35:00Z',
    },
    createdAt: '2024-03-15T10:30:00Z',
  },
  {
    id: 'scan-002',
    citizenId: 'cit-002',
    images: [
      {
        id: 'img-002',
        type: 'front',
        dataUrl: 'https://via.placeholder.com/300x200/43a047/ffffff?text=Water+Filters',
        uploadedAt: '2024-03-14T14:15:00Z',
        quality: {
          blur: 'medium',
          lighting: 'fair',
        },
      },
    ],
    detected: {
      productName: 'Pure Water Filters',
      genericName: 'Activated Carbon Water Filter',
      mrp: '₹ 899.00',
      netQuantity: '500 g',
      manufacturer: 'AquaPure Systems',
      packer: 'PureWater Packaging',
      importer: 'Not specified',
      address: 'Survey No. 123, Bangalore Industrial Area, Karnataka - 560048',
      countryOfOrigin: 'Not clearly stated',
      dateInformation: {
        mfgDate: '2024-06-15',
        expDate: 'Not clearly visible',
        batchNumber: 'WF-2024-203',
      },
      consumerCare: 'Not detected',
      otherDetected: 'ISI Mark: CM/L-1234567',
      licenseNumber: 'Not detected',
      barcode: '8901234567891',
    },
    screening: {
      result: 'review_recommended',
      explanation:
        'Some required information on the package could not be clearly verified. A review by an authorized inspection is recommended.',
      confidence: 0.65,
      flags: ['Expiry date not clearly legible', 'Consumer care information not detected'],
      suggestedNextStep:
        'If you have concerns about this product, you may choose to submit a complaint for review.',
      detectedAt: '2024-03-14T14:20:00Z',
    },
    createdAt: '2024-03-14T14:15:00Z',
  },
  {
    id: 'scan-003',
    citizenId: 'cit-003',
    images: [
      {
        id: 'img-003',
        type: 'front',
        dataUrl: 'https://via.placeholder.com/300x200/fbc02d/000000?text=Premium+Honey',
        uploadedAt: '2024-03-13T09:45:00Z',
        quality: {
          blur: 'high',
          lighting: 'poor',
        },
      },
    ],
    detected: {
      productName: 'Premium Honey',
      genericName: 'Raw Multifloral Honey',
      mrp: 'Not detected',
      netQuantity: 'Not clearly stated',
      manufacturer: 'Honey Valley Apiaries',
      packer: 'Valley Pure Foods',
      importer: 'Not specified',
      address: 'Village Beehive, Taluka Honeybee, Gujarat - 380001',
      countryOfOrigin: 'Not stated',
      dateInformation: {
        mfgDate: 'Not detected',
        expDate: 'Not detected',
        batchNumber: 'HNY-2024-019',
        lotNumber: 'LOT-HNY-0324',
      },
      consumerCare: 'Not detected',
      otherDetected: 'Agmark Certification',
      licenseNumber: 'Not detected',
      barcode: '8901234567892',
    },
    screening: {
      result: 'potential_issue',
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
      detectedAt: '2024-03-13T09:50:00Z',
    },
    createdAt: '2024-03-13T09:45:00Z',
  },
];