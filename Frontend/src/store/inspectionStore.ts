/* ==========================================================================
   Inspection Store
   Holds the current inspection draft during the inspection workflow.
   Reuses React Context (matching project pattern).
   Replace with real API calls when backend is available.
   ========================================================================== */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { PackageImage } from '../services/inspection.service';
import { ExtractedInformation } from '../services/extractedInfo.service';
import { ApplicabilityResult } from '../services/applicability.service';
import { ComplianceResult } from '../services/compliance.service';
import { PhysicalMeasurement } from '../services/readability.service';

export interface InspectionFormData {
  productName: string;
  productCategory: string;
  manufacturer: string;
  retailer: string;
  location: string;
  packageType: string;
  barcode: string;
  complaintId?: string;
  complaintIssue?: string;
}

interface InspectionContextType {
  inspectionId: string;
  officerId: string;
  officerName: string;
  office: string;
  images: PackageImage[];
  form: InspectionFormData;
  extractedInfo: ExtractedInformation | null;
  applicabilityResult: ApplicabilityResult | null;
  complianceResult: ComplianceResult | null;
  measurements: PhysicalMeasurement[];
  setInspectionData: (data: {
    inspectionId: string;
    officerId: string;
    officerName: string;
    office: string;
    images: PackageImage[];
    form: InspectionFormData;
  }) => void;
  setExtractedInfo: (info: ExtractedInformation) => void;
  setApplicabilityResult: (result: ApplicabilityResult) => void;
  setComplianceResult: (result: ComplianceResult) => void;
  addMeasurement: (m: PhysicalMeasurement) => void;
  removeMeasurement: (id: string) => void;
  clearInspection: () => void;
}

const InspectionContext = createContext<InspectionContextType | null>(null);

export const InspectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inspectionId, setInspectionId] = useState('');
  const [officerId, setOfficerId] = useState('');
  const [officerName, setOfficerName] = useState('');
  const [office, setOffice] = useState('');
  const [images, setImages] = useState<PackageImage[]>([]);
  const [form, setForm] = useState<InspectionFormData>({
    productName: '',
    productCategory: '',
    manufacturer: '',
    retailer: '',
    location: '',
    packageType: '',
    barcode: '',
  });
  const [extractedInfo, setExtractedInfoState] = useState<ExtractedInformation | null>(null);
  const [applicabilityResult, setApplicabilityResultState] = useState<ApplicabilityResult | null>(null);
  const [complianceResult, setComplianceResultState] = useState<ComplianceResult | null>(null);
  const [measurements, setMeasurements] = useState<PhysicalMeasurement[]>([]);

  const setInspectionData = useCallback((data: {
    inspectionId: string;
    officerId: string;
    officerName: string;
    office: string;
    images: PackageImage[];
    form: InspectionFormData;
  }) => {
    setInspectionId(data.inspectionId);
    setOfficerId(data.officerId);
    setOfficerName(data.officerName);
    setOffice(data.office);
    setImages(data.images);
    setForm(data.form);
  }, []);

  const setExtractedInfo = useCallback((info: ExtractedInformation) => {
    setExtractedInfoState(info);
  }, []);

  const setApplicabilityResult = useCallback((result: ApplicabilityResult) => {
    setApplicabilityResultState(result);
  }, []);

  const setComplianceResult = useCallback((result: ComplianceResult) => {
    setComplianceResultState(result);
  }, []);

  const addMeasurement = useCallback((m: PhysicalMeasurement) => {
    setMeasurements(prev => [...prev, m]);
  }, []);

  const removeMeasurement = useCallback((id: string) => {
    setMeasurements(prev => prev.filter(meas => meas.id !== id));
  }, []);

  const clearInspection = useCallback(() => {
    setInspectionId('');
    setOfficerId('');
    setOfficerName('');
    setOffice('');
    setImages([]);
    setForm({
      productName: '',
      productCategory: '',
      manufacturer: '',
      retailer: '',
      location: '',
      packageType: '',
      barcode: '',
    });
    setExtractedInfoState(null);
    setApplicabilityResultState(null);
    setComplianceResultState(null);
    setMeasurements([]);
  }, []);

  const value = useMemo<InspectionContextType>(() => ({
    inspectionId,
    officerId,
    officerName,
    office,
    images,
    form,
    extractedInfo,
    applicabilityResult,
    complianceResult,
    measurements,
    setInspectionData,
    setExtractedInfo,
    setApplicabilityResult,
    setComplianceResult,
    addMeasurement,
    removeMeasurement,
    clearInspection,
  }), [inspectionId, officerId, officerName, office, images, form, extractedInfo, applicabilityResult, complianceResult, measurements, setInspectionData, setExtractedInfo, setApplicabilityResult, setComplianceResult, addMeasurement, removeMeasurement, clearInspection]);

  return React.createElement(InspectionContext.Provider, { value }, children);
};

export const useInspectionStore = (): InspectionContextType => {
  const context = useContext(InspectionContext);
  if (!context) {
    throw new Error('useInspectionStore must be used within an InspectionProvider');
  }
  return context;
};

export default InspectionContext;
