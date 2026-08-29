import React from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { OCRTextViewer } from '../../components/scanner/OCRTextViewer';
import { OCRTextResult } from '../../types/ocr';

export const OCRResults: React.FC = () => {
  const sampleOcr: OCRTextResult = {
    id: 'OCR-2026-901',
    extractedText:
      'MRP Rs 149.00 (Incl. of all taxes) | Net Qty: 250 g | Mfd Date: 08/2026 | Packed by: National Foods Ltd, Plot 42, Industrial Zone | Consumer Helpline: 1800-258-3333 | Email: care@nationalfoods.in',
    confidenceScore: 0.96,
    createdAt: new Date().toISOString(),
    boundingBoxes: [
      { x: 14, y: 18, width: 45, height: 12, label: 'MRP Declaration', text: 'MRP Rs 149.00 (Incl. of all taxes)', confidence: 0.97, isCompliant: true },
      { x: 14, y: 35, width: 30, height: 10, label: 'Net Quantity', text: 'Net Qty: 250 g', confidence: 0.94, isCompliant: true },
      { x: 52, y: 18, width: 35, height: 10, label: 'Mfg / Packing Date', text: 'Mfd Date: 08/2026', confidence: 0.91, isCompliant: true },
      { x: 14, y: 52, width: 72, height: 22, label: 'Manufacturer / Packer', text: 'Packed by: National Foods Ltd', confidence: 0.93, isCompliant: true },
      { x: 14, y: 78, width: 60, height: 10, label: 'Consumer Helpline', text: 'Customer Care: care@nationalfoods.in', confidence: 0.95, isCompliant: true },
    ],
  };

  return (
    <PageContainer
      title="OCR Image Label Text Extraction"
      subtitle="Review raw text parsing and bounding box confidence coordinates extracted by the AI OCR engine."
    >
      <OCRTextViewer ocrResult={sampleOcr} />
    </PageContainer>
  );
};
