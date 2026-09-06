import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { useInspectionStore } from '../../store';
import {
  analyzePackageImages,
  StageProgress,
  AnalysisResult,
} from '../../services/analysis.service';
import { buildExtractedInformation } from '../../services/extractedInfo.service';
import { AIScanResponse } from '../../types/scan';
import { scanService } from '../../services/api';

type AnalysisPhase = 'analyzing' | 'completed' | 'error';

export const InspectionAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const { inspectionId, officerName, office, images, form, clearInspection, setExtractedInfo } = useInspectionStore();

  // Analysis state
  const [phase, setPhase] = useState<AnalysisPhase>('analyzing');
  const [stages, setStages] = useState<StageProgress[]>([]);
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [apiResult, setApiResult] = useState<AIScanResponse | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);

  const isMountedRef = useRef(true);

  /* ---- Start analysis on mount ---- */

  useEffect(() => {
    isMountedRef.current = true;

    if (images.length === 0) {
      // No images provided — can't analyze
      setPhase('error');
      setResult({
        success: false,
        errorMessage: 'No images were provided for analysis. Please return to the previous step and capture or upload package images.',
        ocrResult: null,
        summary: null,
        inspectionId: inspectionId || 'N/A',
      });
      return;
    }

    // Fire the real API call early in parallel with the visual pipeline
    // so the AIScanResponse is ready by the time the user clicks "View Extracted"
    const firstImage = images[0];
    const dataUrlToFile = async (dataUrl: string): Promise<File> => {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      return new File([blob], 'package.jpg', { type: blob.type || 'image/jpeg' });
    };

    (async () => {
      try {
        const file = await dataUrlToFile(firstImage.imageData);
        const real = await scanService.scanPackage(file);
        if (isMountedRef.current) {
          setApiResult(real);
        }
      } catch (err) {
        // API call failure is handled in the analysis service; just log here
        console.warn('Real scan API call failed:', err);
      }
    })();

    const runAnalysis = async () => {
      const analysisResult = await analyzePackageImages(
        images.map((img) => ({ imageData: img.imageData, id: img.id, type: img.type })),
        inspectionId,
        (stageIndex, updatedStages) => {
          if (!isMountedRef.current) return;
          setStages(updatedStages);
          setCurrentStageIndex(stageIndex);
          setProgressPercent(Math.round(((stageIndex + 1) / updatedStages.length) * 100));
        }
      );

      if (!isMountedRef.current) return;

      setResult(analysisResult);
      setPhase(analysisResult.success ? 'completed' : 'error');
    };

    runAnalysis();

    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Handlers ---- */

  const handleViewExtracted = async () => {
    // Prefer the real AIScanResponse if we have it; otherwise build from result
    let extracted;
    if (apiResult) {
      // Use the real API result path
      const { buildExtractedInformationFromAPI } = await import('../../services/extractedInfo.service');
      extracted = buildExtractedInformationFromAPI(
        apiResult,
        inspectionId,
        { packageType: form.packageType, retailer: form.retailer }
      );
    } else if (result?.ocrResult) {
      extracted = buildExtractedInformation(
        result.ocrResult,
        inspectionId,
        { packageType: form.packageType, retailer: form.retailer }
      );
    }
    if (extracted) {
      setExtractedInfo(extracted);
    }
    navigate('/employee/inspection/extracted');
  };

  const handleReviewImages = () => {
    navigate('/employee/inspection/new');
  };

  const handleRetry = () => {
    setPhase('analyzing');
    setStages([]);
    setCurrentStageIndex(-1);
    setProgressPercent(0);
    setResult(null);

    const runAnalysis = async () => {
      const analysisResult = await analyzePackageImages(
        images.map((img) => ({ imageData: img.imageData, id: img.id, type: img.type })),
        inspectionId,
        (stageIndex, updatedStages) => {
          if (!isMountedRef.current) return;
          setStages(updatedStages);
          setCurrentStageIndex(stageIndex);
          setProgressPercent(Math.round(((stageIndex + 1) / updatedStages.length) * 100));
        }
      );

      if (!isMountedRef.current) return;

      setResult(analysisResult);
      setPhase(analysisResult.success ? 'completed' : 'error');
    };

    runAnalysis();
  };

  const handleContinueManually = () => {
    // Skip OCR — proceed straight to extracted information page
    navigate('/employee/inspection/extracted');
  };

  const handleCancel = () => {
    clearInspection();
    navigate('/employee/home');
  };

  /* ---- Stage status icon ---- */

  const renderStageIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="ias-stage-icon ias-stage-icon--completed">✓</span>;
      case 'processing':
        return <span className="ias-stage-icon ias-stage-icon--processing"><span className="ias-spinner" /></span>;
      case 'warning':
        return <span className="ias-stage-icon ias-stage-icon--warning">⚠</span>;
      case 'error':
        return <span className="ias-stage-icon ias-stage-icon--error">✕</span>;
      default:
        return <span className="ias-stage-icon ias-stage-icon--pending">○</span>;
    }
  };

  /* ---- Render ---- */

  return (
    <div className="page ias-page">
      {/* Header */}
      <div className="ias-header">
        <div className="ias-header__left">
          <h1 className="page-title">Analyzing Package</h1>
          <p className="page-subtitle">
            Processing the package image for compliance screening.
          </p>
        </div>
        <div className="ias-header__meta">
          <div className="ias-meta-item">
            <span className="ias-meta-label">Inspection ID</span>
            <span className="ias-meta-value ias-meta-value--id">{inspectionId || 'N/A'}</span>
          </div>
          <div className="ias-meta-item">
            <span className="ias-meta-label">Officer</span>
            <span className="ias-meta-value">{officerName || 'Officer'}</span>
          </div>
          <div className="ias-meta-item">
            <span className="ias-meta-label">Office</span>
            <span className="ias-meta-value">{office || 'Regional Metrology Office'}</span>
          </div>
        </div>
      </div>

      {/* Live data banner */}
      <div className="ias-live-banner" role="status">
        <span className="ias-live-banner__icon">✨</span>
        <span>
          <strong>Live AI/OCR Analysis</strong> — Real OCR extraction via the FastAI pipeline.
          Officer verification is still required for all results.
        </span>
      </div>

      <div className="ias-body">
        {/* Image preview + region highlights */}
        <div className="ias-image-column">
          <Card className="ias-card">
            <CardHeader>
              <CardTitle>Package Image</CardTitle>
              {images.length > 0 && (
                <span className="ias-image-count">{images.length} image{images.length !== 1 ? 's' : ''}</span>
              )}
            </CardHeader>
            <CardBody>
              {images.length === 0 ? (
                <div className="ias-empty">
                  <p>No images available for analysis.</p>
                </div>
              ) : (
                <div className="ias-image-container">
                  <img
                    src={images[0].imageData}
                    alt="Package"
                    className="ias-image"
                  />
                  {/* Region highlights — illustrative only */}
                  {phase === 'completed' && result?.ocrResult?.regionHighlights.map((r, i) => (
                    <div
                      key={i}
                      className="ias-region"
                      style={{
                        left: `${r.x}%`,
                        top: `${r.y}%`,
                        width: `${r.width}%`,
                        height: `${r.height}%`,
                      }}
                      title={`${r.label} (illustrative)`}
                    >
                      <span className="ias-region__label">{r.label}</span>
                    </div>
                  ))}
                  {phase === 'analyzing' && currentStageIndex >= 4 && currentStageIndex <= 6 && (
                    <div className="ias-image-overlay-scanning" />
                  )}
                </div>
              )}
              <p className="ias-image-note">
                <em>Region highlights are illustrative and do not represent real computer-vision coordinates.</em>
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Pipeline + results */}
        <div className="ias-pipeline-column">
          <Card className="ias-card">
            <CardHeader>
              <CardTitle>Analysis Pipeline</CardTitle>
              {phase === 'analyzing' && (
                <Badge variant="info" size="sm">In Progress</Badge>
              )}
              {phase === 'completed' && (
                <Badge variant="success" size="sm">Complete</Badge>
              )}
              {phase === 'error' && (
                <Badge variant="error" size="sm">Error</Badge>
              )}
            </CardHeader>
            <CardBody>
              {/* Progress bar */}
              <div className="ias-progress-wrapper">
                <div className="ias-progress-bar">
                  <div
                    className={`ias-progress-fill ${phase === 'error' ? 'ias-progress-fill--error' : ''}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="ias-progress-label">
                  {phase === 'analyzing' && `${progressPercent}%`}
                  {phase === 'completed' && '100%'}
                  {phase === 'error' && 'Failed'}
                </span>
              </div>

              {/* Stage list */}
              {stages.length > 0 ? (
                <ol className="ias-stages">
                  {stages.map((stage) => (
                    <li
                      key={stage.stage}
                      className={`ias-stage ias-stage--${stage.status}`}
                    >
                      {renderStageIcon(stage.status)}
                      <div className="ias-stage__content">
                        <span className="ias-stage__label">{stage.label}</span>
                        <span className="ias-stage__description">{stage.description}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="ias-empty">
                  <p>Initializing analysis pipeline...</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Error state */}
          {phase === 'error' && result && (
            <Card className="ias-card ias-card--error">
              <CardHeader>
                <CardTitle>Analysis Error</CardTitle>
              </CardHeader>
              <CardBody>
                <p className="ias-error-text">{result.errorMessage}</p>
                {result.ocrResult?.qualityWarning && (
                  <p className="ias-quality-warning">⚠️ {result.ocrResult.qualityWarning}</p>
                )}
                <div className="ias-action-buttons">
                  <Button variant="primary" onClick={handleRetry}>
                    Try Again
                  </Button>
                  <Button variant="secondary" onClick={handleReviewImages}>
                    Review Images
                  </Button>
                  <Button variant="ghost" onClick={handleContinueManually}>
                    Continue Manually
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Quality warning + review option */}
          {phase === 'completed' && result?.ocrResult?.qualityWarning && (
            <Card className="ias-card ias-card--warning">
              <CardHeader>
                <CardTitle>Image Quality Note</CardTitle>
              </CardHeader>
              <CardBody>
                <p className="ias-quality-warning">⚠️ {result.ocrResult.qualityWarning}</p>
                <div className="ias-action-buttons">
                  <Button variant="secondary" onClick={handleReviewImages}>
                    Review Images
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Results */}
          {phase === 'completed' && result?.ocrResult && result.summary && (
            <>
              <Card className="ias-card">
                <CardHeader>
                  <CardTitle>Analysis Complete</CardTitle>
                  <Badge variant="success" size="sm">Demo Result</Badge>
                </CardHeader>
                <CardBody>
                  {/* Detected product info */}
                  <div className="ias-result-section">
                    <h3 className="ias-result-heading">Detected Product</h3>
                    <div className="ias-result-grid">
                      <div className="ias-result-item">
                        <span className="ias-result-label">Product</span>
                        <span className="ias-result-value">{result.ocrResult.productName}</span>
                      </div>
                      <div className="ias-result-item">
                        <span className="ias-result-label">Category</span>
                        <span className="ias-result-value">{result.ocrResult.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Detected text */}
                  <div className="ias-result-section">
                    <h3 className="ias-result-heading">Detected Text (Mock)</h3>
                    <pre className="ias-detected-text">
{result.ocrResult.declarations.map(d => d.rawText).join('\n')}
                    </pre>
                  </div>

                  {/* Confidence scores */}
                  <div className="ias-result-section">
                    <h3 className="ias-result-heading">Confidence Scores (Demo)</h3>
                    <div className="ias-confidence-grid">
                      <div className="ias-confidence-item">
                        <span className="ias-confidence-label">Text Detection</span>
                        <span className="ias-confidence-value">{result.ocrResult.textDetectionConfidence}%</span>
                      </div>
                      <div className="ias-confidence-item">
                        <span className="ias-confidence-label">OCR Confidence</span>
                        <span className="ias-confidence-value">{result.ocrResult.ocrConfidence}%</span>
                      </div>
                      <div className="ias-confidence-item">
                        <span className="ias-confidence-label">Declaration Detection</span>
                        <span className="ias-confidence-value">{result.ocrResult.declarationDetectionConfidence}%</span>
                      </div>
                      <div className="ias-confidence-item ias-confidence-item--overall">
                        <span className="ias-confidence-label">Overall</span>
                        <span className="ias-confidence-value">{result.ocrResult.overallConfidence}%</span>
                      </div>
                    </div>
                    <p className="ias-confidence-note">
                      <em>These are demo values. They do not represent scientifically validated AI accuracy.</em>
                    </p>
                  </div>
                </CardBody>
              </Card>

              {/* Summary */}
              <Card className="ias-card">
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="ias-summary-grid">
                    <div className="ias-summary-item">
                      <span className="ias-summary-number">{result.summary.imagesProcessed}</span>
                      <span className="ias-summary-label">Images Processed</span>
                    </div>
                    <div className="ias-summary-item">
                      <span className="ias-summary-number">{result.summary.textRegionsDetected}</span>
                      <span className="ias-summary-label">Text Regions Detected</span>
                    </div>
                    <div className="ias-summary-item">
                      <span className="ias-summary-number">{result.summary.declarationsDetected}</span>
                      <span className="ias-summary-label">Declarations Detected</span>
                    </div>
                    <div className="ias-summary-item ias-summary-item--warn">
                      <span className="ias-summary-number">{result.summary.potentialReviewItems}</span>
                      <span className="ias-summary-label">Potential Review Items</span>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Actions */}
              <div className="ias-final-actions">
                <Button variant="primary" size="lg" fullWidth onClick={handleViewExtracted}>
                  View Extracted Information →
                </Button>
                <Button variant="ghost" size="sm" fullWidth onClick={handleCancel}>
                  Cancel & Discard
                </Button>
                <p className="ias-final-note">
                  <em>AI-assisted screening — final compliance decision is made by the officer.</em>
                </p>
              </div>
            </>
          )}

          {/* Analyzing loading state (before stages start) */}
          {phase === 'analyzing' && stages.length === 0 && (
            <Card className="ias-card">
              <CardBody>
                <div className="ias-init">
                  <div className="ias-spinner ias-spinner--lg" />
                  <p>Initializing analysis pipeline...</p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <style>{`
        .ias-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Header */
        .ias-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-6);
          flex-wrap: wrap;
          margin-bottom: var(--space-4);
        }
        .ias-header__left { flex: 1; }
        .ias-header__meta {
          display: flex;
          gap: var(--space-4);
          flex-wrap: wrap;
        }
        .ias-meta-item {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }
        .ias-meta-label {
          font-size: var(--font-size-xs);
          color: var(--color-gray-500);
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .ias-meta-value {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--color-navy-900);
        }
        .ias-meta-value--id {
          font-family: var(--font-family-mono);
          color: var(--color-navy-700);
          font-size: var(--font-size-xs);
        }

        /* Live data banner */
        .ias-live-banner {
          display: flex;
          align-items: flex-start;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          background: var(--color-success-50, #e8f5e9);
          border-left: 4px solid var(--color-success-600, #2e7d32);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
          font-size: var(--font-size-sm);
          color: var(--color-navy-900);
        }
        .ias-live-banner__icon { font-size: 1.2rem; flex-shrink: 0; }

        /* Body layout */
        .ias-body {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: var(--space-5);
        }
        .ias-image-column, .ias-pipeline-column {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        @media (max-width: 900px) {
          .ias-body { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .ias-header { flex-direction: column; }
          .ias-header__meta { justify-content: flex-start; }
          .ias-meta-item { align-items: flex-start; }
        }

        /* Card */
        .ias-card { margin-bottom: 0; }
        .ias-card--error { border: 2px solid var(--color-error-300, #f8b4b4); }
        .ias-card--warning { border: 2px solid var(--color-warning-300, #fcd9a8); }
        .ias-card .card-body { padding: var(--space-4) var(--space-5); }

        .ias-image-count {
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
        }

        /* Image container */
        .ias-image-container {
          position: relative;
          width: 100%;
          background: var(--color-gray-100);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .ias-image {
          width: 100%;
          height: auto;
          display: block;
        }
        .ias-image-overlay-scanning {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, transparent, var(--color-navy-500), transparent);
          animation: ias-scan 1.5s linear infinite;
        }
        @keyframes ias-scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .ias-region {
          position: absolute;
          border: 2px dashed var(--color-gold-500, #ffd700);
          background: rgba(255, 215, 0, 0.1);
          border-radius: 2px;
          pointer-events: auto;
        }
        .ias-region__label {
          position: absolute;
          top: -22px;
          left: 0;
          background: var(--color-gold-500, #ffd700);
          color: var(--color-navy-900);
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 3px;
          white-space: nowrap;
        }
        .ias-image-note {
          font-size: 11px;
          color: var(--color-gray-500);
          margin: var(--space-2) 0 0;
          text-align: center;
        }

        /* Progress */
        .ias-progress-wrapper {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
        }
        .ias-progress-bar {
          flex: 1;
          height: 8px;
          background: var(--color-gray-200);
          border-radius: 4px;
          overflow: hidden;
        }
        .ias-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-navy-500), var(--color-navy-700));
          transition: width 0.3s ease;
          border-radius: 4px;
        }
        .ias-progress-fill--error {
          background: var(--color-error-600, #d32f2f);
        }
        .ias-progress-label {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-bold);
          color: var(--color-navy-900);
          min-width: 50px;
          text-align: right;
        }

        /* Stages */
        .ias-stages {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .ias-stage {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-sm);
          background: var(--color-gray-50);
          border-left: 3px solid var(--color-gray-300);
          transition: all 0.2s ease;
        }
        .ias-stage--completed {
          background: var(--color-success-50, #e8f5e9);
          border-left-color: var(--color-success-600, #2e7d32);
        }
        .ias-stage--processing {
          background: var(--color-navy-50);
          border-left-color: var(--color-navy-500);
        }
        .ias-stage--warning {
          background: var(--color-warning-50, #fff3e0);
          border-left-color: var(--color-warning-600, #f57c00);
        }
        .ias-stage--error {
          background: var(--color-error-50, #ffebee);
          border-left-color: var(--color-error-600, #d32f2f);
        }
        .ias-stage__content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .ias-stage__label {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--color-navy-900);
        }
        .ias-stage__description {
          font-size: 11px;
          color: var(--color-gray-600);
        }

        /* Stage icons */
        .ias-stage-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
        }
        .ias-stage-icon--completed {
          background: var(--color-success-600, #2e7d32);
          color: white;
        }
        .ias-stage-icon--processing {
          background: var(--color-navy-500);
          color: white;
        }
        .ias-stage-icon--warning {
          background: var(--color-warning-600, #f57c00);
          color: white;
        }
        .ias-stage-icon--error {
          background: var(--color-error-600, #d32f2f);
          color: white;
        }
        .ias-stage-icon--pending {
          background: var(--color-gray-200);
          color: var(--color-gray-600);
        }

        .ias-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: ias-spin 0.8s linear infinite;
        }
        .ias-spinner--lg {
          width: 40px;
          height: 40px;
          border-width: 3px;
          border-color: var(--color-gray-200);
          border-top-color: var(--color-navy-500);
        }
        @keyframes ias-spin {
          to { transform: rotate(360deg); }
        }

        /* Init state */
        .ias-init {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-6) 0;
          color: var(--color-gray-600);
        }

        /* Empty state */
        .ias-empty {
          text-align: center;
          padding: var(--space-6) var(--space-4);
          background: var(--color-gray-100);
          border-radius: var(--radius-md);
          color: var(--color-gray-600);
        }

        /* Result */
        .ias-result-section {
          padding: var(--space-3) 0;
        }
        .ias-result-section + .ias-result-section {
          border-top: 1px solid var(--color-gray-200);
        }
        .ias-result-heading {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-bold);
          color: var(--color-navy-900);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 var(--space-3);
        }
        .ias-result-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
        }
        .ias-result-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: var(--space-2) var(--space-3);
          background: var(--color-gray-50);
          border-radius: var(--radius-sm);
        }
        .ias-result-label {
          font-size: 11px;
          color: var(--color-gray-500);
          text-transform: uppercase;
        }
        .ias-result-value {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--color-navy-900);
        }
        .ias-detected-text {
          font-family: var(--font-family-mono);
          font-size: var(--font-size-sm);
          background: var(--color-gray-100);
          padding: var(--space-3);
          border-radius: var(--radius-md);
          white-space: pre-wrap;
          margin: 0;
          color: var(--color-navy-900);
        }

        .ias-confidence-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-2);
          margin-bottom: var(--space-2);
        }
        .ias-confidence-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: var(--space-2) var(--space-3);
          background: var(--color-gray-50);
          border-radius: var(--radius-sm);
        }
        .ias-confidence-item--overall {
          background: var(--color-navy-50);
          border: 1px solid var(--color-navy-200);
        }
        .ias-confidence-label {
          font-size: 11px;
          color: var(--color-gray-500);
          text-transform: uppercase;
        }
        .ias-confidence-value {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-bold);
          color: var(--color-navy-700);
        }
        .ias-confidence-note {
          font-size: 11px;
          color: var(--color-gray-500);
          margin: var(--space-1) 0 0;
        }

        /* Summary */
        .ias-summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
        }
        .ias-summary-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-3);
          background: var(--color-navy-50);
          border-radius: var(--radius-md);
          text-align: center;
        }
        .ias-summary-item--warn {
          background: var(--color-warning-50, #fff3e0);
        }
        .ias-summary-number {
          font-size: 1.8rem;
          font-weight: var(--font-weight-bold);
          color: var(--color-navy-900);
          line-height: 1;
        }
        .ias-summary-item--warn .ias-summary-number {
          color: var(--color-warning-600, #f57c00);
        }
        .ias-summary-label {
          font-size: 11px;
          color: var(--color-gray-700);
          margin-top: var(--space-1);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        /* Action buttons */
        .ias-action-buttons {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
          margin-top: var(--space-3);
        }
        .ias-error-text {
          color: var(--color-error-700, #b71c1c);
          margin: 0 0 var(--space-2);
          font-size: var(--font-size-sm);
        }
        .ias-quality-warning {
          background: var(--color-warning-50, #fff3e0);
          color: var(--color-warning-700, #e65100);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-sm);
          font-size: var(--font-size-sm);
          margin: 0 0 var(--space-2);
          border-left: 3px solid var(--color-warning-600, #f57c00);
        }

        /* Final actions */
        .ias-final-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          padding: var(--space-4);
          background: var(--color-white);
          border: 2px solid var(--color-navy-100);
          border-radius: var(--radius-lg);
        }
        .ias-final-note {
          font-size: 11px;
          color: var(--color-gray-600);
          text-align: center;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default InspectionAnalysis;
