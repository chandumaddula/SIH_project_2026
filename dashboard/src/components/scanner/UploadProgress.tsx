import React from 'react';
import { Loader2, CheckCircle2, Scan, FileSearch, Scale } from 'lucide-react';

interface UploadProgressProps {
  currentStage: number; // 1: Image Preprocessing, 2: OCR Bounding Box Extraction, 3: PCR Rule Verification
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ currentStage }) => {
  const stages = [
    { id: 1, title: 'Image Preprocessing', subtitle: 'Deskewing & Contrast Enhancement', icon: <Scan size={20} /> },
    { id: 2, title: 'OCR Key-Value Extraction', subtitle: 'Bounding Box Detection & Text Parsing', icon: <FileSearch size={20} /> },
    { id: 3, title: 'Legal Metrology Rules', subtitle: 'Evaluating PCR 2011 Compliance Rules', icon: <Scale size={20} /> },
  ];

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
          AI Label Compliance Analysis
        </h4>
        <span style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 600 }}>
          Stage {currentStage} of 3
        </span>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          height: '6px',
          width: '100%',
          backgroundColor: '#0f172a',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${(currentStage / 3) * 100}%`,
            background: 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)',
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      {/* Stages List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {stages.map((stage) => {
          const isDone = stage.id < currentStage;
          const isCurrent = stage.id === currentStage;

          return (
            <div
              key={stage.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: isCurrent ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: isCurrent ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
              }}
            >
              <div
                style={{
                  color: isDone ? '#10b981' : isCurrent ? '#6366f1' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {isDone ? (
                  <CheckCircle2 size={22} />
                ) : isCurrent ? (
                  <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  stage.icon
                )}
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: isCurrent ? '#f8fafc' : isDone ? '#cbd5e1' : '#64748b',
                  }}
                >
                  {stage.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{stage.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
