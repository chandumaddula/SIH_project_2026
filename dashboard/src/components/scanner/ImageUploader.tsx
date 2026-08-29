import React, { useRef, useState } from 'react';
import { UploadCloud, Camera, Image as ImageIcon, AlertTriangle, CheckCircle2, X, FileText } from 'lucide-react';
import { Button } from '../common/Button';

export interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  onClear?: () => void;
  disabled?: boolean;
}

interface ImageDimensions {
  width: number;
  height: number;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MIN_FILE_SIZE_BYTES = 1024;              // 1 KB
const MIN_DIMENSION_PX = 300;                  // 300 px minimum

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  onClear,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateAndProcessFile = (file: File) => {
    setValidationError(null);
    setIsValidating(true);

    // 1. Validate File Size
    if (file.size < MIN_FILE_SIZE_BYTES) {
      setValidationError('❌ Image file is too small. Minimum 1 KB required.');
      setIsValidating(false);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError('❌ Image is too large. Maximum allowed size is 10 MB.');
      setIsValidating(false);
      return;
    }

    // 2. Validate File Extension
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      setValidationError('❌ Unsupported image format. Please upload JPG, PNG or WEBP.');
      setIsValidating(false);
      return;
    }

    // 3. Validate Image Dimensions via HTML Image object
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const w = img.width;
      const h = img.height;

      if (w < MIN_DIMENSION_PX || h < MIN_DIMENSION_PX) {
        setValidationError(
          `❌ Image resolution (${w}×${h} px) is too low. Minimum 300×300 px required for label OCR.`
        );
        URL.revokeObjectURL(objectUrl);
        setIsValidating(false);
        return;
      }

      // File is valid! Set preview and trigger callback
      setSelectedFile(file);
      setPreviewUrl(objectUrl);
      setDimensions({ width: w, height: h });
      setIsValidating(false);
      onImageSelected(file);
    };

    img.onerror = () => {
      setValidationError('Corrupt or unparseable image file. Unable to verify dimensions.');
      URL.revokeObjectURL(objectUrl);
      setIsValidating(false);
    };

    img.src = objectUrl;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isValidating) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleReset = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setDimensions(null);
    setValidationError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (onClear) onClear();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
      />

      {/* Validation Error Alert */}
      {validationError && (
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '12px',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '0.9rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
            <span>{validationError}</span>
          </div>
          <button
            onClick={() => setValidationError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#f87171',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Upload Dropzone (When no file selected) */}
      {!previewUrl ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && !isValidating && fileInputRef.current?.click()}
          style={{
            border: isDragOver ? '2px dashed #6366f1' : '2px dashed #334155',
            backgroundColor: isDragOver ? 'rgba(99, 102, 241, 0.12)' : '#1e293b',
            borderRadius: '16px',
            padding: '40px 24px',
            textAlign: 'center',
            cursor: disabled || isValidating ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease-in-out',
            opacity: disabled ? 0.6 : 1,
            boxShadow: isDragOver ? '0 0 24px rgba(99, 102, 241, 0.25)' : 'none',
          }}
        >
          {/* Main Upload Icon */}
          <div
            style={{
              width: '68px',
              height: '68px',
              margin: '0 auto 16px',
              borderRadius: '20px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.15)',
            }}
          >
            <UploadCloud size={34} />
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
            Upload Commodity Package Photo
          </h3>

          <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '440px', margin: '0 auto 16px' }}>
            Drag and drop package label photo here, or browse files.
          </p>

          {/* Supported Format Tags */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              backgroundColor: '#0f172a',
              borderRadius: '20px',
              border: '1px solid #334155',
              marginBottom: '24px',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1' }}>SUPPORTED:</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0' }}>JPG</span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>•</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0' }}>PNG</span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>•</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0' }}>WEBP</span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Max 10MB (Min 300×300 px)</span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              leftIcon={<ImageIcon size={18} />}
              type="button"
              disabled={disabled || isValidating}
              isLoading={isValidating}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Browse Photo
            </Button>
            <Button
              variant="secondary"
              leftIcon={<Camera size={18} />}
              type="button"
              disabled={disabled || isValidating}
              onClick={(e) => {
                e.stopPropagation();
                cameraInputRef.current?.click();
              }}
            >
              Use Camera
            </Button>
          </div>
        </div>
      ) : (
        /* Image Preview & Details Card */
        <div
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={18} /> Valid Image Ready for Audit
            </span>
            <Button variant="secondary" size="sm" leftIcon={<X size={14} />} onClick={handleReset} disabled={disabled}>
              Remove & Select Another
            </Button>
          </div>

          {/* Image & Metadata Container */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Image Thumbnail */}
            <div
              style={{
                position: 'relative',
                width: '140px',
                height: '140px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #334155',
                backgroundColor: '#0f172a',
                flexShrink: 0,
              }}
            >
              <img
                src={previewUrl}
                alt="Selected Package Label"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* File Info Pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc', wordBreak: 'break-all' }}>
                {selectedFile?.name}
              </h4>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                <div
                  style={{
                    padding: '4px 10px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <FileText size={14} color="#6366f1" /> Size: {selectedFile && formatFileSize(selectedFile.size)}
                </div>

                {dimensions && (
                  <div
                    style={{
                      padding: '4px 10px',
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      color: '#94a3b8',
                    }}
                  >
                    Dimensions: <strong style={{ color: '#f8fafc' }}>{dimensions.width} × {dimensions.height} px</strong>
                  </div>
                )}

                <div
                  style={{
                    padding: '4px 10px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: '#10b981',
                    fontWeight: 600,
                  }}
                >
                  OCR Resolution Verified
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
