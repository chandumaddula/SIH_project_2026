import React, { useState } from 'react';
import { Camera, Upload, AlertTriangle, CheckCircle2, Scan, RefreshCw, ZoomIn, Eye, ShieldAlert } from 'lucide-react';

interface ExtractedField {
  key: string;
  value: string;
  confidence: number;
  status: 'PASS' | 'VIOLATION' | 'WARNING';
  bbox: { x: number; y: number; w: number; h: number };
  ruleRef: string;
}

export const OCRScanner: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<'edible_oil' | 'packaged_milk' | 'electronics' | 'small_snack'>('edible_oil');
  const [isScanning, setIsScanning] = useState(false);

  const presetData = {
    edible_oil: {
      name: 'SunPure Refined Sunflower Oil (1 Litre)',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=60',
      fields: [
        { key: 'Product Identity', value: 'Refined Sunflower Cooking Oil', confidence: 0.98, status: 'PASS', bbox: { x: 15, y: 12, w: 70, h: 10 }, ruleRef: 'Rule 6(1)(a)' },
        { key: 'Net Quantity', value: '1 L (Net Weight 910 g @ 30°C)', confidence: 0.95, status: 'PASS', bbox: { x: 15, y: 25, w: 65, h: 12 }, ruleRef: 'Rule 11 & Schedule II' },
        { key: 'Maximum Retail Price', value: '₹ 185.00', confidence: 0.88, status: 'VIOLATION', bbox: { x: 15, y: 40, w: 50, h: 12 }, ruleRef: 'Rule 6(1)(e) - Missing mandatory phrase "incl. of all taxes"' },
        { key: 'Date of Mfg / Packing', value: '07/2026', confidence: 0.94, status: 'PASS', bbox: { x: 15, y: 55, w: 45, h: 10 }, ruleRef: 'Rule 6(1)(d)' },
        { key: 'Manufacturer Details', value: 'SunPure Organics Ltd, Plot 42, Industrial Area, Mysuru, KA', confidence: 0.92, status: 'PASS', bbox: { x: 15, y: 68, w: 75, h: 14 }, ruleRef: 'Rule 6(1)(b)' },
        { key: 'Consumer Care Contact', value: 'Email: support@sunpure.in (Phone Missing)', confidence: 0.84, status: 'WARNING', bbox: { x: 15, y: 84, w: 70, h: 10 }, ruleRef: 'Rule 6(2) - Toll free telephone number omitted' },
        { key: 'Numeral Font Height', value: '2.1 mm (Required: Min 3.0 mm for > 500g)', confidence: 0.91, status: 'VIOLATION', bbox: { x: 50, y: 27, w: 30, h: 8 }, ruleRef: 'Rule 7 & Table 1 Font Height Spec' }
      ] as ExtractedField[]
    },
    packaged_milk: {
      name: 'Amul Taaza Homogenised Toned Milk',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop&q=60',
      fields: [
        { key: 'Product Identity', value: 'Pasteurised Toned Milk', confidence: 0.99, status: 'PASS', bbox: { x: 20, y: 15, w: 60, h: 12 }, ruleRef: 'Rule 6(1)(a)' },
        { key: 'Net Quantity', value: '500 mL', confidence: 0.97, status: 'PASS', bbox: { x: 20, y: 30, w: 40, h: 10 }, ruleRef: 'Rule 11' },
        { key: 'Maximum Retail Price', value: '₹ 27.00 (incl. of all taxes)', confidence: 0.96, status: 'PASS', bbox: { x: 20, y: 43, w: 60, h: 12 }, ruleRef: 'Rule 6(1)(e)' },
        { key: 'Date of Packing', value: '28 Aug 2026 04:30 AM', confidence: 0.95, status: 'PASS', bbox: { x: 20, y: 58, w: 55, h: 10 }, ruleRef: 'Rule 6(1)(d)' },
        { key: 'Manufacturer Details', value: 'GCMMF Ltd, Anand 388001, Gujarat, India', confidence: 0.96, status: 'PASS', bbox: { x: 20, y: 70, w: 70, h: 12 }, ruleRef: 'Rule 6(1)(b)' },
        { key: 'Consumer Care Contact', value: '1800 258 3333 / customercare@amul.coop', confidence: 0.98, status: 'PASS', bbox: { x: 20, y: 84, w: 70, h: 10 }, ruleRef: 'Rule 6(2)' }
      ] as ExtractedField[]
    },
    electronics: {
      name: 'Smart Wireless Earbuds Pro Box Label',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=60',
      fields: [
        { key: 'Product Identity', value: 'True Wireless Audio Earphones', confidence: 0.95, status: 'PASS', bbox: { x: 10, y: 10, w: 80, h: 12 }, ruleRef: 'Rule 6(1)(a)' },
        { key: 'Net Quantity', value: '1 N (Contains 2 N Earbuds, 1 N Case, 1 N Cable)', confidence: 0.93, status: 'PASS', bbox: { x: 10, y: 25, w: 80, h: 14 }, ruleRef: 'Rule 6(1)(c)' },
        { key: 'Maximum Retail Price', value: 'Rs. 4,999/-', confidence: 0.82, status: 'VIOLATION', bbox: { x: 10, y: 42, w: 50, h: 10 }, ruleRef: 'Rule 6(1)(e) - Non-standard MRP symbol "Rs." & missing tax breakdown' },
        { key: 'Country of Origin', value: 'Country of Origin: Vietnam', confidence: 0.96, status: 'PASS', bbox: { x: 10, y: 55, w: 60, h: 10 }, ruleRef: 'Rule 6(1)(f)' },
        { key: 'Importer Address', value: 'TechImports Pvt Ltd, SEZ Tower 3, Gurugram, HR', confidence: 0.90, status: 'PASS', bbox: { x: 10, y: 68, w: 80, h: 12 }, ruleRef: 'Rule 6(1)(b)' }
      ] as ExtractedField[]
    },
    small_snack: {
      name: 'Mini Sachet Salted Peanuts (8 grams)',
      image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=60',
      fields: [
        { key: 'Product Identity', value: 'Roasted Salted Peanuts', confidence: 0.94, status: 'PASS', bbox: { x: 15, y: 15, w: 70, h: 15 }, ruleRef: 'Rule 6(1)(a)' },
        { key: 'Net Quantity', value: '8 g', confidence: 0.98, status: 'PASS', bbox: { x: 15, y: 35, w: 40, h: 12 }, ruleRef: 'Rule 11' },
        { key: 'Exemption Status', value: 'Exempted Package (Net weight <= 10g under Rule 26)', confidence: 0.99, status: 'PASS', bbox: { x: 15, y: 52, w: 75, h: 20 }, ruleRef: 'Rule 26 Exemption Clause - Mandatory declarations except MRP exempt' }
      ] as ExtractedField[]
    }
  };

  const activeData = presetData[selectedPreset];
  const violationCount = activeData.fields.filter(f => f.status === 'VIOLATION').length;
  const warningCount = activeData.fields.filter(f => f.status === 'WARNING').length;

  const handleScanPreset = (key: 'edible_oil' | 'packaged_milk' | 'electronics' | 'small_snack') => {
    setSelectedPreset(key);
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 500);
  };

  return (
    <div className="glass-card" style={{ padding: '1.75rem', background: '#ffffff', border: '1px solid #cbd5e1' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scan size={22} color="#1d4ed8" />
            AI Packaged Commodity Inspection OCR Scanner
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Real-time label parsing, text bounding box extraction, and Legal Metrology Rules 2011 validator.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
            <Upload size={14} /> Upload Custom Photo
          </button>
          <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
            <Camera size={14} /> Mobile Camera Capture
          </button>
        </div>
      </div>

      {/* Preset Test Selection Buttons */}
      <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>
          SELECT SAMPLE INSPECTION ITEM:
        </span>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            className={`tab-btn ${selectedPreset === 'edible_oil' ? 'active' : ''}`}
            onClick={() => handleScanPreset('edible_oil')}
          >
            🛢️ Edible Oil Bottle (Non-Compliant MRP & Font)
          </button>
          <button 
            className={`tab-btn ${selectedPreset === 'packaged_milk' ? 'active' : ''}`}
            onClick={() => handleScanPreset('packaged_milk')}
          >
            🥛 Packaged Milk (Fully Compliant)
          </button>
          <button 
            className={`tab-btn ${selectedPreset === 'electronics' ? 'active' : ''}`}
            onClick={() => handleScanPreset('electronics')}
          >
            🎧 Imported Earbuds Box (MRP Symbol Violation)
          </button>
          <button 
            className={`tab-btn ${selectedPreset === 'small_snack' ? 'active' : ''}`}
            onClick={() => handleScanPreset('small_snack')}
          >
            🥜 8g Sachet (Rule 26 Small Pack Exemption)
          </button>
        </div>
      </div>

      {/* Main Grid: Label Image Overlay vs Extracted Rules */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left: Image with Bounding Boxes */}
        <div style={{ background: '#f1f5f9', borderRadius: '12px', padding: '1rem', border: '1px solid #cbd5e1', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Eye size={14} color="#1d4ed8" /> Label OCR Bounding Box View
            </span>
            <span className="badge badge-pass" style={{ fontSize: '0.65rem' }}>AI Confidence 94.8%</span>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '380px', borderRadius: '8px', overflow: 'hidden', background: '#0f172a' }}>
            {isScanning ? (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.9)', zIndex: 10 }}>
                <RefreshCw size={36} color="#1d4ed8" className="animate-spin" />
                <span style={{ marginTop: '1rem', color: '#1d4ed8', fontSize: '0.9rem', fontWeight: 700 }}>Executing OCR Text Box Parser...</span>
              </div>
            ) : null}

            <img 
              src={activeData.image} 
              alt={activeData.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
            />

            {/* Bounding Box Highlights */}
            {activeData.fields.map((f, idx) => (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${f.bbox.x}%`,
                  top: `${f.bbox.y}%`,
                  width: `${f.bbox.w}%`,
                  height: `${f.bbox.h}%`,
                  border: f.status === 'VIOLATION' ? '2px solid #be123c' : f.status === 'WARNING' ? '2px solid #d97706' : '2px solid #15803d',
                  background: f.status === 'VIOLATION' ? 'rgba(225, 29, 72, 0.25)' : f.status === 'WARNING' ? 'rgba(217, 119, 6, 0.25)' : 'rgba(21, 128, 61, 0.2)',
                  borderRadius: '4px',
                  pointerEvents: 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: '-18px',
                  left: '0',
                  background: f.status === 'VIOLATION' ? '#be123c' : f.status === 'WARNING' ? '#d97706' : '#15803d',
                  color: '#fff',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  padding: '0.1rem 0.3rem',
                  borderRadius: '2px',
                  whiteSpace: 'nowrap'
                }}>
                  {f.key} ({(f.confidence * 100).toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
            <span>Item: {activeData.name}</span>
            <span style={{ color: '#1d4ed8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
              <ZoomIn size={12} /> Inspect Canvas
            </span>
          </div>
        </div>

        {/* Right: Extracted Declarations & Rule Evaluation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Status Banner */}
          <div style={{
            background: violationCount > 0 ? '#ffe4e6' : warningCount > 0 ? '#fef3c7' : '#dcfce7',
            border: violationCount > 0 ? '1px solid #fecdd3' : warningCount > 0 ? '1px solid #fde68a' : '1px solid #86efac',
            padding: '1rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {violationCount > 0 ? (
                <ShieldAlert size={28} color="#be123c" />
              ) : warningCount > 0 ? (
                <AlertTriangle size={28} color="#b45309" />
              ) : (
                <CheckCircle2 size={28} color="#15803d" />
              )}
              <div>
                <h4 style={{ color: violationCount > 0 ? '#be123c' : warningCount > 0 ? '#b45309' : '#15803d', fontSize: '0.95rem', fontWeight: 800 }}>
                  {violationCount > 0 ? `POTENTIAL NON-COMPLIANCE DETECTED (${violationCount} Violations)` : warningCount > 0 ? 'REVIEW REQUIRED (1 Warning)' : 'FULLY COMPLIANT WITH PCR 2011'}
                </h4>
                <p style={{ fontSize: '0.78rem', color: '#334155' }}>
                  {violationCount > 0 ? 'Mandatory declarations missing or format invalid. Compounding notice recommended.' : 'All mandatory declarations verified against Legal Metrology Rules.'}
                </p>
              </div>
            </div>
          </div>

          {/* Extracted Key-Value Fields List */}
          <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem 1rem', background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', display: 'flex', justifyContent: 'space-between' }}>
              <span>Mandatory Declaration Field</span>
              <span>Rule Reference & Result</span>
            </div>

            <div style={{ maxHeight: '290px', overflowY: 'auto' }}>
              {activeData.fields.map((f, idx) => (
                <div key={idx} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>{f.key}</span>
                    <span style={{ color: '#475569', fontSize: '0.8rem', fontFamily: 'monospace' }}>"{f.value}"</span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${f.status === 'VIOLATION' ? 'badge-critical' : f.status === 'WARNING' ? 'badge-warning' : 'badge-pass'}`} style={{ marginBottom: '0.2rem' }}>
                      {f.status}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b' }}>{f.ruleRef}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
