export type RuleStatus = 'active' | 'draft' | 'deactivated';
export type RuleVersionStatus = 'current' | 'previous' | 'superseded';

export interface ComplianceRule {
  id: string;
  title: string;
  description: string;
  requirement: string;
  productCategory: string;
  applicability: string;
  exception: string;
  validationMethod: string;
  officialSource: string;
  version: string;
  effectiveDate: string;
  status: RuleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RuleVersion {
  id: string;
  ruleId: string;
  version: string;
  effectiveDate: string;
  status: RuleVersionStatus;
  changeNote: string;
  changedBy: string;
  changedAt: string;
}

const MOCK_RULES: ComplianceRule[] = [
  {
    id: 'rule-001', title: 'MRP Declaration Requirement', description: 'Maximum Retail Price must be clearly and legibly printed on every pre-packaged consumer commodity.',
    requirement: 'Maximum Retail Price must be clearly and legibly printed on every pre-packaged consumer commodity.',
    productCategory: 'All Pre-Packaged Goods', applicability: 'All packaged consumer products sold in India',
    exception: 'Products sold in unit containers with surface area less than 10 sq cm may display simplified information.',
    validationMethod: 'Visual inspection of package label by authorized officer; price must not be handwritten.',
    officialSource: 'Legal Metrology (Packaged Commodities) Rules, 2011 — Demo Rule (Mock)',
    version: '2.1', effectiveDate: '2022-01-01', status: 'active',
    createdAt: '2021-06-01', updatedAt: '2024-02-15',
  },
  {
    id: 'rule-002', title: 'Net Quantity Declaration', description: 'Net quantity must be declared in metric units (grams, kilograms, millilitres, litres).',
    requirement: 'Net quantity must be declared in metric units (grams, kilograms, millilitres, litres).',
    productCategory: 'All Pre-Packaged Goods', applicability: 'All pre-packaged products including food, pharmaceuticals, cosmetics',
    exception: 'Non-metric declarations permitted only for traditional products with documented consumer preference.',
    validationMethod: 'Weighing of package contents by calibrated instrument; comparison against declared quantity.',
    officialSource: 'Legal Metrology (Packaged Commodities) Rules, 2011 — Demo Rule (Mock)',
    version: '1.5', effectiveDate: '2021-07-01', status: 'active',
    createdAt: '2021-03-10', updatedAt: '2023-11-20',
  },
  {
    id: 'rule-003', title: 'Manufacturer Declaration', description: 'Name and address of the manufacturer or packer must appear on every package.',
    requirement: 'Name and address of the manufacturer or packer must appear on every package.',
    productCategory: 'All Pre-Packaged Goods', applicability: 'All packaged goods manufactured or packed in India and imports',
    exception: 'For imported goods, the name and address of the importer must appear instead.',
    validationMethod: 'Verification of printed manufacturer address against trade registry records.',
    officialSource: 'Legal Metrology Act, 2009 — Demo Rule (Mock)',
    version: '1.0', effectiveDate: '2020-01-01', status: 'active',
    createdAt: '2020-01-01', updatedAt: '2022-05-10',
  },
  {
    id: 'rule-004', title: 'Country of Origin Declaration', description: 'Country of origin must be declared for all imported products.',
    requirement: 'Country of origin must be declared for all imported products.',
    productCategory: 'Imported Goods', applicability: 'All products manufactured outside India and imported for sale',
    exception: 'Products in transit through India that are not intended for sale in India.',
    validationMethod: 'Review of import documentation and package declaration.',
    officialSource: 'Legal Metrology (Packaged Commodities) Rules, 2011 — Demo Rule (Mock)',
    version: '1.2', effectiveDate: '2021-04-01', status: 'active',
    createdAt: '2021-01-15', updatedAt: '2023-08-01',
  },
  {
    id: 'rule-005', title: 'Expiry Date Declaration', description: 'Use-by or expiry date must be printed on perishable products and pharmaceuticals.',
    requirement: 'Use-by or expiry date must be printed on perishable products and pharmaceuticals.',
    productCategory: 'Food & Beverages, Pharmaceuticals', applicability: 'Products with a shelf life of less than 90 days may use best-before date; products with longer shelf life require expiry date.',
    exception: 'Fresh produce, live plants, and certain confectionery products are exempt.',
    validationMethod: 'Visual inspection of date marking on package.',
    officialSource: 'Food Safety and Standards (Packaging) Regulations — Demo Rule (Mock)',
    version: '3.0', effectiveDate: '2023-01-01', status: 'active',
    createdAt: '2022-08-01', updatedAt: '2024-01-10',
  },
  {
    id: 'rule-006', title: 'Batch Number Declaration', description: 'Batch or lot number enabling identification of manufacturing conditions must appear on each package.',
    requirement: 'Batch or lot number enabling identification of manufacturing conditions must appear on each package.',
    productCategory: 'All Pre-Packaged Goods', applicability: 'All packaged consumer products for traceability purposes',
    exception: 'Single-unit retail packages not intended for resale.',
    validationMethod: 'Verification of batch/lot marking for traceability in recall situations.',
    officialSource: 'Legal Metrology (Packaged Commodities) Rules, 2011 — Demo Rule (Mock)',
    version: '1.0', effectiveDate: '2020-01-01', status: 'active',
    createdAt: '2020-01-01', updatedAt: '2022-05-10',
  },
  {
    id: 'rule-007', title: 'Consumer Care Contact', description: 'Consumer care contact details (phone or email) must be printed on package.',
    requirement: 'Consumer care contact details (phone or email) must be printed on package.',
    productCategory: 'All Pre-Packaged Goods', applicability: 'All packaged consumer products sold to end consumers',
    exception: 'Products sold to institutional buyers (B2B) where consumer care is handled by the institutional buyer.',
    validationMethod: 'Verification of legible contact information on package.',
    officialSource: 'Legal Metrology (Packaged Commodities) Rules, 2011 — Demo Rule (Mock)',
    version: '1.0', effectiveDate: '2021-07-01', status: 'draft',
    createdAt: '2024-06-01', updatedAt: '2024-06-01',
  },
];

const MOCK_VERSIONS: RuleVersion[] = [
  { id: 'ver-001', ruleId: 'rule-001', version: '2.1', effectiveDate: '2022-01-01', status: 'current', changeNote: 'Added requirement for digital price verification compatibility.', changedBy: 'System Administrator', changedAt: '2024-02-15' },
  { id: 'ver-002', ruleId: 'rule-001', version: '2.0', effectiveDate: '2020-01-01', status: 'previous', changeNote: 'Major revision — aligned with 2020 amendments to Legal Metrology Act.', changedBy: 'System Administrator', changedAt: '2020-01-01' },
  { id: 'ver-003', ruleId: 'rule-001', version: '1.5', effectiveDate: '2018-01-01', status: 'superseded', changeNote: 'Initial standardization.', changedBy: 'System Administrator', changedAt: '2018-01-01' },
  { id: 'ver-004', ruleId: 'rule-002', version: '1.5', effectiveDate: '2021-07-01', status: 'current', changeNote: 'Added exemptions for traditional products.', changedBy: 'System Administrator', changedAt: '2023-11-20' },
  { id: 'ver-005', ruleId: 'rule-002', version: '1.4', effectiveDate: '2020-01-01', status: 'previous', changeNote: 'Updated metric unit specifications.', changedBy: 'System Administrator', changedAt: '2020-01-01' },
  { id: 'ver-006', ruleId: 'rule-005', version: '3.0', effectiveDate: '2023-01-01', status: 'current', changeNote: 'Revised shelf-life thresholds aligned with FSSAI 2022 guidelines.', changedBy: 'System Administrator', changedAt: '2024-01-10' },
];

function delay<T>(v: T): Promise<T> {
  return new Promise(r => setTimeout(() => r(v), 200));
}

export const adminRulesService = {
  async getRules(status?: RuleStatus | 'all'): Promise<ComplianceRule[]> {
    let list = [...MOCK_RULES];
    if (status && status !== 'all') {
      list = list.filter(r => r.status === status);
    }
    return delay(list.sort((a, b) => a.title.localeCompare(b.title)));
  },

  async getRule(id: string): Promise<ComplianceRule | null> {
    return delay(MOCK_RULES.find(r => r.id === id) || null);
  },

  async getVersions(ruleId: string): Promise<RuleVersion[]> {
    return delay(MOCK_VERSIONS.filter(v => v.ruleId === ruleId).sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()));
  },
};
