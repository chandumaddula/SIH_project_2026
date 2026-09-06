import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { useUserStore, useInspectionStore } from '../../store';
import { ScanResult, AIScanResponse, MANDATORY_DECLARATIONS, QUALITY_DEFECT_LABELS, VIOLATION_SEVERITY_STYLES } from '../../types/scan';
import { mockScanResults } from '../../services/mockData';
import { scanService } from '../../services/api';
import { CameraView } from './CameraView';
import { EmptyState } from '../../components/EmptyState';
import { generateInspectionId } from '../../services/inspection.service';
import { PackageImage } from '../../services/inspection.service';
import { Employee } from '../../types/user';

// -----------------------------------------------------------------------
// Helper: format snake_case field names to readable labels
// -----------------------------------------------------------------------
function formatFieldName(name: string): string {
  const map: Record<string, string> = {
    mrp: 'MRP',
    net_quantity: 'Net Quantity',
    product_name: 'Product Name',
    manufacturer: 'Manufacturer',
    packer: 'Packer',
    importer: 'Importer',
    consumer_care: 'Consumer Care',
    country_of_origin: 'Country of Origin',
    address: 'Address',
    mfg_date: 'Manufacturing Date',
    exp_date: 'Expiry Date',
    batch_number: 'Batch Number',
    barcode: 'Barcode',
    fssai_license: 'FSSAI License',
    generic_name: 'Generic Name',
    // camelCase variants
    productName: 'Product Name',
    netQuantity: 'Net Quantity',
    mfgDate: 'Manufacturing Date',
    expDate: 'Expiry Date',
    batchNumber: 'Batch Number',
    fssaiLicense: 'FSSAI License',
    countryOfOrigin: 'Country of Origin',
    consumerCare: 'Consumer Care',
  };
  if (map[name]) return map[name];
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// -----------------------------------------------------------------------
// Image Quality Defects Panel
// -----------------------------------------------------------------------
function ImageQualityPanel({ quality }: { quality: AIScanResponse['image_quality'] }) {
  if (quality.defects.length === 0) return null;

  return (
    <div className="scan__quality-issues">
      <h4 className="scan__section-title">⚠️ Image Quality Issues</h4>
      <div className="scan__defects-list">
        {quality.defects.map((defect, i) => (
          <div key={i} className="scan__defect-item">
            <Badge variant="warning" size="sm">{defect.replace(/_/g, ' ')}</Badge>
            <span className="scan__defect-desc">
              {QUALITY_DEFECT_LABELS[defect] || 'Image quality issue detected'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Mandatory Declaration Status
// -----------------------------------------------------------------------
function DeclarationStatusPanel({ declarations }: { declarations: AIScanResponse['extracted_declarations'] }) {
  return (
    <div className="scan__declarations">
      <h4 className="scan__section-title">📋 Legal Metrology Declarations</h4>
      <div className="scan__declaration-grid">
        {MANDATORY_DECLARATIONS.map((decl) => {
          const value = declarations[decl.field] || declarations[decl.field.toLowerCase()] || declarations[decl.field.replace(/_/g, '')];
          const isPresent = value !== null && value !== undefined && String(value).trim() !== '';

          return (
            <div key={decl.field} className={`scan__declaration-item ${isPresent ? 'scan__declaration-item--present' : 'scan__declaration-item--missing'}`}>
              <div className="scan__declaration-header">
                <span className="scan__declaration-label">{decl.label}</span>
                {decl.required && <Badge variant={isPresent ? 'success' : 'error'} size="sm">Required</Badge>}
              </div>
              <div className="scan__declaration-value">
                {isPresent ? String(value) : <span className="scan__declaration-missing">Not detected</span>}
              </div>
              {decl.rule && <code className="scan__declaration-rule">{decl.rule}</code>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Compliance Banner
// -----------------------------------------------------------------------
function ComplianceBanner({ screening }: { screening: AIScanResponse['rule_engine_screening'] }) {
  const resultClass = screening.result;
  const icons: Record<string, string> = {
    no_issue: '✅',
    review_recommended: '⚠️',
    potential_violation: '❌',
  };
  const variantMap: Record<string, 'success' | 'warning' | 'error'> = {
    no_issue: 'success',
    review_recommended: 'warning',
    potential_violation: 'error',
  };

  return (
    <div className={`scan__compliance scan__compliance--${resultClass}`}>
      <div className="scan__compliance-icon">{icons[resultClass] || '❓'}</div>
      <div className="scan__compliance-text">
        <strong>{screening.compliance_status.replace('_', ' ')}</strong>
        <span>{screening.explanation}</span>
      </div>
      <div className="scan__compliance-right">
        <Badge variant={variantMap[resultClass] || 'neutral'}>
          {Math.round(screening.confidence * 100)}% confidence
        </Badge>
        {screening.flags.length > 0 && (
          <div className="scan__compliance-flags">
            {screening.flags.slice(0, 3).map((flag, i) => (
              <Badge key={i} variant="warning" size="sm">{flag}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Extracted Field Card
// -----------------------------------------------------------------------
function ExtractedFieldCard({ field }: { field: AIScanResponse['field_evidences'][0] }) {
  const pct = Math.round(field.confidence * 100);
  const barColor = pct >= 80 ? '#4caf50' : pct >= 60 ? '#ff9800' : '#f44336';

  return (
    <div className="scan__field-card">
      <div className="scan__field-header">
        <span className="scan__field-label">{formatFieldName(field.field)}</span>
        <span className="scan__field-conf">{pct}%</span>
      </div>
      <div className="scan__field-value">
        {field.value !== null && field.value !== undefined && String(field.value).trim()
          ? String(field.value)
          : <span className="scan__field-empty">Not detected</span>}
      </div>
      <div className="scan__field-bar">
        <div
          className="scan__field-bar-fill"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Violations Panel
// -----------------------------------------------------------------------
function ViolationsPanel({ violations }: { violations: AIScanResponse['rule_engine_screening']['violations'] }) {
  if (!violations || violations.length === 0) return null;
  return (
    <div className="scan__violations">
      <h4 className="scan__section-title">⚠️ Detected Violations</h4>
      {violations.map((v, i) => {
        const style = VIOLATION_SEVERITY_STYLES[v.severity] || VIOLATION_SEVERITY_STYLES['INFO'];
        return (
          <div key={i} className="scan__violation-item" style={{ background: style.bg, borderLeftColor: style.border }}>
            <Badge variant="error" size="sm">{style.label}</Badge>
            <span className="scan__violation-desc">{v.description}</span>
            {v.rule_id && <code className="scan__violation-rule">{v.rule_id}</code>}
            {v.legal_reference && <code className="scan__violation-rule">{v.legal_reference}</code>}
          </div>
        );
      })}
    </div>
  );
}

// -----------------------------------------------------------------------
// Main ScanPage
// -----------------------------------------------------------------------
export const ScanPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { setInspectionData } = useInspectionStore();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [apiResult, setApiResult] = useState<AIScanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAutoFillPreview, setShowAutoFillPreview] = useState(false);
  const [showAutoFillNotice, setShowAutoFillNotice] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewFormData, setPreviewFormData] = useState<{
    productName: string;
    productCategory: string;
    manufacturer: string;
    retailer: string;
    location: string;
    packageType: string;
    barcode: string;
  } | null>(null);

  const recentScans = mockScanResults;

  // -----------------------------------------------------------------------
  // Comprehensive product categories
  // -----------------------------------------------------------------------
  const PRODUCT_CATEGORIES = {
    PACKAGED_FOOD: 'Packaged Food',
    BEVERAGE: 'Beverage',
    PERSONAL_CARE: 'Personal Care',
    PHARMACEUTICAL: 'Pharmaceutical',
    HOUSEHOLD: 'Household Product',
    AGRICULTURAL: 'Agricultural Input',
    ELECTRONIC: 'Electronic Goods',
    TEXTILE: 'Textile',
    TOBACCO: 'Tobacco Product',
    OTHER: 'Other',
  } as const;

  // -----------------------------------------------------------------------
  // Detect product category from product name and other clues
  // -----------------------------------------------------------------------
  const detectProductCategory = (productName: string, extracted: Record<string, string | number | null>): string => {
    const text = `${productName} ${extracted.fssaiLicense || ''} ${extracted.genericName || ''}`.toLowerCase();

    // Food categories - most common first
    if (text.match(/biscuit|biscuits|cake|cakes|chocolate|candies|snack|snacks|food|namkeen|chips|gummies|cookies|munchies|pasta|noodles|ready.to.eat|spice|oil|ghee|rice|wheat|flour/i)) {
      return PRODUCT_CATEGORIES.PACKAGED_FOOD;
    }
    if (text.match(/water|bottled|mineral|juice|drink|drinks|soda|beverage|beverages|tea|coffee|soft.drink|energy.drink|milk|lassi/i)) {
      return PRODUCT_CATEGORIES.BEVERAGE;
    }

    // Personal care
    if (text.match(/shampoo|soap|detergent|hair.oil|toothpaste|face.cream|lotion|moisturizer|cosmetics|deodorant|perfume|razor|sanitary/i)) {
      return PRODUCT_CATEGORIES.PERSONAL_CARE;
    }

    // Pharmaceutical
    if (text.match(/tablet|capsule|syrup|medicine|pharma|pharmaceutical|drug|tablet|ointment|vitamin|ayurvedic|herbal/i)) {
      return PRODUCT_CATEGORIES.PHARMACEUTICAL;
    }

    // Household
    if (text.match(/detergent|cleaner|disinfectant|bleach|insecticide|household|home.care|polish|air.freshener/i)) {
      return PRODUCT_CATEGORIES.HOUSEHOLD;
    }

    // Agricultural
    if (text.match(/fertilizer|seeds|pesticide|herbicide|agricultural|agri| crop/i)) {
      return PRODUCT_CATEGORIES.AGRICULTURAL;
    }

    // Electronic
    if (text.match(/electronic|gadget|device|accessory|cable|charger|adapter/i)) {
      return PRODUCT_CATEGORIES.ELECTRONIC;
    }

    // Textile
    if (text.match(/cloth|apparel|garment|textile|fabric|footwear|shoes/i)) {
      return PRODUCT_CATEGORIES.TEXTILE;
    }

    // Tobacco
    if (text.match(/cigarette|tobacco|gutka|pan.masala|bidi|smoking/i)) {
      return PRODUCT_CATEGORIES.TOBACCO;
    }

    // Check for FSSAI license (indicates food product)
    if (extracted.fssaiLicense || extracted.fssai_license || extracted.fssaiLicenseNo) {
      return PRODUCT_CATEGORIES.PACKAGED_FOOD;
    }

    // Default
    return PRODUCT_CATEGORIES.OTHER;
  };

  // -----------------------------------------------------------------------
  // Comprehensive package type detection
  // -----------------------------------------------------------------------
  const PACKAGE_TYPES = {
    POUCH: 'Pouch',
    BOTTLE: 'Bottle',
    BOX_CARTON: 'Box / Carton',
    JAR: 'Jar',
    CAN: 'Can',
    SACHET: 'Sachet',
    BLISTER_PACK: 'Blister Pack',
    TUB: 'Tub',
    TUBE: 'Tube',
    WRAPPER: 'Wrapper',
    BAG: 'Bag',
    TRAY: 'Tray',
    PALLET: 'Pallet',
    OTHER: 'Other',
  } as const;

  const detectPackageType = (text: string): string => {
    const lowerText = text.toLowerCase();

    // Pouch types
    if (lowerText.match(/pouch|pouches|stand.up.pouch|retort.pouch|spout.pouch/i)) {
      return PACKAGE_TYPES.POUCH;
    }
    // Bottle types
    if (lowerText.match(/bottle|bottles|pet.bottle|glass.bottle|plastic.bottle|ampoule/i)) {
      return PACKAGE_TYPES.BOTTLE;
    }
    // Box/Carton types
    if (lowerText.match(/box|boxes|carton|tetra.pack|tetra pak|cardboard|corrugated/i)) {
      return PACKAGE_TYPES.BOX_CARTON;
    }
    // Jar types
    if (lowerText.match(/jar|jars|container|glass.jar/i)) {
      return PACKAGE_TYPES.JAR;
    }
    // Can types
    if (lowerText.match(/can|cans|tin|aerosol/i)) {
      return PACKAGE_TYPES.CAN;
    }
    // Sachet types
    if (lowerText.match(/sachet|sachets|unit.pouch|single.serve/i)) {
      return PACKAGE_TYPES.SACHET;
    }
    // Blister pack (tablets, capsules)
    if (lowerText.match(/blister|blister.pack|strip|aluminium.strip/i)) {
      return PACKAGE_TYPES.BLISTER_PACK;
    }
    // Tub types
    if (lowerText.match(/tub|tubs|pot|bucket/i)) {
      return PACKAGE_TYPES.TUB;
    }
    // Tube types
    if (lowerText.match(/tube|tubes|collapsible.tube/i)) {
      return PACKAGE_TYPES.TUBE;
    }
    // Wrapper types
    if (lowerText.match(/wrapper|wrappers|foil.wrap|film|laminate/i)) {
      return PACKAGE_TYPES.WRAPPER;
    }
    // Bag types
    if (lowerText.match(/bag|bags|paper.bag|poly.bag|carry.bag/i)) {
      return PACKAGE_TYPES.BAG;
    }
    // Tray types
    if (lowerText.match(/tray|trays|blister.tray|foam.tray/i)) {
      return PACKAGE_TYPES.TRAY;
    }
    // Pallet types
    if (lowerText.match(/pallet|pallets|wooden.pallet/i)) {
      return PACKAGE_TYPES.PALLET;
    }

    return PACKAGE_TYPES.OTHER;
  };

  // -----------------------------------------------------------------------
  // Extract retailer/market information
  // -----------------------------------------------------------------------
  const extractRetailer = (text: string, extracted: Record<string, string | number | null>): string => {
    // Retailer is rarely on product label - mark for manual entry
    // Common retail chain patterns if present
    const lowerText = text.toLowerCase();

    // These are typically printed by retailers themselves (not manufacturers)
    // So we return empty and let user fill manually
    if (lowerText.match(/imported.by|marketed.by|distributed.by|sold.by/i)) {
      return String(extracted.importedBy || extracted.marketedBy || extracted.distributedBy || '') || '';
    }

    return '';
  };

  // -----------------------------------------------------------------------
  // Extract location from address and other fields
  // -----------------------------------------------------------------------
  const extractLocation = (extracted: Record<string, string | number | null>): string => {
    // Try various location-related fields
    const locationFields = [
      'address', 'ADDRESS', 'city', 'City', 'STATE', 'state', 'country', 'Country',
      'pincode', 'Pincode', 'zipcode', 'Zipcode', 'postalCode', 'location',
      'manufacturersAddress', 'factoryAddress', 'registeredOffice'
    ];

    const parts: string[] = [];
    for (const field of locationFields) {
      const value = extracted[field];
      if (value && String(value).trim()) {
        parts.push(String(value).trim());
      }
    }

    // Extract country of origin if available
    const countryOfOrigin = extracted.countryOfOrigin || extracted.country_of_origin || extracted.COUNTRY_OF_ORIGIN;
    if (countryOfOrigin && String(countryOfOrigin).trim()) {
      parts.push(`Country: ${String(countryOfOrigin).trim()}`);
    }

    return parts.join(', ') || '';
  };

  // -----------------------------------------------------------------------
  // Map extracted declarations to inspection form fields
  // -----------------------------------------------------------------------
  const mapExtractedToForm = (extracted: Record<string, string | number | null>, rawText: string = ''): {
    productName: string;
    productCategory: string;
    manufacturer: string;
    retailer: string;
    location: string;
    packageType: string;
    barcode: string;
  } => {
    // Extract product name - try multiple field names
    const productName = (extracted.productName as string) ||
                       (extracted.product_name as string) ||
                       (extracted.PRODUCT_NAME as string) || '';

    // Combine all text for detection purposes
    const allText = `${productName} ${rawText} ${extracted.address || ''}`.toLowerCase();

    // Detect product category
    const productCategory = detectProductCategory(productName, extracted);

    // Detect package type
    const packageType = detectPackageType(allText);

    // Extract manufacturer/packer/importer
    const manufacturer = (extracted.manufacturer as string) ||
                        (extracted.manufacturer_details as string) ||
                        (extracted.MANUFACTURER_DETAILS as string) ||
                        (extracted.packer as string) ||
                        (extracted.packer_details as string) ||
                        (extracted.packer_details as string) ||
                        (extracted.importer as string) || '';

    // Extract barcode - try multiple field names
    const barcode = (extracted.barcode as string) ||
                   (extracted.BARCODE as string) ||
                   (extracted.barcodeValue as string) ||
                   (extracted.gtin as string) ||
                   (extracted.ean as string) ||
                   (extracted.upc as string) || '';

    // Extract retailer info
    const retailer = extractRetailer(rawText, extracted);

    // Extract location
    const location = extractLocation(extracted);

    return {
      productName,
      productCategory,
      manufacturer,
      retailer, // Empty if not found, user can fill manually
      location,
      packageType,
      barcode,
    };
  };

  // -----------------------------------------------------------------------
  // Create Inspection with all scan data - skip to analysis
  // -----------------------------------------------------------------------
  const handleSkipToAnalysis = () => {
    if (!apiResult || !user) return;

    const employee = user as Employee;
    const inspectionId = generateInspectionId();
    const extracted = apiResult.extracted_declarations;
    const formData = mapExtractedToForm(extracted);

    const packageImage: PackageImage = {
      id: `img-${Date.now()}`,
      imageData: scanResult?.imageUrl || '',
      type: 'label',
      capturedAt: new Date().toISOString(),
      quality: {
        overall: apiResult.image_quality.usable ? 'good' : 'warning',
        lighting: 'good',
        blur: 'good',
        visibility: apiResult.package_detection.detected ? 'good' : 'warning',
      },
    };

    setInspectionData({
      inspectionId,
      officerId: employee.id || 'emp-001',
      officerName: employee.name || 'Officer',
      office: employee.office || 'Regional Metrology Office',
      images: [packageImage],
      form: formData,
    });

    navigate('/employee/inspection/analysis');
  };

  // -----------------------------------------------------------------------
  // Show AutoFill Preview - displays what will be auto-filled
  // -----------------------------------------------------------------------
  const handleShowAutoFillPreview = () => {
    if (!apiResult) return;

    const extracted = apiResult.extracted_declarations;
    const formData = mapExtractedToForm(extracted, apiResult.raw_text);
    setPreviewFormData(formData);
    setShowAutoFillPreview(true);
  };

  // -----------------------------------------------------------------------
  // Confirm AutoFill and proceed to inspection form
  // -----------------------------------------------------------------------
  const handleConfirmAutoFill = () => {
    if (!apiResult || !user || !previewFormData) return;

    const employee = user as Employee;
    const inspectionId = generateInspectionId();

    const packageImage: PackageImage = {
      id: `img-${Date.now()}`,
      imageData: scanResult?.imageUrl || '',
      type: 'label',
      capturedAt: new Date().toISOString(),
      quality: {
        overall: apiResult.image_quality.usable ? 'good' : 'warning',
        lighting: 'good',
        blur: 'good',
        visibility: apiResult.package_detection.detected ? 'good' : 'warning',
      },
    };

    setInspectionData({
      inspectionId,
      officerId: employee.id || 'emp-001',
      officerName: employee.name || 'Officer',
      office: employee.office || 'Regional Metrology Office',
      images: [packageImage],
      form: previewFormData,
    });

    setShowAutoFillPreview(false);
    navigate('/employee/inspection/new');
  };

  // -----------------------------------------------------------------------
  // handleCapture — scans and analyzes package
  // -----------------------------------------------------------------------
  const handleCapture = async (imageData: string) => {
    setLoading(true);
    setError(null);

    try {
      const imgResponse = await fetch(imageData);
      const blob = await imgResponse.blob();
      const file = new File([blob], 'capture.jpg', {
        type: blob.type || 'image/jpeg',
      });

      const result = await scanService.scanPackage(file);

      setApiResult(result);

      const mapped: ScanResult = {
        id: result.scan_id,
        imageUrl: imageData,
        capturedAt: new Date().toISOString(),
        detected: {
          productName: result.extracted_declarations?.productName as string || undefined,
          mfgDate: result.extracted_declarations?.mfgDate as string || undefined,
          expDate: result.extracted_declarations?.expDate as string || undefined,
          batchNumber: result.extracted_declarations?.batchNumber as string || undefined,
          licenseNumber: result.extracted_declarations?.fssaiLicense as string || undefined,
          weight: result.extracted_declarations?.netQuantity as string || undefined,
          mrp: result.extracted_declarations?.mrp as string || undefined,
          manufacturer: result.extracted_declarations?.manufacturer as string || undefined,
          countryOfOrigin: result.extracted_declarations?.countryOfOrigin as string || undefined,
          consumerCare: result.extracted_declarations?.consumerCare as string || undefined,
        },
        missing: result.field_evidences
          .filter(f => !f.value || String(f.value).trim() === '')
          .map(f => formatFieldName(f.field)),
        isCompliant: result.rule_engine_screening?.result === 'no_issue',
        inspectorId: user?.id || 'emp-001',
      };
      setScanResult(mapped);
      setShowAutoFillNotice(true);
    } catch (err: any) {
      setError(err.message || 'Scan failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------------------------
  // handleFileChange
  // -----------------------------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setSelectedImage(imageData);
      setShowUpload(false);
      handleCapture(imageData);
    };
    reader.onerror = () => setShowUpload(false);
    reader.readAsDataURL(file);
  };

  // -----------------------------------------------------------------------
  // handleReset
  // -----------------------------------------------------------------------
  const handleReset = () => {
    setScanResult(null);
    setApiResult(null);
    setShowUpload(false);
    setIsCameraOpen(false);
    setError(null);
    setShowAutoFillPreview(false);
    setPreviewFormData(null);
    setShowAutoFillNotice(false);
    setSelectedImage(null);
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="page">
      <h1 className="page-title">Scan / Upload Package</h1>

      {/* Error banner */}
      {error && (
        <div className="scan__error">
          <div className="scan__error-msg">
            <strong>❌ Error:</strong> {error}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>Dismiss</Button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="scan__actions">
        <Button
          variant="primary"
          size="lg"
          fullWidth={true}
          onClick={() => setIsCameraOpen(true)}
          disabled={loading}
        >
          {loading ? 'Analyzing Package...' : '📷 Open Camera'}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          fullWidth={true}
          onClick={() => setShowUpload(true)}
          disabled={loading}
        >
          🖼️ Upload Image
        </Button>
      </div>

      {/* Loading indicator */}
      {loading && (
        <Card className="scan__loading-card">
          <CardBody>
            <div className="scan__loading">
              <div className="scan__loading-spinner"></div>
              <p>Analyzing package label...</p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="scan__modal-backdrop" onClick={() => !loading && setIsCameraOpen(false)}>
          <div className="scan__modal">
            <div className="scan__modal-header">
              <h2 className="scan__modal-title">Camera Scanner</h2>
              <button className="scan__modal-close" onClick={() => setIsCameraOpen(false)} aria-label="Close camera">✕</button>
            </div>
            <div className="scan__modal-body">
              <CameraView onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* File Upload */}
      {showUpload && (
        <div className="scan__upload">
          <div className="scan__upload-header">
            <h2>Upload Image</h2>
            <button className="scan__upload-close" onClick={() => setShowUpload(false)}>✕</button>
          </div>
          <div className="scan__upload-body">
            <p>Select an image file to scan</p>
            <Input
              type="file"
              id="fileUpload"
              accept="image/*"
              onChange={handleFileChange}
              fullWidth={true}
            />
            <p className="scan__upload-note">
              Supported formats: JPG, PNG, GIF, WebP (max 10MB)
            </p>
          </div>
        </div>
      )}

      {/* Scan Results */}
      {scanResult && apiResult && (
        <Card className="scan__results-card">
          <CardHeader>
            <CardTitle>Package Analysis Results</CardTitle>
            <Badge variant="info" size="sm">Scan Complete</Badge>
          </CardHeader>
          <CardBody>

            {/* Compliance Banner */}
            <ComplianceBanner screening={apiResult.rule_engine_screening} />

            {/* Image + Basic Info */}
            <div className="scan__results-top">
              <div className="scan__results-image-wrap">
                <img
                  src={scanResult.imageUrl}
                  alt="Scanned package label"
                  className="scan__results-image-img"
                />
              </div>
              <div className="scan__results-meta">
                <div className="scan__meta-row">
                  <span className="scan__meta-label">Scan ID</span>
                  <code className="scan__meta-value">{apiResult.scan_id}</code>
                </div>
                <div className="scan__meta-row">
                  <span className="scan__meta-label">Image Quality</span>
                  <Badge variant={apiResult.image_quality.usable ? 'success' : 'error'} size="sm">
                    {apiResult.image_quality.quality_status}
                  </Badge>
                </div>
                <div className="scan__meta-row">
                  <span className="scan__meta-label">Package Detected</span>
                  <Badge variant={apiResult.package_detection.detected ? 'success' : 'warning'} size="sm">
                    {apiResult.package_detection.detected ? 'Yes' : 'No'}
                  </Badge>
                </div>
                {apiResult.image_quality.defects?.length > 0 && (
                  <div className="scan__meta-row">
                    <span className="scan__meta-label">Issues</span>
                    <div className="scan__meta-defects">
                      {apiResult.image_quality.defects.map((d, i) => (
                        <Badge key={i} variant="warning" size="sm">{d}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Image Quality Issues */}
            <ImageQualityPanel quality={apiResult.image_quality} />

            {/* Legal Metrology Declarations Status */}
            <DeclarationStatusPanel declarations={apiResult.extracted_declarations} />

            {/* Extracted Fields */}
            <h4 className="scan__section-title">
              Extracted Information
              <Badge variant="info" size="sm">{apiResult.field_evidences.length} fields</Badge>
            </h4>
            <div className="scan__fields-grid">
              {apiResult.field_evidences.map((field) => (
                <ExtractedFieldCard key={field.field} field={field} />
              ))}
            </div>

            {/* Violations */}
            <ViolationsPanel violations={apiResult.rule_engine_screening.violations} />

            {/* Suggested Next Step */}
            {apiResult.rule_engine_screening.suggestedNextStep && (
              <div className="scan__next-step">
                <strong>📌 Recommendation:</strong> {apiResult.rule_engine_screening.suggestedNextStep}
              </div>
            )}

            {/* Action Buttons */}
            <div className="scan__results-actions">
              <Button variant="primary" size="lg" fullWidth={true} onClick={handleShowAutoFillPreview}>
                ✨ Preview Auto-Fill Details
              </Button>
              <Button variant="secondary" size="lg" fullWidth={true} onClick={handleSkipToAnalysis}>
                🚀 Skip to Analysis
              </Button>
              <Button variant="ghost" size="lg" fullWidth={true} onClick={handleReset}>
                Scan Another Package
              </Button>
              {apiResult.rule_engine_screening.result !== 'no_issue' && (
                <Button
                  variant="accent"
                  size="lg"
                  fullWidth={true}
                  onClick={() => alert(`Non-compliance notice raised for scan ${apiResult.scan_id}`)}
                >
                  Raise Non-Compliance Notice
                </Button>
              )}
            </div>

          </CardBody>
        </Card>
      )}

      {/* AutoFill Preview Modal */}
      {showAutoFillPreview && previewFormData && (
        <div className="scan__modal-backdrop" onClick={() => setShowAutoFillPreview(false)}>
          <div className="scan__modal scan__autofill-modal" onClick={(e) => e.stopPropagation()}>
            <div className="scan__modal-header">
              <h2 className="scan__modal-title">✨ Auto-Fill Preview</h2>
              <button className="scan__modal-close" onClick={() => setShowAutoFillPreview(false)} aria-label="Close">✕</button>
            </div>
            <div className="scan__modal-body">
              <p className="scan__autofill-description">
                The following fields will be auto-filled based on the scanned package label. You can edit them after proceeding.
              </p>

              <div className="scan__autofill-grid">
                {/* Product Name */}
                <div className="scan__autofill-item">
                  <div className="scan__autofill-label">Product Name</div>
                  <div className="scan__autofill-value">
                    {previewFormData.productName || <span className="scan__autofill-empty">Not detected</span>}
                  </div>
                </div>

                {/* Product Category */}
                <div className="scan__autofill-item">
                  <div className="scan__autofill-label">Product Category</div>
                  <div className="scan__autofill-value">
                    <Badge variant="primary" size="sm">{previewFormData.productCategory || 'Not detected'}</Badge>
                  </div>
                </div>

                {/* Manufacturer */}
                <div className="scan__autofill-item">
                  <div className="scan__autofill-label">Manufacturer / Company</div>
                  <div className="scan__autofill-value">
                    {previewFormData.manufacturer || <span className="scan__autofill-empty">Not detected</span>}
                  </div>
                </div>

                {/* Retailer */}
                <div className="scan__autofill-item">
                  <div className="scan__autofill-label">Retailer / Market</div>
                  <div className="scan__autofill-value">
                    {previewFormData.retailer || <span className="scan__autofill-manual">Manual entry required</span>}
                  </div>
                </div>

                {/* Location */}
                <div className="scan__autofill-item scan__autofill-item--full">
                  <div className="scan__autofill-label">Location / Address</div>
                  <div className="scan__autofill-value">
                    {previewFormData.location || <span className="scan__autofill-empty">Not detected</span>}
                  </div>
                </div>

                {/* Package Type */}
                <div className="scan__autofill-item">
                  <div className="scan__autofill-label">Package Type</div>
                  <div className="scan__autofill-value">
                    <Badge variant="info" size="sm">{previewFormData.packageType || 'Not detected'}</Badge>
                  </div>
                </div>

                {/* Barcode */}
                <div className="scan__autofill-item">
                  <div className="scan__autofill-label">Barcode</div>
                  <div className="scan__autofill-value">
                    {previewFormData.barcode || <span className="scan__autofill-empty">Not detected</span>}
                  </div>
                </div>
              </div>

              <div className="scan__autofill-actions">
                <Button variant="primary" size="lg" fullWidth={true} onClick={handleConfirmAutoFill}>
                  ✅ Confirm & Proceed to Inspection
                </Button>
                <Button variant="ghost" size="lg" fullWidth={true} onClick={() => setShowAutoFillPreview(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Scans */}
      <div className="scan__history">
        <h2>Recent Scans</h2>
        {recentScans.length === 0 ? (
          <EmptyState
            title="No scans yet"
            description="Your scan history will appear here after scanning products."
          />
        ) : (
          <div className="scan__history-list">
            {recentScans.slice(0, 5).map((scan) => (
              <div key={scan.id} className="scan__history-item">
                <div className="scan__history-info">
                  <div className="scan__history-product">
                    {scan.detected.productName || 'Unknown Product'}
                  </div>
                  <div className="scan__history-date">
                    {new Date(scan.capturedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="scan__history-status">
                  {scan.isCompliant ? (
                    <Badge variant="success">Compliant</Badge>
                  ) : (
                    <Badge variant="error">Non-Compliant</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        /* ── Error banner ─────────────────────────────────────────── */
        .scan__error {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: #ffebee;
          border-left: 5px solid #f44336;
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
          color: #b71c1c;
          font-size: 1rem;
        }
        .scan__error-msg { flex: 1; font-weight: 500; }

        /* ── Loading ──────────────────────────────────────────────── */
        .scan__loading-card {
          margin-bottom: var(--space-4);
          border: 1px solid var(--color-navy-200);
        }
        .scan__loading {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-4);
        }
        .scan__loading-spinner {
          width: 36px;
          height: 36px;
          border: 4px solid var(--color-gray-200);
          border-top-color: var(--color-navy-500);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .scan__loading p {
          margin: 0;
          font-size: 1.1rem;
          color: #1a1a1a;
          font-weight: 500;
        }

        /* ── Compliance Banner ────────────────────────────────────── */
        .scan__compliance {
          display: flex;
          align-items: flex-start;
          gap: var(--space-4);
          padding: var(--space-4) var(--space-5);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-5);
          border-left: 5px solid;
          font-size: 1.05rem;
        }
        .scan__compliance--no_issue { background: #e8f5e9; border-color: #4caf50; }
        .scan__compliance--review_recommended { background: #fff3e0; border-color: #ff9800; }
        .scan__compliance--potential_violation { background: #ffebee; border-color: #f44336; }
        .scan__compliance-icon { font-size: 2.2rem; flex-shrink: 0; line-height: 1; }
        .scan__compliance-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          font-size: 1rem;
        }
        .scan__compliance-text strong {
          font-size: 1.15rem;
          color: #1a1a1a;
        }
        .scan__compliance-text span {
          font-size: 1rem;
          color: #333333;
          font-weight: 500;
        }
        .scan__compliance-right { display: flex; flex-direction: column; align-items: flex-end; gap: var(--space-2); flex-shrink: 0; }
        .scan__compliance-flags { display: flex; flex-direction: column; align-items: flex-end; gap: var(--space-1); }

        /* ── Results top grid ─────────────────────────────────────── */
        .scan__results-top {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: var(--space-5);
          margin-bottom: var(--space-5);
          align-items: flex-start;
        }
        @media (max-width: 768px) {
          .scan__results-top { grid-template-columns: 1fr; }
        }
        .scan__results-image-wrap {
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--color-gray-200);
        }
        .scan__results-image-img { width: 100%; display: block; }
        .scan__results-meta { display: flex; flex-direction: column; gap: var(--space-2); }
        .scan__meta-row {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--color-gray-50);
          border-radius: var(--radius-md);
          font-size: 1rem;
          flex-wrap: wrap;
        }
        .scan__meta-label {
          font-size: 0.95rem;
          text-transform: uppercase;
          color: #444444;
          min-width: 100px;
          font-weight: 700;
        }
        .scan__meta-value { font-weight: 700; color: #111111; font-size: 1rem; }
        .scan__meta-defects { display: flex; flex-wrap: wrap; gap: var(--space-1); }

        /* ── Section titles ───────────────────────────────────────── */
        .scan__section-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 1.2rem;
          font-weight: 700;
          color: #0a0a0a;
          margin: var(--space-4) 0 var(--space-3);
        }

        /* ── Extracted Fields Grid ─────────────────────────────────── */
        .scan__fields-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: var(--space-4);
          margin-bottom: var(--space-5);
        }
        .scan__field-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--radius-md);
          padding: var(--space-4) var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .scan__field-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .scan__field-label {
          font-size: 0.9rem;
          text-transform: uppercase;
          color: #555555;
          font-weight: 700;
          letter-spacing: 0.3px;
        }
        .scan__field-conf {
          font-size: 0.95rem;
          color: #333333;
          font-weight: 700;
        }
        .scan__field-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #111111;
          word-break: break-word;
          line-height: 1.4;
        }
        .scan__field-empty { color: #777777; font-style: italic; font-weight: 400; }
        .scan__field-bar {
          height: 6px;
          background: var(--color-gray-200);
          border-radius: 3px;
          overflow: hidden;
        }
        .scan__field-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        /* ── Quality Issues ──────────────────────────────────────── */
        .scan__quality-issues {
          background: #fff3e0;
          padding: var(--space-4);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
          border: 1px solid #ffe0b2;
        }
        .scan__defects-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .scan__defect-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 1rem;
        }
        .scan__defect-desc {
          color: #333333;
          font-size: 0.95rem;
        }

        /* ── Legal Metrology Declarations ───────────────────────── */
        .scan__declarations {
          margin-bottom: var(--space-5);
        }
        .scan__declaration-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-3);
          margin-top: var(--space-3);
        }
        .scan__declaration-item {
          background: var(--color-white);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--radius-md);
          padding: var(--space-4) var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .scan__declaration-item--present {
          border-left: 5px solid #4caf50;
        }
        .scan__declaration-item--missing {
          border-left: 5px solid #f44336;
          background: #ffebee;
        }
        .scan__declaration-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .scan__declaration-label {
          font-size: 0.95rem;
          text-transform: uppercase;
          color: #555555;
          font-weight: 700;
          letter-spacing: 0.3px;
        }
        .scan__declaration-value {
          font-size: 1.05rem;
          font-weight: 600;
          color: #111111;
          word-break: break-word;
        }
        .scan__declaration-missing {
          color: #c62828;
          font-style: italic;
        }
        .scan__declaration-rule {
          font-size: 12px;
          color: #555555;
          background: var(--color-gray-100);
          padding: 3px 8px;
          border-radius: 4px;
        }

        /* ── Violations ─────────────────────────────────────────── */
        .scan__violations {
          background: #ffebee;
          padding: var(--space-4);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
          border: 1px solid #ffcdd2;
        }
        .scan__violation-item {
          display: flex;
          align-items: flex-start;
          gap: var(--space-2);
          margin-top: var(--space-2);
          font-size: 1rem;
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-sm);
          border-left: 4px solid;
        }
        .scan__violation-desc { flex: 1; color: #222222; }
        .scan__violation-rule { font-size: 12px; color: #555555; margin-left: auto; }

        /* ── Missing ──────────────────────────────────────────────── */
        .scan__missing { margin-bottom: var(--space-4); }
        .scan__missing-list { display: flex; flex-wrap: wrap; gap: var(--space-2); }

        /* ── Next step ────────────────────────────────────────────── */
        .scan__next-step {
          background: #e8f0fe;
          padding: var(--space-4) var(--space-5);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
          font-size: 1rem;
          color: #1a1a1a;
          border-left: 5px solid #1a73e8;
        }
        .scan__next-step strong {
          font-size: 1.1rem;
        }

        /* ── Actions ──────────────────────────────────────────────── */
        .scan__results-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-top: var(--space-4);
        }

        /* ── Scan actions ──────────────────────────────────────────── */
        .scan__actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
        }
        @media (max-width: 480px) {
          .scan__actions { grid-template-columns: 1fr; }
        }

        /* ── Modal ───────────────────────────────────────────────── */
        .scan__modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--space-4);
        }
        .scan__modal {
          background: var(--color-white);
          border-radius: var(--radius-lg);
          max-width: 640px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .scan__modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-5);
          border-bottom: 1px solid var(--color-gray-200);
          background: var(--color-navy-50);
        }
        .scan__modal-title { font-size: 1.3rem; font-weight: 700; margin: 0; color: #111111; }
        .scan__modal-close { background: none; border: none; cursor: pointer; font-size: 1.4rem; color: #444444; padding: var(--space-1); }
        .scan__modal-body { overflow: auto; flex: 1; }

        /* ── Upload ──────────────────────────────────────────────── */
        .scan__upload {
          background: var(--color-white);
          border: 2px dashed var(--color-navy-300);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          margin-bottom: var(--space-4);
          text-align: center;
          font-size: 1rem;
        }
        .scan__upload-header { margin-bottom: var(--space-4); }
        .scan__upload-close { background: none; border: none; cursor: pointer; color: var(--color-gray-600); font-size: 1.2rem; }
        .scan__upload-note { font-size: 0.95rem; color: #555555; margin-top: var(--space-2); }

        /* ── History ──────────────────────────────────────────────── */
        .scan__history { margin-top: var(--space-8); }
        .scan__history-list { display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-4); }
        .scan__history-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          background: var(--color-white);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--radius-md);
        }
        .scan__history-product { font-weight: 600; color: #111111; font-size: 1rem; }
        .scan__history-date { font-size: 0.9rem; color: #666666; margin-top: 2px; }
        .scan__history-info { display: flex; flex-direction: column; }

        /* ── AutoFill Preview Modal ───────────────────────────────── */
        .scan__autofill-modal {
          max-width: 750px;
        }
        .scan__autofill-description {
          color: #333333;
          font-size: 1rem;
          margin-bottom: var(--space-4);
          padding: var(--space-4);
          background: #e8f0fe;
          border-radius: var(--radius-md);
          border-left: 5px solid #1a73e8;
          line-height: 1.5;
        }
        .scan__autofill-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
        }
        .scan__autofill-item {
          background: var(--color-white);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--radius-md);
          padding: var(--space-4) var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .scan__autofill-item--full {
          grid-column: 1 / -1;
        }
        .scan__autofill-label {
          font-size: 0.9rem;
          text-transform: uppercase;
          color: #555555;
          font-weight: 700;
          letter-spacing: 0.3px;
        }
        .scan__autofill-value {
          font-size: 1.05rem;
          font-weight: 600;
          color: #111111;
          word-break: break-word;
        }
        .scan__autofill-empty {
          color: #888888;
          font-style: italic;
          font-weight: 400;
        }
        .scan__autofill-manual {
          color: #e65100;
          font-style: italic;
          font-size: 0.95rem;
        }
        .scan__autofill-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-top: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid var(--color-gray-200);
        }
        @media (max-width: 600px) {
          .scan__autofill-grid { grid-template-columns: 1fr; }
        }

        /* ── Dark Mode Support ────────────────────────────────────── */
        @media (prefers-color-scheme: dark) {
          /* Dark background elements → white/bright text */
          .scan__modal-backdrop {
            background: rgba(0,0,0,0.7);
          }

          /* Cards and white backgrounds → dark text (but flip to light text on dark bg) */
          .scan__modal,
          .scan__field-card,
          .scan__declaration-item,
          .scan__declaration-item--present,
          .scan__history-item,
          .scan__autofill-item {
            background: #1e1e2e !important;
            border-color: #333344 !important;
          }

          /* Text on light/dark cards */
          .scan__field-label,
          .scan__declaration-label,
          .scan__autofill-label {
            color: #9ca3af !important;
          }

          .scan__field-value,
          .scan__declaration-value,
          .scan__autofill-value,
          .scan__history-product,
          .scan__modal-title {
            color: #f3f4f6 !important;
          }

          .scan__field-conf,
          .scan__meta-value {
            color: #d1d5db !important;
          }

          .scan__meta-label {
            color: #9ca3af !important;
          }

          /* Light background alert boxes → flip text to light */
          .scan__error,
          .scan__compliance--no_issue,
          .scan__compliance--review_recommended,
          .scan__compliance--potential_violation,
          .scan__meta-row,
          .scan__quality-issues,
          .scan__declaration-item--missing,
          .scan__violations,
          .scan__next-step,
          .scan__autofill-description {
            background: #2d2d3d !important;
            color: #e5e7eb !important;
            border-color: #404050 !important;
          }

          .scan__error { color: #fca5a5 !important; border-color: #ef4444 !important; }
          .scan__compliance-text strong { color: #ffffff !important; }
          .scan__compliance-text span { color: #d1d5db !important; }
          .scan__defect-desc { color: #d1d5db !important; }
          .scan__violation-desc { color: #e5e7eb !important; }
          .scan__next-step strong { color: #ffffff !important; }

          .scan__declaration-missing {
            color: #fca5a5 !important;
          }

          .scan__history-date {
            color: #6b7280 !important;
          }

          .scan__autofill-manual {
            color: #fbbf24 !important;
          }

          /* Modal header */
          .scan__modal-header {
            background: #252535 !important;
            border-color: #333344 !important;
          }

          /* Upload area */
          .scan__upload {
            background: #1e1e2e !important;
            border-color: #5c6bc0 !important;
          }

          .scan__upload-note {
            color: #9ca3af !important;
          }

          /* Loading */
          .scan__loading-spinner {
            border-color: #333344;
            border-top-color: #5c6bc0;
          }

          .scan__loading p {
            color: #e5e7eb !important;
          }

          /* Section titles */
          .scan__section-title {
            color: #f3f4f6 !important;
          }

          /* Rules badges */
          .scan__declaration-rule {
            background: #252535 !important;
            color: #9ca3af !important;
          }

          /* Field bar */
          .scan__field-bar {
            background: #333344;
          }

          /* Image border */
          .scan__results-image-wrap {
            border-color: #333344 !important;
          }

          /* Modal close button */
          .scan__modal-close {
            color: #d1d5db !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ScanPage;
