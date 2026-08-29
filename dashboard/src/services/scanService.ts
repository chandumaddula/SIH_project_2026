import { api } from './api';
import { InspectionSession, ScanResultResponse } from '../types/scan';

// Mock initial database session records corresponding to schema.sql
const MOCK_HISTORY: InspectionSession[] = [
  {
    id: 'SES-2026-901',
    officerId: 'OFF-104',
    productName: 'Organic Whole Milk 1L',
    category: 'Dairy Products',
    complianceStatus: 'COMPLIANT',
    createdAt: '2026-08-29T10:15:00Z',
    evidence: [
      {
        id: 101,
        sessionId: 'SES-2026-901',
        imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80',
        extractedText: 'MRP Rs 68.00 (Incl. of all taxes) | Net Qty: 1 L | Mfd: 25/08/2026 | Packed by: Amul Dairy Anand Gujarat | Consumer Helpline: 1800-258-3333',
        boundingBoxJson: [
          { x: 12, y: 15, width: 35, height: 12, label: 'MRP Declaration', text: 'MRP Rs 68.00 (Incl. of all taxes)', confidence: 0.98, isCompliant: true },
          { x: 12, y: 32, width: 28, height: 10, label: 'Net Quantity', text: 'Net Qty: 1 L', confidence: 0.96, isCompliant: true },
          { x: 50, y: 15, width: 30, height: 10, label: 'Mfg Date', text: 'Mfd: 25/08/2026', confidence: 0.94, isCompliant: true },
          { x: 12, y: 48, width: 70, height: 20, label: 'Manufacturer Info', text: 'Packed by: Amul Dairy Anand Gujarat', confidence: 0.92, isCompliant: true },
          { x: 12, y: 72, width: 65, height: 12, label: 'Consumer Helpline', text: 'Customer Helpline: 1800-258-3333', confidence: 0.95, isCompliant: true },
        ],
      },
    ],
    violations: [],
  },
  {
    id: 'SES-2026-898',
    officerId: 'OFF-102',
    productName: 'Premium Basmati Rice 5kg',
    category: 'Grains & Pulses',
    complianceStatus: 'NON_COMPLIANT',
    createdAt: '2026-08-28T14:30:00Z',
    evidence: [
      {
        id: 102,
        sessionId: 'SES-2026-898',
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
        extractedText: 'MRP Rs 450 | Net Wt: 5kg | Batch #B921',
        boundingBoxJson: [
          { x: 15, y: 20, width: 30, height: 15, label: 'MRP Declaration', text: 'MRP Rs 450', confidence: 0.91, isCompliant: false },
          { x: 15, y: 40, width: 25, height: 12, label: 'Net Quantity', text: 'Net Wt: 5kg', confidence: 0.95, isCompliant: true },
        ],
      },
    ],
    violations: [
      {
        id: 201,
        sessionId: 'SES-2026-898',
        ruleId: 'PCR-2011-RULE-6-1-E',
        severity: 'HIGH',
        description: 'MRP does not explicitly state "Inclusive of all taxes" as mandated by Rule 6(1)(e).',
        legalReference: 'Legal Metrology (Packaged Commodities) Rules 2011, Rule 6(1)(e)',
      },
      {
        id: 202,
        sessionId: 'SES-2026-898',
        ruleId: 'PCR-2011-RULE-6-1-A',
        severity: 'CRITICAL',
        description: 'Complete Manufacturer/Packer name, full address, and email/helpline contact details are omitted.',
        legalReference: 'Legal Metrology (Packaged Commodities) Rules 2011, Rule 6(1)(a)',
      },
    ],
  },
  {
    id: 'SES-2026-892',
    productName: 'Refined Sunflower Cooking Oil 1L',
    category: 'Edible Oils',
    complianceStatus: 'WARNING',
    createdAt: '2026-08-27T09:20:00Z',
    evidence: [
      {
        id: 103,
        sessionId: 'SES-2026-892',
        imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
        extractedText: 'MRP Rs 165 (Incl taxes) | Net Vol: 1 L | Mfd 08/2026 | Contact care@sunfloweroil.com',
        boundingBoxJson: [
          { x: 10, y: 15, width: 40, height: 10, label: 'MRP Declaration', text: 'MRP Rs 165 (Incl taxes)', confidence: 0.88, isCompliant: true },
          { x: 10, y: 30, width: 30, height: 10, label: 'Net Volume', text: 'Net Vol: 1 L', confidence: 0.90, isCompliant: true },
          { x: 10, y: 45, width: 25, height: 8, label: 'Numeral Height', text: 'Font Height: 1.2mm', confidence: 0.85, isCompliant: false },
        ],
      },
    ],
    violations: [
      {
        id: 203,
        sessionId: 'SES-2026-892',
        ruleId: 'PCR-2011-RULE-9-HEIGHT',
        severity: 'MEDIUM',
        description: 'Declaration font height for net weight is 1.2mm, below the prescribed 1.5mm minimum height for 1L packages.',
        legalReference: 'Legal Metrology (Packaged Commodities) Rules 2011, Rule 9 Table I',
      },
    ],
  },
];

