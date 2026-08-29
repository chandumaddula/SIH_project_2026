import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { ImageUploader } from '../../components/scanner/ImageUploader';
import { ImagePreview } from '../../components/scanner/ImagePreview';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { FileEdit, CheckCircle2, Send, History } from 'lucide-react';

export const CitizenComplaint: React.FC = () => {
  const navigate = useNavigate();

  const [productName, setProductName] = useState('');
  const [issueType, setIssueType] = useState('Overcharging Above Declared MRP');
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{
    ticketId: string;
    submittedAt: string;
  } | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleResetFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const ticketId = 'CMP-2026-' + Math.floor(1000 + Math.random() * 9000);
      setSubmittedTicket({
        ticketId,
        submittedAt: new Date().toLocaleDateString(),
      });
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <PageContainer
      title="File Consumer Legal Metrology Complaint"
      subtitle="Report suspected package violations (Overcharging above MRP, misleading weights, missing packer details) directly to Legal Metrology Authorities."
      action={
        <Button variant="secondary" leftIcon={<History size={16} />} onClick={() => navigate('/dashboard/citizen/complaints')}>
          View My Complaints
        </Button>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        {submittedTicket ? (
          /* Complaint Submission Confirmation Card */
          <div
            style={{
              padding: '32px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              textAlign: 'center',
              maxWidth: '680px',
              margin: '0 auto',
              width: '100%',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
                Complaint Submitted to Authority
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '6px' }}>
                Your consumer complaint has been registered and assigned to the local Legal Metrology Inspection Officer for verification.
              </p>
            </div>

            <div
              style={{
                padding: '16px',
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                border: '1px solid #334155',
                display: 'flex',
                justifyContent: 'space-around',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Ticket Ref</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#6366f1' }}>{submittedTicket.ticketId}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Status</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b' }}>UNDER REVIEW</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
              <Button variant="secondary" onClick={() => setSubmittedTicket(null)}>
                Submit Another Complaint
              </Button>
              <Button variant="primary" onClick={() => navigate('/dashboard/citizen/complaints')}>
                Track Complaint Status
              </Button>
            </div>
          </div>
        ) : (
          /* Complaint Form Form */
          <form
            onSubmit={handleSubmitComplaint}
            style={{
              padding: '28px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div style={{ borderBottom: '1px solid #334155', paddingBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileEdit size={22} color="#6366f1" /> Consumer Violation Report
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
                Attach evidence photo and describe the problem to request official inspection.
              </p>
            </div>

            {/* Form Fields Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <Input
                label="Product Name"
                placeholder="e.g. Brand Basmati Rice 5kg"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}>
                  Violation Issue Type
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                >
                  <option value="Overcharging Above Declared MRP">Overcharging Above Declared MRP</option>
                  <option value="Missing Mandatory Declaration">Missing Mandatory Declaration (MRP/Date/Manufacturer)</option>
                  <option value="Shortage in Net Quantity">Shortage in Net Quantity / Volume</option>
                  <option value="Smudged / Altered Date of Mfg">Smudged or Altered Date of Mfg / Expiry</option>
                  <option value="Missing Consumer Helpline Number">Missing Consumer Helpline Number</option>
                </select>
              </div>

              <Input
                label="Retail Establishment / Store Name"
                placeholder="e.g. Metro Mart Branch 4"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />

              <Input
                label="Store Location / City"
                placeholder="e.g. Sector 18 Commercial Hub, City"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
              />
            </div>

            {/* Description Textarea */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}>
                Describe Suspected Issue Details <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Describe what went wrong (e.g. Retailer charged Rs 180 when declared MRP printed on label is Rs 150)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#0f172a',
                  color: '#f8fafc',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Attach Package Photo Evidence Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📷 Attach Package Photo Evidence (Optional Supporting Photo)
              </label>
              {!previewUrl ? (
                <ImageUploader onImageSelected={handleFileSelect} disabled={isSubmitting} />
              ) : (
                <ImagePreview
                  imageUrl={previewUrl}
                  file={selectedFile}
                  showBoundingBoxes={false}
                  onChangeImage={handleResetFile}
                  isScanning={false}
                />
              )}
            </div>

            {/* Form Submit Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #334155', paddingTop: '20px' }}>
              <Button
                variant="primary"
                type="submit"
                leftIcon={<Send size={18} />}
                isLoading={isSubmitting}
                disabled={isSubmitting || !description.trim()}
              >
                {isSubmitting ? 'Submitting Complaint...' : 'Submit Complaint to Authority'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </PageContainer>
  );
};
