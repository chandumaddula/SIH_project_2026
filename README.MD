# Legal Metrology Compliance System

## AI-Powered Packaged Commodity Compliance Checking System

An intelligent software system for automatically scanning packaged commodity labels, extracting mandatory declarations, checking compliance with the Legal Metrology (Packaged Commodities) Rules, 2011, and assisting Legal Metrology enforcement officials in identifying potential non-compliances.

The system combines:

- Computer Vision
- OCR
- AI-based declaration detection
- Product classification
- Rule-based legal validation
- Legal knowledge management
- Evidence management
- Human-in-the-loop verification
- Digital inspection reports
- Government compliance dashboards

---

# 1. Problem Statement

Packaged commodities sold through retail stores, supermarkets, and e-commerce platforms are required to display various mandatory declarations under the Legal Metrology framework.

These declarations may include information such as:

- Name and address of manufacturer/packer/importer
- Net quantity
- Maximum Retail Price (MRP)
- Date/month and year information, where applicable
- Consumer care information
- Country of origin, where applicable
- Unit sale price, where applicable
- Other declarations prescribed under applicable provisions

Manual inspection of a large number of products is:

- Time-consuming
- Labour-intensive
- Difficult to scale
- Prone to inconsistent interpretation
- Difficult to maintain as a searchable digital record

The proposed system assists enforcement personnel by automatically analyzing package images and identifying potential compliance issues.

---

# 2. Proposed Solution

The system provides an AI-assisted inspection platform through which an officer can capture or upload product package images.

The system then:

1. Processes the package image.
2. Detects relevant declaration regions.
3. Extracts text using OCR.
4. Identifies structured information such as MRP, quantity, dates, manufacturer details, etc.
5. Determines the product/package context.
6. Identifies the applicable legal requirements.
7. Validates the extracted information against the configured legal rules.
8. Generates potential compliance findings.
9. Links each finding to visual evidence.
10. Allows an authorized officer to verify the finding.
11. Generates a digital compliance/inspection report.
12. Stores the inspection and compliance history.

---

# 3. Core Design Principle

## AI does not decide the law.

The system separates AI-based visual understanding from legal decision logic.

### AI answers:

> "What information is visible on the package?"

### Rule Engine answers:

> "What requirements are applicable to this package?"

### Compliance Engine answers:

> "Does the detected information satisfy the applicable requirements?"

### Officer answers:

> "Should this finding be confirmed for enforcement?"

Therefore, the system follows:

Image
↓
AI/OCR
↓
Extracted Facts
↓
Applicability Engine
↓
Legal Rules
↓
Validation
↓
Potential Finding
↓
Officer Verification
↓
Confirmed Finding / Rejected Finding
↓
Digital Report

This architecture improves explainability, maintainability, and auditability.

---

# 4. System Architecture

```text
                        ┌──────────────────────┐
                        │  LEGAL SOURCES       │
                        │  Act / Rules /        │
                        │  Amendments /        │
                        │  Notifications       │
                        └──────────┬───────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │ LEGAL KNOWLEDGE BASE │
                        └──────────┬───────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │ APPLICABILITY ENGINE │
                        └──────────┬───────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │     RULE ENGINE      │
                        └──────────┬───────────┘
                                   │
                                   │
┌──────────────┐                   │
│ Product      │                   │
│ Package      │                   │
│ Image        │                   │
└──────┬───────┘                   │
       │                           │
       ▼                           │
┌──────────────────────┐           │
│ AI PROCESSING        │           │
│                      │           │
│ • Detection          │           │
│ • OCR                │           │
│ • Classification     │           │
│ • Extraction         │           │
│ • Visual Validation  │           │
└──────────┬───────────┘           │
           │                       │
           ▼                       │
   ┌──────────────────┐            │
   │ EXTRACTED FACTS  │────────────┘
   └────────┬─────────┘
            │
            ▼
   ┌─────────────────────┐
   │ COMPLIANCE ENGINE   │
   └──────────┬──────────┘
              │
              ▼
      ┌───────────────┐
      │ FINDINGS      │
      └───────┬───────┘
              │
              ▼
      ┌──────────────────┐
      │ OFFICER REVIEW   │
      └────────┬─────────┘
               │
          ┌────┴─────┐
          ▼          ▼
      Confirm      Reject
          │
          ▼
      Violation
          │
          ▼
       Report
          │
          ▼
      Dashboard