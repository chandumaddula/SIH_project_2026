import React, { useRef, useState } from 'react';
import { UploadCloud, Camera, Image as ImageIcon } from 'lucide-react';
import { Button } from '../common/Button';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelected(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      style={{
        border: isDragOver ? '2px dashed #6366f1' : '2px dashed #334155',
        backgroundColor: isDragOver ? 'rgba(99, 102, 241, 0.1)' : '#1e293b',
        borderRadius: '16px',
        padding: '40px 24px',
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease-in-out',
        opacity: disabled ? 0.6 : 1,
      }}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        style={{ display: 'none' }}
      />

      <div
        style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 16px',
          borderRadius: '16px',
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          color: '#6366f1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <UploadCloud size={32} />
      </div>

      <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
        Upload Commodity Label Photo
      </h3>

      <p style={{ fontSize: '0.875rem', color: '#94a3b8', maxWidth: '420px', margin: '0 auto 20px' }}>
        Drag and drop package photo here, or browse files. Supports PNG, JPG, or WEBP label photos up to 15MB.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <Button variant="primary" leftIcon={<ImageIcon size={16} />} type="button" disabled={disabled}>
          Browse Package Photo
        </Button>
        <Button
          variant="secondary"
          leftIcon={<Camera size={16} />}
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          Use Camera
        </Button>
      </div>
    </div>
  );
};
