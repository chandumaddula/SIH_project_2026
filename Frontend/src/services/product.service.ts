/* ==========================================================================
   Product Service
   Task M — Product Repository

   Products are derived from existing inspection / complaint mock data.
   Manufacturer, category, package type, barcode and country of origin
   come from the existing mock dataset; nothing is invented.

   Provides:
   - getProducts
   - getProductById
   - searchProducts
   - filterProducts
   - getProductInspections
   - getProductSummary

   Reuses:
   - inspection.service (inspections, compliance, verification maps)
   - mockData/employees.ts (officer name lookup)
   ========================================================================== */

import { Product, ProductFilter, ProductSummary, ProductCategory } from '../types/product';
import {
  getInspections,
  InspectionRecord,
  ComplianceResultStatus,
} from './inspection.service';
import { mockEmployees } from './mockData/employees';

/* ---- Product metadata catalogue ----
   Source: extracted from existing inspection + complaint mock data.
   Where information is not available in the existing data, the
   field is omitted (do not invent values).
*/

interface ProductMeta {
  manufacturer: string;
  packer?: string;
  importer?: string;
  category: ProductCategory;
  packageType?: string;
  barcode?: string;
  countryOfOrigin?: string;
  genericDescription?: string;
}

const PRODUCT_CATALOG: Record<string, ProductMeta> = {
  'Medicine Plus Tablets': {
    manufacturer: 'Acme Pharma Ltd',
    packer: 'Acme Pharma Ltd',
    category: 'Pharmaceuticals',
    packageType: 'Boxed Tablets',
    barcode: '8901234500011',
    countryOfOrigin: 'India',
    genericDescription: 'Over-the-counter analgesic tablets, 20 per box',
  },
  'Fresh Farms Vegetable Oil': {
    manufacturer: 'Fresh Farms Co.',
    packer: 'Fresh Farms Co.',
    category: 'Food & Beverages',
    packageType: 'Plastic Bottle',
    barcode: '8901234500028',
    countryOfOrigin: 'India',
    genericDescription: 'Refined vegetable oil, 1 L',
  },
  'Pure Water Filters': {
    manufacturer: 'Pure Water Inc.',
    packer: 'Pure Water Inc.',
    category: 'Home & Kitchen',
    packageType: 'Carton',
    barcode: '8901234500035',
    countryOfOrigin: 'India',
    genericDescription: 'Activated-carbon water filter cartridge, 500 g',
  },
  'Family Health Vitamins': {
    manufacturer: 'Family Health Ltd',
    packer: 'Family Health Ltd',
    category: 'Health & Supplements',
    packageType: 'Bottle',
    barcode: '8901234500042',
    countryOfOrigin: 'India',
    genericDescription: 'Daily multivitamin capsules, 60 per bottle',
  },
  'Organic Jam Jars': {
    manufacturer: 'Organic Farms Co.',
    packer: 'Organic Farms Co.',
    category: 'Food & Beverages',
    packageType: 'Glass Jar',
    barcode: '8901234500059',
    countryOfOrigin: 'India',
    genericDescription: 'Mixed-fruit organic jam, 250 g',
  },
  'Crispy Snacks Variety Pack': {
    manufacturer: 'Crunchy Foods Ltd',
    packer: 'Crunchy Foods Ltd',
    category: 'Food & Beverages',
    packageType: 'Outer Carton',
    barcode: '8901234500066',
    countryOfOrigin: 'India',
    genericDescription: 'Assorted savoury snacks, 12 × 50 g',
  },
  'ABC Biscuits': {
    manufacturer: 'ABC Foods Pvt Ltd',
    packer: 'ABC Foods Pvt Ltd',
    category: 'Food & Beverages',
    packageType: 'Pouch',
    barcode: '8901234500073',
    countryOfOrigin: 'India',
    genericDescription: 'Cream biscuits, 800 g',
  },
  'Green Valley Honey': {
    manufacturer: 'Green Valley Apiaries',
    packer: 'Green Valley Apiaries',
    category: 'Food & Beverages',
    packageType: 'Glass Jar',
    barcode: '8901234500080',
    countryOfOrigin: 'India',
    genericDescription: 'Raw forest honey, 500 g',
  },
  'City Spice Powder': {
    manufacturer: 'City Spice Mills',
    packer: 'City Spice Mills',
    category: 'Food & Beverages',
    packageType: 'Pouch',
    barcode: '8901234500097',
    countryOfOrigin: 'India',
    genericDescription: 'Red chilli powder, 200 g',
  },
  'Daily Glow Face Wash': {
    manufacturer: 'Daily Glow Cosmetics',
    packer: 'Daily Glow Cosmetics',
    category: 'Personal Care',
    packageType: 'Plastic Tube',
    barcode: '8901234500103',
    countryOfOrigin: 'India',
    genericDescription: 'Foaming face wash, 100 ml',
  },
  'BrightLite LED Bulb': {
    manufacturer: 'BrightLite Electronics',
    packer: 'BrightLite Electronics',
    importer: 'BrightLite Imports Pvt Ltd',
    category: 'Electronics',
    packageType: 'Cardboard Box',
    barcode: '8901234500110',
    countryOfOrigin: 'Imported — country not declared in mock data',
    genericDescription: '9 W LED bulb',
  },
  'Kettle King Electric Kettle': {
    manufacturer: 'Kettle King Appliances',
    packer: 'Kettle King Appliances',
    category: 'Home & Kitchen',
    packageType: 'Cardboard Box',
    barcode: '8901234500127',
    countryOfOrigin: 'India',
    genericDescription: '1.5 L stainless-steel electric kettle',
  },
  'SoftySoft Tissue Pack': {
    manufacturer: 'SoftySoft Paper Mills',
    packer: 'SoftySoft Paper Mills',
    category: 'Home & Kitchen',
    packageType: 'Plastic Wrap',
    barcode: '8901234500134',
    countryOfOrigin: 'India',
    genericDescription: 'Facial tissue, 200 pulls × 4 packs',
  },
  'Mountain Spring Mineral Water': {
    manufacturer: 'Mountain Spring Bottlers',
    packer: 'Mountain Spring Bottlers',
    category: 'Food & Beverages',
    packageType: 'Plastic Bottle',
    barcode: '8901234500141',
    countryOfOrigin: 'India',
    genericDescription: 'Packaged drinking water, 1 L',
  },
  'CareFirst Hand Sanitizer': {
    manufacturer: 'CareFirst Hygiene',
    packer: 'CareFirst Hygiene',
    category: 'Personal Care',
    packageType: 'Plastic Bottle',
    barcode: '8901234500158',
    countryOfOrigin: 'India',
    genericDescription: 'Alcohol-based hand sanitizer, 250 ml',
  },
};