let localSessionsStore: InspectionSession[] = [...MOCK_HISTORY];

export const scanService = {
  async getScanHistory(): Promise<InspectionSession[]> {
    try {
      const response = await api.get<InspectionSession[]>('/inspections/sessions');
      return response.data;
    } catch {
      // Fallback for offline preview
      return localSessionsStore;
    }
  },

  async getScanDetails(sessionId: string): Promise<InspectionSession> {
    try {
      const response = await api.get<InspectionSession>(`/inspections/sessions/${sessionId}`);
      return response.data;
    } catch {
      const found = localSessionsStore.find((s) => s.id === sessionId);
      if (!found) throw new Error('Session not found');
      return found;
    }
  },

  async uploadAndScan(
    file: File,
    productName: string = 'Scanned Commodity Item',
    category: string = 'General Packaged Commodity'
  ): Promise<ScanResultResponse> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('product_name', productName);
    formData.append('category', category);

    try {
      const response = await api.post<ScanResultResponse>('/inspections/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch {
      // Create local simulation result with full schema compatibility
      const objectUrl = URL.createObjectURL(file);
      const newSessionId = 'SES-2026-' + Math.floor(100 + Math.random() * 900);

      // Randomly simulate compliance verdict to test full UI flow
      const isCompliantSim = Math.random() > 0.4;
      const status: InspectionSession['complianceStatus'] = isCompliantSim ? 'COMPLIANT' : 'NON_COMPLIANT';

      const mockEvidence = {
        id: Math.floor(Math.random() * 10000),
        sessionId: newSessionId,
        imageUrl: objectUrl,
        extractedText: `MRP Rs 149.00 (Incl. of all taxes) | Net Qty: 250 g | Mfd Date: 08/2026 | Packed by: National Foods Ltd, Plot 42, Industrial Zone | Customer Care: care@nationalfoods.in`,
        boundingBoxJson: [
          { x: 14, y: 18, width: 45, height: 12, label: 'MRP Declaration', text: 'MRP Rs 149.00 (Incl. of all taxes)', confidence: 0.97, isCompliant: true },
          { x: 14, y: 35, width: 30, height: 10, label: 'Net Quantity', text: 'Net Qty: 250 g', confidence: 0.94, isCompliant: true },
          { x: 52, y: 18, width: 35, height: 10, label: 'Mfg / Packing Date', text: 'Mfd Date: 08/2026', confidence: 0.91, isCompliant: true },
          {
            x: 14,
            y: 52,
            width: 72,
            height: 22,
            label: 'Manufacturer / Packer',
            text: 'Packed by: National Foods Ltd',
            confidence: 0.93,
            isCompliant: isCompliantSim,
          },
          { x: 14, y: 78, width: 60, height: 10, label: 'Consumer Helpline', text: 'Customer Care: care@nationalfoods.in', confidence: 0.95, isCompliant: true },
        ],
      };

      const mockViolations = isCompliantSim
        ? []
        : [
            {
              id: Math.floor(Math.random() * 10000),
              sessionId: newSessionId,
              ruleId: 'PCR-2011-RULE-6-1-A',
              severity: 'HIGH' as const,
              description: 'Manufacturer complete postal address is incomplete on package label.',
              legalReference: 'Legal Metrology (Packaged Commodities) Rules 2011, Rule 6(1)(a)',
            },
          ];

      const newSession: InspectionSession = {
        id: newSessionId,
        productName: productName || 'Packaged Commodity Sample',
        category: category || 'General Packaged Goods',
        complianceStatus: status,
        createdAt: new Date().toISOString(),
        evidence: [mockEvidence],
        violations: mockViolations,
      };

      localSessionsStore = [newSession, ...localSessionsStore];

      return {
        session: newSession,
        evidence: mockEvidence,
        violations: mockViolations,
      };
    }
  },
};
