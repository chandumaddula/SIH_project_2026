import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../../components/Button';

/**
 * CameraView - Enhanced live camera for package image capture
 *
 * Features:
 * - Live camera feed with clear framing guides
 * - Capture → Preview → Retake/Use Photo workflow
 * - Front/back camera switching (where supported)
 * - Permission and error handling
 * - Mobile/tablet optimized
 * - Guidance text for legal metrology label capture
 */
interface CameraViewProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Capture flow state
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Camera device state
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraId, setCurrentCameraId] = useState<string>('');
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);

  // Start camera with optional device ID
  const startCamera = useCallback(async (deviceId?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Enumerate devices to find cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(d => d.kind === 'videoinput');
      setAvailableCameras(cameras);

      // Build video constraints
      const videoConstraints: MediaTrackConstraints = {
        width: { ideal: 1280 },
        height: { ideal: 720 },
      };

      if (deviceId) {
        videoConstraints.deviceId = { exact: deviceId };
      } else if (cameras.length > 1) {
        // Try environment-facing first (back camera), fall back to any
        const backCamera = cameras.find(c =>
          c.label.toLowerCase().includes('back') ||
          c.label.toLowerCase().includes('rear') ||
          c.label.toLowerCase().includes('environment')
        );
        if (backCamera) {
          videoConstraints.deviceId = { exact: backCamera.deviceId };
        }
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });

      setStream(mediaStream);

      // Track current camera
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        if (settings.deviceId) {
          setCurrentCameraId(settings.deviceId);
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      let message = 'Unable to access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError') {
        message = 'No camera found. Please connect a camera and try again.';
      } else if (err.name === 'NotSecureContext') {
        message = 'Camera requires HTTPS. For development, use localhost.';
      } else if (err.name === 'OverconstrainedError') {
        message = 'Camera does not support the requested resolution. Trying default settings...';
        // Retry with basic constraints
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          setStream(basicStream);
          if (videoRef.current) {
            videoRef.current.srcObject = basicStream;
            videoRef.current.play().catch(() => {});
          }
          setError(null);
          setIsLoading(false);
          return;
        } catch {
          message = 'Camera access failed. Please try the upload option instead.';
        }
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [stream]);

  // Switch between cameras
  const switchCamera = useCallback(async () => {
    if (availableCameras.length < 2 || isSwitchingCamera) return;

    setIsSwitchingCamera(true);
    const currentIndex = availableCameras.findIndex(c => c.deviceId === currentCameraId);
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextCamera = availableCameras[nextIndex];

    await startCamera(nextCamera.deviceId);
    setIsSwitchingCamera(false);
  }, [availableCameras, currentCameraId, isSwitchingCamera, startCamera]);

  // Capture current frame
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw current frame to canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(imageData);
      setIsPreviewMode(true);
    }
  }, []);

  // Discard captured image and recapture
  const retake = useCallback(() => {
    setCapturedImage(null);
    setIsPreviewMode(false);
  }, []);

  // Confirm and use the captured image
  const usePhoto = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  }, [capturedImage, onCapture]);

  // Stop camera and close
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    onClose();
  }, [stream, onClose]);

  // Start camera on mount
  useEffect(() => {
    startCamera();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Error state
  if (error) {
    return (
      <div className="camera-view">
        <div className="camera-view__error">
          <div className="camera-view__error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p className="camera-view__error-text">{error}</p>
          <div className="camera-view__error-actions">
            <Button variant="secondary" size="sm" onClick={() => startCamera()}>
              Try Again
            </Button>
            <Button variant="ghost" size="sm" onClick={stopCamera}>
              Cancel
            </Button>
          </div>
        </div>
        <style>{cameraViewStyles}</style>
      </div>
    );
  }

  // Preview mode after capture
  if (isPreviewMode && capturedImage) {
    return (
      <div className="camera-view">
        <div className="camera-view__preview">
          <img src={capturedImage} alt="Captured" className="camera-view__preview-img" />
          <div className="camera-view__preview-overlay">
            <p className="camera-view__preview-label">Image Captured</p>
          </div>
        </div>
        <div className="camera-view__controls camera-view__controls--preview">
          <Button variant="ghost" size="md" onClick={retake}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 14L4 9l5-5" />
              <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
            </svg>
            Retake
          </Button>
          <Button variant="primary" size="md" onClick={usePhoto}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 13l4 4L19 7" />
            </svg>
            Use Photo
          </Button>
        </div>
        <style>{cameraViewStyles}</style>
      </div>
    );
  }

  // Live camera view
  return (
    <div className="camera-view">
      {/* Loading state */}
      {isLoading && (
        <div className="camera-view__loading">
          <div className="camera-view__spinner" />
          <p>Starting camera...</p>
        </div>
      )}

      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`camera-view__video ${isLoading ? 'camera-view__video--hidden' : ''}`}
      />

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="camera-view__canvas" />

      {/* Framing overlay */}
      {!isLoading && (
        <div className="camera-view__overlay">
          {/* Corner frame guides */}
          <div className="camera-view__frame">
            <div className="camera-view__frame-corner camera-view__frame-corner--tl" />
            <div className="camera-view__frame-corner camera-view__frame-corner--tr" />
            <div className="camera-view__frame-corner camera-view__frame-corner--bl" />
            <div className="camera-view__frame-corner camera-view__frame-corner--br" />
          </div>

          {/* Guidance text */}
          <div className="camera-view__guidance">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <span>Position the complete package label within the frame. Ensure all text is readable.</span>
          </div>
        </div>
      )}

      {/* Control bar */}
      {!isLoading && (
        <div className="camera-view__control-bar">
          {/* Camera switch (if multiple cameras) */}
          {availableCameras.length > 1 && (
            <button
              className="camera-view__switch-btn"
              onClick={switchCamera}
              disabled={isSwitchingCamera}
              title="Switch camera"
              aria-label="Switch between front and back camera"
            >
              {isSwitchingCamera ? (
                <div className="camera-view__spinner camera-view__spinner--sm" />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 3h5v5M8 3H3v5M3 16v5h5M21 16v5h-5" />
                  <path d="M21 3l-7.5 7.5M3 21l7.5-7.5M21 3l-3 3M3 21l3-3" />
                </svg>
              )}
            </button>
          )}

          {/* Capture button */}
          <button
            className="camera-view__capture-btn"
            onClick={captureFrame}
            aria-label="Capture image"
          >
            <span className="camera-view__capture-inner" />
          </button>

          {/* Close button */}
          <button
            className="camera-view__close-btn"
            onClick={stopCamera}
            aria-label="Close camera"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <style>{cameraViewStyles}</style>
    </div>
  );
};

// Shared styles for all render modes
const cameraViewStyles = `
  .camera-view {
    position: relative;
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    background-color: #1a1a2e;
    border-radius: var(--radius-lg);
    overflow: hidden;
    aspect-ratio: 4/3;
  }

  .camera-view__video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .camera-view__video--hidden {
    opacity: 0;
    position: absolute;
  }

  .camera-view__canvas {
    display: none;
  }

  /* Loading */
  .camera-view__loading {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    color: rgba(255,255,255,0.7);
    font-size: var(--font-size-sm);
    background-color: #1a1a2e;
  }

  .camera-view__spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(255,255,255,0.2);
    border-top-color: #fff;
    border-radius: 50%;
    animation: camera-spin 0.8s linear infinite;
  }

  .camera-view__spinner--sm {
    width: 20px;
    height: 20px;
    border-width: 2px;
  }

  @keyframes camera-spin {
    to { transform: rotate(360deg); }
  }

  /* Framing overlay */
  .camera-view__overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    display: flex;
    flex-direction: column;
  }

  .camera-view__frame {
    flex: 1;
    margin: 40px 24px;
    position: relative;
  }

  .camera-view__frame-corner {
    position: absolute;
    width: 24px;
    height: 24px;
    border-color: #ffd700;
    border-style: solid;
    border-width: 0;
  }

  .camera-view__frame-corner--tl {
    top: 0; left: 0;
    border-top-width: 3px;
    border-left-width: 3px;
    border-top-left-radius: 8px;
  }

  .camera-view__frame-corner--tr {
    top: 0; right: 0;
    border-top-width: 3px;
    border-right-width: 3px;
    border-top-right-radius: 8px;
  }

  .camera-view__frame-corner--bl {
    bottom: 0; left: 0;
    border-bottom-width: 3px;
    border-left-width: 3px;
    border-bottom-left-radius: 8px;
  }

  .camera-view__frame-corner--br {
    bottom: 0; right: 0;
    border-bottom-width: 3px;
    border-right-width: 3px;
    border-bottom-right-radius: 8px;
  }

  .camera-view__guidance {
    position: absolute;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.65);
    color: rgba(255,255,255,0.95);
    padding: var(--space-2) var(--space-4);
    border-radius: 20px;
    font-size: 12px;
    max-width: 90%;
    text-align: center;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    backdrop-filter: blur(4px);
  }

  .camera-view__guidance svg {
    flex-shrink: 0;
    opacity: 0.8;
  }

  /* Control bar */
  .camera-view__control-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-6);
    padding: var(--space-5);
    background: linear-gradient(transparent, rgba(0,0,0,0.6));
  }

  .camera-view__switch-btn,
  .camera-view__close-btn {
    background: rgba(255,255,255,0.15);
    border: none;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    transition: background 0.2s;
    backdrop-filter: blur(4px);
  }

  .camera-view__switch-btn:hover,
  .camera-view__close-btn:hover {
    background: rgba(255,255,255,0.3);
  }

  .camera-view__switch-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .camera-view__capture-btn {
    background: white;
    border: 4px solid rgba(255,255,255,0.4);
    border-radius: 50%;
    width: 64px;
    height: 64px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    transition: transform 0.15s, box-shadow 0.15s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }

  .camera-view__capture-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  }

  .camera-view__capture-btn:active {
    transform: scale(0.95);
  }

  .camera-view__capture-inner {
    width: 100%;
    height: 100%;
    background: white;
    border-radius: 50%;
    transition: background 0.15s;
  }

  .camera-view__capture-btn:hover .camera-view__capture-inner {
    background: #f5f5f5;
  }

  /* Preview mode */
  .camera-view__preview {
    position: absolute;
    inset: 0;
  }

  .camera-view__preview-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #1a1a2e;
  }

  .camera-view__preview-overlay {
    position: absolute;
    top: var(--space-4);
    left: 50%;
    transform: translateX(-50%);
    background: rgba(76, 175, 80, 0.9);
    color: white;
    padding: var(--space-2) var(--space-4);
    border-radius: 20px;
    font-size: var(--font-size-sm);
    font-weight: 600;
    backdrop-filter: blur(4px);
  }

  .camera-view__controls--preview {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    gap: var(--space-4);
    justify-content: center;
    padding: var(--space-5);
    background: linear-gradient(transparent, rgba(0,0,0,0.7));
  }

  .camera-view__controls--preview button {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .camera-view__controls--preview .btn-primary {
    background: #4caf50;
    border-color: #4caf50;
  }

  .camera-view__controls--preview .btn-primary:hover {
    background: #43a047;
    border-color: #43a047;
  }

  /* Error state */
  .camera-view__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
    height: 100%;
    min-height: 280px;
    padding: var(--space-6);
    text-align: center;
    background-color: var(--color-gray-100);
  }

  .camera-view__error-icon {
    color: var(--color-warning-600);
  }

  .camera-view__error-text {
    color: var(--color-gray-700);
    font-size: var(--font-size-base);
    max-width: 280px;
    margin: 0;
  }

  .camera-view__error-actions {
    display: flex;
    gap: var(--space-3);
  }

  /* Mobile optimizations */
  @media (max-width: 480px) {
    .camera-view {
      max-width: 100%;
      border-radius: 0;
      aspect-ratio: auto;
      min-height: 320px;
    }

    .camera-view__frame {
      margin: 32px 16px;
    }

    .camera-view__frame-corner {
      width: 20px;
      height: 20px;
    }

    .camera-view__guidance {
      font-size: 11px;
      padding: var(--space-2) var(--space-3);
      bottom: 90px;
    }

    .camera-view__control-bar {
      gap: var(--space-4);
      padding: var(--space-4);
    }

    .camera-view__switch-btn,
    .camera-view__close-btn {
      width: 40px;
      height: 40px;
    }

    .camera-view__capture-btn {
      width: 56px;
      height: 56px;
    }
  }

  /* Tablet optimizations */
  @media (min-width: 481px) and (max-width: 768px) {
    .camera-view {
      min-height: 400px;
    }
  }
`;

export default CameraView;