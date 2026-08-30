export type InspectionStatus = 'scheduled' | 'in_progress' | 'completed' | 'flagged';

export interface Inspection {
  id: string;
  location: string;
  date: string;
  time: string;
  status: InspectionStatus;
  product?: string;
  result?: string;
  compliance?: 'compliant' | 'non_compliant';
  complaintRaised?: boolean;
  inspectorId: string;
}