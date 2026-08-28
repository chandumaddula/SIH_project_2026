import { InspectionSession } from '../../shared/types';

console.log('Legal Metrology Admin Dashboard Initialized.');

export function renderInspectionSummary(session: InspectionSession): string {
  return `Inspection ID: ${session.id} | Officer: ${session.officerId} | Status: ${session.complianceStatus} | Violations: ${session.violations.length}`;
}