/* ---- Helpers ---- */

const productIdFor = (name: string): string =>
  `prod-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

const toCategory = (record: InspectionRecord): ProductCategory => {
  if (record.category) {
    const c = record.category as ProductCategory;
    if (PRODUCT_CATALOG[record.product ?? '']?.category === c) return c;
  }
  return PRODUCT_CATALOG[record.product ?? '']?.category ?? 'Other';
};

/* ---- Build products from inspections ---- */

const buildProducts = (): Product[] => {
  const all = getInspections();
  const grouped = new Map<string, InspectionRecord[]>();
  for (const r of all) {
    if (!r.product) continue;
    if (!grouped.has(r.product)) grouped.set(r.product, []);
    grouped.get(r.product)!.push(r);
  }

  const products: Product[] = [];
  for (const [name, records] of grouped) {
    const sorted = [...records].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const last = sorted[0];
    const meta = PRODUCT_CATALOG[name];

    const passCount = records.filter(r => r.complianceStatus === 'pass').length;
    const reviewRequiredCount = records.filter(r => r.complianceStatus === 'review_required').length;
    const potentialIssueCount = records.filter(r => r.complianceStatus === 'potential_issue').length;

    const complianceStatus: ComplianceResultStatus =
      potentialIssueCount > 0
        ? 'potential_issue'
        : reviewRequiredCount > 0
        ? 'review_required'
        : 'pass';

    const verificationStatus =
      records.find(r => r.verificationStatus === 'review_requested')?.verificationStatus ??
      records.find(r => r.verificationStatus === 'verified')?.verificationStatus ??
      records.find(r => r.verificationStatus === 'partially_verified')?.verificationStatus ??
      'pending';

    products.push({
      id: productIdFor(name),
      name,
      genericDescription: meta?.genericDescription,
      manufacturer: meta?.manufacturer ?? 'Manufacturer not recorded in mock data',
      packer: meta?.packer,
      importer: meta?.importer,
      category: meta?.category ?? toCategory(last),
      packageType: meta?.packageType ?? last.packageType,
      barcode: meta?.barcode,
      countryOfOrigin: meta?.countryOfOrigin,
      inspectionIds: records.map(r => r.id),
      lastInspectionDate: last.date,
      lastInspectionId: last.id,
      inspectionCount: records.length,
      complianceStatus,
      verificationStatus,
      passCount,
      reviewRequiredCount,
      potentialIssueCount,
    });
  }

  // Add catalogue products that have no inspection record (e.g., never inspected)
  for (const [name, meta] of Object.entries(PRODUCT_CATALOG)) {
    if (grouped.has(name)) continue;
    products.push({
      id: productIdFor(name),
      name,
      genericDescription: meta.genericDescription,
      manufacturer: meta.manufacturer,
      packer: meta.packer,
      importer: meta.importer,
      category: meta.category,
      packageType: meta.packageType,
      barcode: meta.barcode,
      countryOfOrigin: meta.countryOfOrigin,
      inspectionIds: [],
      inspectionCount: 0,
      complianceStatus: 'pass',
      verificationStatus: 'pending',
      passCount: 0,
      reviewRequiredCount: 0,
      potentialIssueCount: 0,
    });
  }

  return products;
};

const productStore: Product[] = buildProducts();

/* ---- Public API ---- */

export const getProducts = (filter?: ProductFilter): Product[] => {
  let results = productStore.slice();

  if (!filter) return results;

  if (filter.search) {
    const q = filter.search.toLowerCase();
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.manufacturer.toLowerCase().includes(q) ||
      p.barcode?.toLowerCase().includes(q) ||
      p.inspectionIds.some(id => id.toLowerCase().includes(q))
    );
  }

  if (filter.category && filter.category !== 'all') {
    results = results.filter(p => p.category === filter.category);
  }

  if (filter.complianceStatus && filter.complianceStatus !== 'all') {
    results = results.filter(p => p.complianceStatus === filter.complianceStatus);
  }

  if (filter.manufacturer && filter.manufacturer !== 'all') {
    results = results.filter(p => p.manufacturer === filter.manufacturer);
  }

  if (filter.dateFrom) {
    results = results.filter(p => (p.lastInspectionDate ?? '') >= filter.dateFrom!);
  }

  if (filter.dateTo) {
    results = results.filter(p => (p.lastInspectionDate ?? '') <= filter.dateTo!);
  }

  return results;
};

export const getProductById = (id: string): Product | null =>
  productStore.find(p => p.id === id) ?? null;

export const searchProducts = (query: string): Product[] => {
  if (!query) return getProducts();
  return getProducts({ search: query });
};

export const filterProducts = (filter: ProductFilter): Product[] => getProducts(filter);

export const getProductInspections = (productId: string): InspectionRecord[] => {
  const product = getProductById(productId);
  if (!product) return [];
  return getInspections().filter(r => product.inspectionIds.includes(r.id));
};

export const getProductSummary = (): ProductSummary => {
  const all = productStore;
  return {
    total: all.length,
    inspected: all.filter(p => p.inspectionCount > 0).length,
    requiresReview: all.filter(
      p => p.complianceStatus === 'review_required'
    ).length,
    potentialIssues: all.filter(
      p => p.complianceStatus === 'potential_issue'
    ).length,
  };
};

export const getOfficerName = (officerId: string): string => {
  const emp = mockEmployees.find(e => e.id === officerId);
  return emp?.name ?? officerId;
};

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Food & Beverages',
  'Pharmaceuticals',
  'Home & Kitchen',
  'Health & Supplements',
  'Personal Care',
  'Electronics',
  'Other',
];

export const PRODUCT_MANUFACTURERS: string[] = Array.from(
  new Set(productStore.map(p => p.manufacturer))
);
