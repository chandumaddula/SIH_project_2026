import React, { useState } from 'react';
import { BoundingBox } from '../../types/scan';
import { CheckCircle2, AlertCircle, Eye } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl: string;
  boundingBoxes?: BoundingBox[];
  showBoundingBoxes?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  boundingBoxes = [],
  showBoundingBoxes = true,
}) => {
  const [activeBoxIndex, setActiveBoxIndex] = useState<number | null>(null);

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          padding: '12px 20px',
          backgroundColor: '#1e293b',
          borderBottom: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Eye size={16} color="#6366f1" /> Label OCR Bounding Box Evidence Overlay
        </span>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          {boundingBoxes.length} Declarations Detected
        </span>
      </div>

      {/* Image container */}
      <div style={{ position: 'relative', width: '100%', minHeight: '360px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#090d16' }}>
        <img
          src={imageUrl}
          alt="Packaged Commodity Label"
          style={{
            maxWidth: '100%',
            maxHeight: '480px',
            objectFit: 'contain',
            display: 'block',
          }}
        />

        {/* Bounding Box Overlay SVG */}
        {showBoundingBoxes && (
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            {boundingBoxes.map((box, index) => {
              const isHovered = activeBoxIndex === index;
              const strokeColor = box.isCompliant ? '#10b981' : '#ef4444';
              const fillColor = box.isCompliant
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(239, 68, 68, 0.2)';

              return (
                <g key={index} style={{ pointerEvents: 'all', cursor: 'pointer' }} onMouseEnter={() => setActiveBoxIndex(index)} onMouseLeave={() => setActiveBoxIndex(null)}>
                  <rect
                    x={`${box.x}%`}
                    y={`${box.y}%`}
                    width={`${box.width}%`}
                    height={`${box.height}%`}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isHovered ? 3 : 2}
                    rx="4"
                  />
                  {/* Label tag above box */}
                  <foreignObject
                    x={`${box.x}%`}
                    y={`${Math.max(0, box.y - 8)}%`}
                    width="200"
                    height="30"
                  >
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: strokeColor,
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                      }}
                    >
                      {box.isCompliant ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                      {box.label} ({Math.round(box.confidence * 100)}%)
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Extracted Fields Legend */}
      {boundingBoxes.length > 0 && (
        <div style={{ padding: '16px 20px', backgroundColor: '#1e293b', borderTop: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Extracted Field Evidence
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            {boundingBoxes.map((box, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setActiveBoxIndex(idx)}
                onMouseLeave={() => setActiveBoxIndex(null)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: activeBoxIndex === idx ? '#334155' : '#0f172a',
                  border: `1px solid ${box.isCompliant ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: box.isCompliant ? '#10b981' : '#ef4444' }}>
                    {box.label}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 500, marginTop: '2px' }}>
                    {box.text}
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                  {Math.round(box.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
