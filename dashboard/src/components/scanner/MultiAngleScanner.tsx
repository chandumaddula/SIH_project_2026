import React, { useState } from 'react';
import { Camera, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft, RefreshCw, AlertOctagon } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { ImagePreview } from './ImagePreview';
import { Button } from '../common/Button';
import { scanService } from '../../services/scanService';
import { InspectionSession } from '../../types/scan';

export interface CapturedAngles {
  front: File | null;
  back: File | null;
  side: File | null;
  mrpArea: File | null;
}

export interface MultiAngleScannerProps {
  productName: string;
  category: string;
  onComplete: (session: InspectionSession) => void;
}

const STEPS = [
  { id: 'front', title: '1. Front View', desc: 'Capture package front showing brand name and product graphics', icon: '📷' },
  { id: 'back', title: '2. Back View', desc: 'Capture package back showing ingredients and barcode', icon: '📷' },
  { id: 'side', title: '3. Side View', desc: 'Capture side panel showing Net Weight / Volume statements', icon: '📷' },
  { id: 'mrpArea', title: '4. MRP & Declaration Area', desc: 'Capture close-up of mandatory declarations (MRP, Mfg Date, Packer Address)', icon: '🔍' },
];

export const MultiAngleScanner: React.FC<MultiAngleScannerProps> = ({
  productName,
  category,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [capturedFiles, setCapturedFiles] = useState<CapturedAngles>({
    front: null,
    back: null,
    side: null,
    mrpArea: null,
  });
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  const currentStep = STEPS[currentStepIndex];
  const currentKey = currentStep.id as keyof CapturedAngles;

  const handleImageCapture = (file: File) => {
    setCapturedFiles((prev) => ({ ...prev, [currentKey]: file }));
    setPreviews((prev) => ({ ...prev, [currentKey]: URL.createObjectURL(file) }));
    setAuditError(null);
  };

  const handleClearCurrentStep = () => {
    if (previews[currentKey]) {
      URL.revokeObjectURL(previews[currentKey]);
    }
    setCapturedFiles((prev) => ({ ...prev, [currentKey]: null }));
    setPreviews((prev) => {
      const next = { ...prev };
      delete next[currentKey];
      return next;
    });
  };

  const handleRunFullAudit = async () => {
    // Require at least MRP Area or Front capture
    const primaryFile = capturedFiles.mrpArea || capturedFiles.front || capturedFiles.back || capturedFiles.side;
    if (!primaryFile) {
      setAuditError('Please capture at least the MRP / Declaration Area photo before initiating legal audit.');
      return;
    }

    setIsAnalyzing(true);
    setAuditError(null);

    try {
      const res = await scanService.uploadAndScan(primaryFile, productName, category);
      onComplete(res.session);
    } catch (err: any) {
      console.error('Multi-angle audit failed:', err);
      setAuditError('Legal Metrology AI rule engine failed to process captured images. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const capturedCount = Object.values(capturedFiles).filter(Boolean).length;

  return (
    <div
      style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '16px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Official Officer Badge Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '18px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Official Enforcement Inspection Protocol
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
            Multi-Angle Package Capture Checklist
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', backgroundColor: '#0f172a', borderRadius: '20px', border: '1px solid #334155' }}>
          <ShieldCheck size={18} color="#10b981" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
            {capturedCount} of 4 Angles Captured
          </span>
        </div>
      </div>

      {/* Angle Selector Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {STEPS.map((s, idx) => {
          const isCaptured = Boolean(capturedFiles[s.id as keyof CapturedAngles]);
          const isActive = idx === currentStepIndex;

          return (
            <button
              key={s.id}
              onClick={() => setCurrentStepIndex(idx)}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: isActive ? '#334155' : '#0f172a',
                border: isActive ? '2px solid #6366f1' : isCaptured ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #334155',
                color: isActive ? '#ffffff' : '#94a3b8',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isActive ? '#f8fafc' : isCaptured ? '#10b981' : '#cbd5e1' }}>
                  {s.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                  {isCaptured ? 'Photo Recorded ✓' : 'Pending Capture'}
                </div>
              </div>
              {isCaptured ? <CheckCircle2 size={18} color="#10b981" /> : <Camera size={18} color={isActive ? '#6366f1' : '#64748b'} />}
            </button>
          );
        })}
      </div>

      {/* Current Capture Step Interface */}
      <div
        style={{
          padding: '20px',
          backgroundColor: '#0f172a',
          borderRadius: '14px',
          border: '1px solid #334155',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              {currentStep.title}
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
              {currentStep.desc}
            </p>
          </div>
        </div>

        {!previews[currentKey] ? (
          <ImageUploader onImageSelected={handleImageCapture} disabled={isAnalyzing} />
        ) : (
          <ImagePreview
            imageUrl={previews[currentKey]}
            file={capturedFiles[currentKey]}
            showBoundingBoxes={false}
            onChangeImage={handleClearCurrentStep}
            isScanning={false}
          />
        )}
      </div>

      {/* Audit Error Notification */}
      {auditError && (
        <div style={{ padding: '14px 18px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '10px', color: '#f87171', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertOctagon size={20} color="#ef4444" />
          <span>{auditError}</span>
        </div>
      )}

      {/* Multi-angle Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <Button
          variant="secondary"
          leftIcon={<ArrowLeft size={16} />}
          disabled={currentStepIndex === 0 || isAnalyzing}
          onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
        >
          Previous Angle
        </Button>

        <div style={{ display: 'flex', gap: '12px' }}>
          {currentStepIndex < STEPS.length - 1 && (
            <Button
              variant="secondary"
              rightIcon={<ArrowRight size={16} />}
              disabled={isAnalyzing}
              onClick={() => setCurrentStepIndex((prev) => Math.min(STEPS.length - 1, prev + 1))}
            >
              Next Angle
            </Button>
          )}

          <Button
            variant="primary"
            leftIcon={isAnalyzing ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <ShieldCheck size={16} />}
            onClick={handleRunFullAudit}
            isLoading={isAnalyzing}
            disabled={capturedCount === 0 || isAnalyzing}
          >
            {isAnalyzing ? 'Running Legal Metrology Audit...' : `Execute AI Audit (${capturedCount} Photos)`}
          </Button>
        </div>
      </div>
    </div>
  );
};
