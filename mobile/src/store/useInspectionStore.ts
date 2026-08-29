// Store for Offline Mobile Inspection Sessions
export interface MobileInspection {
  id: string;
  timestamp: string;
  imageUri: string;
  status: 'PASS' | 'REVIEW' | 'VIOLATION';
  synced: boolean;
}

class InspectionStore {
  private inspections: MobileInspection[] = [];

  addInspection(inspection: MobileInspection) {
    this.inspections.push(inspection);
  }

  getInspections() {
    return this.inspections;
  }
}

export const inspectionStore = new InspectionStore();
