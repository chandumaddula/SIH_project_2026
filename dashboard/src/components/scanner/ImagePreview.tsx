import React, { useState } from 'react';
import { BoundingBox } from '../../types/scan';
import { CheckCircle2, AlertCircle, FileText, Image as ImageIcon, Play, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';

export interface ImagePreviewProps {
  imageUrl: string;
  file?: File | null;
  filename?: string;
  fileSize?: string | number;
  dimensions?: { width: number; height: number };
  boundingBoxes?: BoundingBox[];
  showBoundingBoxes?: boolean;
  onStartScan?: () => void;
  onChangeImage?: () => void;
  isScanning?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  file = null,
  filename,
  fileSize,
  dimensions,
  boundingBoxes = [],
  showBoundingBoxes = true,
  onStartScan,
  onChangeImage,
  isScanning = false,
}) => {
  const [activeBoxIndex, setActiveBoxIndex] = useState<number | null>(null);

  // Format file size nicely (e.g. 2.4 MB or 450 KB)
  const formattedSize = React.useMemo(() => {
    if (typeof fileSize === 'string') return fileSize;
    const bytes = fileSize ?? file?.size;
    if (!bytes) return null;
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }, [fileSize, file]);

  const displayFilename = filename || file?.name || 'Selected Package Image';

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
      {/* Header Bar */}
      <div
        style={{
          padding: '14px 20px',
          backgroundColor: '#1e293b',
          borderBottom: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ImageIcon size={18} color="#6366f1" />
          {boundingBoxes.length > 0 ? 'Label Evidence Bounding Box Overlay' : 'Package Image Preview'}
        </span>

        {boundingBoxes.length > 0 ? (
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
            {boundingBoxes.length} Legal Declarations Detected
          </span>
        ) : (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              padding: '3px 10px',
              borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            Confirmation Ready
          </span>
        )}
      </div>

      {/* Package Image Display Frame */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '340px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#090d16',
          padding: '16px',
        }}
      >
        <img
          src={imageUrl}
          alt={displayFilename}
          style={{
            maxWidth: '100%',
            maxHeight: '440px',
            objectFit: 'contain',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            display: 'block',
          }}
        />

        {/* Bounding Box Overlay SVG (Post-scan evidence view) */}
        {showBoundingBoxes && boundingBoxes.length > 0 && (
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
              const fillColor = box.isCompliant ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.2)';

              return (
                <g
                  key={index}
                  style={{ pointerEvents: 'all', cursor: 'pointer' }}
                  onMouseEnter={() => setActiveBoxIndex(index)}
                  onMouseLeave={() => setActiveBoxIndex(null)}
                >
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

      {/* Metadata Bar & Confirmation Actions */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: '#1e293b',
          borderTop: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* File Metadata Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={16} color="#6366f1" />
            <span>filename: <strong style={{ color: '#cbd5e1' }}>{displayFilename}</strong></span>
          </div>

          <div style={{ display: 'flex', gap: '12px', fontSize: '0.825rem', color: '#94a3b8' }}>
            {formattedSize && (
              <span>size: <strong style={{ color: '#cbd5e1' }}>{formattedSize}</strong></span>
            )}
            {dimensions && (
              <span>dimensions: <strong style={{ color: '#cbd5e1' }}>{dimensions.width} × {dimensions.height} px</strong></span>
            )}
          </div>
        </div>

        {/* User Confirmation Buttons (Don't auto-upload) */}
        {(onStartScan || onChangeImage) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {onChangeImage && (
              <Button
                variant="secondary"
                size="md"
                leftIcon={<RotateCcw size={16} />}
                onClick={onChangeImage}
                disabled={isScanning}
              >
                Change Image
              </Button>
            )}

            {onStartScan && (
              <Button
                variant="primary"
                size="md"
                leftIcon={isScanning ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={16} />}
                onClick={onStartScan}
                isLoading={isScanning}
                disabled={isScanning}
              >
                {isScanning ? 'Uploading...' : 'Start Scan'}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Upload Loading Progress Bar State */}
      {isScanning && (
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#0f172a',
            borderTop: '1px solid #334155',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader2 size={16} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
              Uploading image...
            </span>
            <span style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 700 }}>
              Uploading to FastAPI
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div
            style={{
              height: '8px',
              width: '100%',
              backgroundColor: '#1e293b',
              borderRadius: '9999px',
              overflow: 'hidden',
              border: '1px solid #334155',
            }}
          >
            <div
              style={{
                height: '100%',
                width: '65%',
                background: 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)',
                borderRadius: '9999px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      )}

      {/* Extracted Fields Bounding Box Legend (If Available) */}
      {showBoundingBoxes && boundingBoxes.length > 0 && (
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#0f172a',
            borderTop: '1px solid #334155',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
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
                  backgroundColor: activeBoxIndex === idx ? '#334155' : '#1e293b',
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
