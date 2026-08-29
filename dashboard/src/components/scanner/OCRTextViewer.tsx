import React from 'react';
import { OCRTextResult } from '../../types/ocr';
import { ConfidenceBadge } from './ConfidenceBadge';
import { FileText, Code } from 'lucide-react';

interface OCRTextViewerProps {
  ocrResult: OCRTextResult;
}

export const OCRTextViewer: React.FC<OCRTextViewerProps> = ({ ocrResult }) => {
  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={20} color="#6366f1" /> Raw OCR Extracted Text Stream
        </h4>
        <ConfidenceBadge score={ocrResult.confidenceScore} />
      </div>

      <div
        style={{
          padding: '16px',
          backgroundColor: '#1e293b',
          borderRadius: '10px',
          border: '1px solid #334155',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          color: '#cbd5e1',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {ocrResult.extractedText}
      </div>

      <div>
        <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Code size={16} color="#6366f1" /> Parsed OCR Bounding Regions ({ocrResult.boundingBoxes.length})
        </h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
          {ocrResult.boundingBoxes.map((box, idx) => (
            <div
              key={idx}
              style={{
                padding: '10px 14px',
                backgroundColor: '#1e293b',
                borderRadius: '8px',
                border: `1px solid ${box.isCompliant ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: box.isCompliant ? '#10b981' : '#ef4444' }}>
                  {box.label}
                </span>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#f8fafc', marginTop: '2px' }}>
                  {box.text}
                </div>
              </div>
              <ConfidenceBadge score={box.confidence} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
