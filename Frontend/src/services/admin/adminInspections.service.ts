import {
  InspectionRecord, InspectionFilter,
  getInspections, getInspectionById, getInspectionSummary,
} from '../inspection.service';
import { InspectionSummary } from '../inspection.service';

function delay<T>(v: T): Promise<T> {
  return new Promise(r => setTimeout(() => r(v), 200));
}

export const adminInspectionsService = {
  async getInspections(filter?: InspectionFilter): Promise<InspectionRecord[]> {
    return delay(getInspections(filter));
  },

  async getInspection(id: string): Promise<InspectionRecord | null> {
    return delay(getInspectionById(id));
  },

  async getSummary(): Promise<InspectionSummary> {
    return delay(getInspectionSummary());
  },
};
