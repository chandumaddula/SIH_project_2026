import { InspectionSession } from '../../shared/types';

console.log('Legal Metrology Inspection Mobile App Initialized.');

export function startNewInspection(officerId: string): InspectionSession {
  return {
    id: `INSP-${Date.now()}`,
    officerId,
    timestamp: new Date().toISOString(),
    imageUrls: [],
    extractedFields: [],
    complianceStatus: 'REVIEW',
    violations: [],
  };
}
