import {
  AdminKpis,
  AdminLocation,
  AdminTrendPoint,
  AdminCategoryPoint,
  AdminActivityPoint,
  AdminAuditEntry,
} from '../types/admin';
import {
  mockAdminLocations,
  mockAdminKpis,
  mockComplianceDistribution,
  mockMonthlyInspections,
  mockComplaintTrend,
  mockPotentialIssueTrend,
  mockProductCategories,
  mockInspectionActivity,
  mockAdminAudit,
} from './mockData/adminLocations';

/* ==========================================================================
   Admin Service
   Mock service for admin overview, analytics, and geographic monitoring.
   ========================================================================== */

const SIMULATED_DELAY_MS = 250;

function delay<T>(value: T): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), SIMULATED_DELAY_MS));
}

export const adminService = {
  /* ----- Overview ----- */
  async getKpis(): Promise<AdminKpis> {
    return delay({ ...mockAdminKpis });
  },

  /* ----- Analytics ----- */
  async getComplianceDistribution(): Promise<AdminTrendPoint[]> {
    return delay([...mockComplianceDistribution]);
  },

  async getMonthlyInspections(): Promise<AdminTrendPoint[]> {
    return delay([...mockMonthlyInspections]);
  },

  async getComplaintTrend(): Promise<AdminTrendPoint[]> {
    return delay([...mockComplaintTrend]);
  },

  async getPotentialIssueTrend(): Promise<AdminTrendPoint[]> {
    return delay([...mockPotentialIssueTrend]);
  },

  async getProductCategories(): Promise<AdminCategoryPoint[]> {
    return delay([...mockProductCategories]);
  },

  async getInspectionActivity(): Promise<AdminActivityPoint[]> {
    return delay([...mockInspectionActivity]);
  },

  /* ----- Geography ----- */
  async getLocationTree(): Promise<AdminLocation[]> {
    return delay(JSON.parse(JSON.stringify(mockAdminLocations)));
  },

  async getLocationById(id: string): Promise<AdminLocation | null> {
    const find = (nodes: AdminLocation[]): AdminLocation | null => {
      for (const n of nodes) {
        if (n.id === id) return n;
        if (n.children) {
          const found = find(n.children);
          if (found) return found;
        }
      }
      return null;
    };
    return delay(find(mockAdminLocations));
  },

  /* ----- Audit ----- */
  async getRecentAudit(limit = 50): Promise<AdminAuditEntry[]> {
    return delay(mockAdminAudit.slice(0, limit));
  },
};

export default adminService;
