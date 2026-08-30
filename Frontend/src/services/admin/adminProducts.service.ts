import { Product, ProductFilter, ProductSummary } from '../../types/product';

export interface AdminProduct extends Product {
  lastInspectionDate?: string;
  lastInspectionId?: string;
}

const MOCK_PRODUCTS: AdminProduct[] = [
  {
    id: 'prod-001', name: 'Medicine Plus Tablets', manufacturer: 'Acme Pharma Ltd', category: 'Pharmaceuticals',
    inspectionIds: ['insp-001'], inspectionCount: 1, complianceStatus: 'pass',
    verificationStatus: 'verified', passCount: 1, reviewRequiredCount: 0, potentialIssueCount: 0,
    lastInspectionDate: '2024-03-20', lastInspectionId: 'insp-001',
  },
  {
    id: 'prod-002', name: 'Fresh Farms Vegetable Oil', manufacturer: 'Fresh Farms Co.', category: 'Food & Beverages',
    inspectionIds: ['insp-002'], inspectionCount: 1, complianceStatus: 'pass',
    verificationStatus: 'verified', passCount: 1, reviewRequiredCount: 0, potentialIssueCount: 0,
    lastInspectionDate: '2024-03-22', lastInspectionId: 'insp-002',
  },
  {
    id: 'prod-003', name: 'Pure Water Filters', manufacturer: 'Pure Water Inc.', category: 'Home & Kitchen',
    inspectionIds: ['insp-003'], inspectionCount: 1, complianceStatus: 'potential_issue',
    verificationStatus: 'partially_verified', passCount: 0, reviewRequiredCount: 0, potentialIssueCount: 1,
    lastInspectionDate: '2024-03-25', lastInspectionId: 'insp-003',
  },
  {
    id: 'prod-004', name: 'Family Health Vitamins', manufacturer: 'Family Health Ltd', category: 'Health & Supplements',
    inspectionIds: [], inspectionCount: 0, complianceStatus: 'pass',
    verificationStatus: 'verified', passCount: 1, reviewRequiredCount: 0, potentialIssueCount: 0,
    lastInspectionDate: '2024-03-12', lastInspectionId: undefined,
  },
  {
    id: 'prod-005', name: 'Organic Jam Jars', manufacturer: 'Organic Farms Co.', category: 'Food & Beverages',
    inspectionIds: [], inspectionCount: 0, complianceStatus: 'pass',
    verificationStatus: 'pending', passCount: 0, reviewRequiredCount: 0, potentialIssueCount: 0,
    lastInspectionDate: undefined, lastInspectionId: undefined,
  },
  {
    id: 'prod-006', name: 'Crispy Snacks Variety Pack', manufacturer: 'Crunchy Foods Ltd', category: 'Food & Beverages',
    inspectionIds: [], inspectionCount: 0, complianceStatus: 'pass',
    verificationStatus: 'pending', passCount: 1, reviewRequiredCount: 0, potentialIssueCount: 0,
    lastInspectionDate: '2024-03-01', lastInspectionId: undefined,
  },
];

function delay<T>(v: T): Promise<T> {
  return new Promise(r => setTimeout(() => r(v), 200));
}

export const adminProductsService = {
  async getProducts(filter?: ProductFilter): Promise<AdminProduct[]> {
    let list = [...MOCK_PRODUCTS];
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.manufacturer.toLowerCase().includes(q)
      );
    }
    if (filter?.category && filter.category !== 'all') {
      list = list.filter(p => p.category === filter.category);
    }
    if (filter?.complianceStatus && filter.complianceStatus !== 'all') {
      list = list.filter(p => p.complianceStatus === filter.complianceStatus);
    }
    return delay(list);
  },

  async getProduct(id: string): Promise<AdminProduct | null> {
    return delay(MOCK_PRODUCTS.find(p => p.id === id) || null);
  },

  async getSummary(): Promise<ProductSummary> {
    const list = MOCK_PRODUCTS;
    return delay({
      total: list.length,
      inspected: list.filter(p => p.inspectionCount > 0).length,
      requiresReview: list.filter(p => p.complianceStatus === 'review_required').length,
      potentialIssues: list.filter(p => p.complianceStatus === 'potential_issue').length,
    });
  },
};
