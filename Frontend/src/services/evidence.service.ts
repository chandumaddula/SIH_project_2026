/* ==========================================================================
   Evidence Service
   Mock evidence management for the Employee inspection workflow.

   Provides:
   - getInspectionEvidence(inspectionId)
   - addEvidence(evidence)
   - updateEvidence(evidence)
   - deleteEvidence(evidenceId, inspectionId)

   Evidence is linked to findings (compliance checks, measurements, etc.).

   IMPORTANT:
   - This is a frontend DEMO. No real document management.
   - Evidence must be stored by authorized officers only.
   - Replace with a real backend/document store when available.

   ========================================================================== */

/* ---- Types ---- */

export type EvidenceType =
  | 'package_image'
  | 'label_image'
  | 'additional'
  | 'measurement'
  | 'observation';

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  package_image: 'Package Image',
  label_image: 'Label Image',
  additional: 'Additional Evidence',
  measurement: 'Measurement Evidence',
  observation: 'Officer Observation',
};

export interface EvidenceFinding {
  id: string;
  label: string;
  type: 'compliance_check' | 'measurement' | 'observation';
  status: string;
}

export interface EvidenceItem {
  id: string;
  inspectionId: string;
  type: EvidenceType;
  typeLabel: string;
  description: string;
  imageData: string | null; // base64 or null for text observations
  timestamp: string; // ISO
  location: string;
  source: string; // e.g., "Employee Camera", "Manual Upload"
  attachedFinding: EvidenceFinding | null;
  capturedBy: string;
}

export interface AddEvidenceInput {
  type: EvidenceType;
  description: string;
  imageData: string | null;
  location: string;
  source: string;
  attachedFinding: EvidenceFinding | null;
}

/* ---- Storage ---- */

const evidenceStore = new Map<string, EvidenceItem[]>();

/* ---- Helpers ---- */

const generateId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`.toUpperCase();

/* ---- Build from existing inspection images ---- */

export const buildEvidenceFromImages = (
  inspectionId: string,
  images: Array<{ id: string; imageData: string; type: string }>,
  officerName: string
): EvidenceItem[] => {
  return images.map((img) => ({
    id: generateId('EVD'),
    inspectionId,
    type: 'label_image' as EvidenceType,
    typeLabel: EVIDENCE_TYPE_LABELS['label_image'],
    description: `Captured ${img.type || 'label'} image`,
    imageData: img.imageData,
    timestamp: new Date().toISOString(),
    location: 'Package Label',
    source: 'Employee Camera',
    attachedFinding: null,
    capturedBy: officerName,
  }));
};

/* ---- CRUD Operations ---- */

export const getInspectionEvidence = (inspectionId: string): EvidenceItem[] => {
  return evidenceStore.get(inspectionId) ?? [];
};

export const addEvidence = (
  inspectionId: string,
  input: AddEvidenceInput,
  officerName: string
): EvidenceItem => {
  const item: EvidenceItem = {
    id: generateId('EVD'),
    inspectionId,
    type: input.type,
    typeLabel: EVIDENCE_TYPE_LABELS[input.type],
    description: input.description,
    imageData: input.imageData,
    timestamp: new Date().toISOString(),
    location: input.location,
    source: input.source,
    attachedFinding: input.attachedFinding,
    capturedBy: officerName,
  };

  const existing = evidenceStore.get(inspectionId) ?? [];
  evidenceStore.set(inspectionId, [...existing, item]);
  return item;
};

export const updateEvidence = (
  inspectionId: string,
  evidenceId: string,
  updates: Partial<Pick<EvidenceItem, 'description' | 'location' | 'attachedFinding'>>
): EvidenceItem | null => {
  const existing = evidenceStore.get(inspectionId) ?? [];
  const idx = existing.findIndex(e => e.id === evidenceId);
  if (idx === -1) return null;

  const updated: EvidenceItem = { ...existing[idx], ...updates };
  existing[idx] = updated;
  evidenceStore.set(inspectionId, existing);
  return updated;
};

export const deleteEvidence = (inspectionId: string, evidenceId: string): boolean => {
  const existing = evidenceStore.get(inspectionId) ?? [];
  const filtered = existing.filter(e => e.id !== evidenceId);
  if (filtered.length === existing.length) return false;
  evidenceStore.set(inspectionId, filtered);
  return true;
};

/* ---- Summary ---- */

export interface EvidenceSummary {
  total: number;
  byType: Record<EvidenceType, number>;
  findingsSupported: number;
}

export const getEvidenceSummary = (inspectionId: string): EvidenceSummary => {
  const evidence = getInspectionEvidence(inspectionId);
  const byType: Record<EvidenceType, number> = {
    package_image: 0,
    label_image: 0,
    additional: 0,
    measurement: 0,
    observation: 0,
  };
  let findingsSupported = 0;

  for (const item of evidence) {
    byType[item.type] = (byType[item.type] ?? 0) + 1;
    if (item.attachedFinding) findingsSupported++;
  }

  return { total: evidence.length, byType, findingsSupported };
};
