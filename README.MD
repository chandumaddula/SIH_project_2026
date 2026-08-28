# ⚖️ Legal Metrology Compliance System

### AI-Assisted Packaged Commodity Compliance & Digital Inspection Platform

> A unified mobile and web platform that helps citizens and Legal Metrology officers scan packaged commodities, extract package declarations using AI/OCR, evaluate applicable compliance requirements using a rule engine, collect evidence, manage inspections and complaints, and generate digital reports.

---

## 🇮🇳 Smart India Hackathon

### Problem Statement

Software System to check compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by scanning products, images and labels.

---

# 📌 1. Project Overview

Packaged commodities are widely sold through retail stores, supermarkets and e-commerce platforms across India.

Under the Legal Metrology framework, applicable packaged commodities are required to carry prescribed declarations such as:

- Product/commodity information
- Net quantity
- Maximum Retail Price (MRP)
- Manufacturer/Packer/Importer details
- Address
- Date-related declarations
- Consumer care information
- Other applicable declarations

Manual inspection of a large number of products can be time-consuming and resource-intensive.

Our solution provides an AI-assisted digital platform that helps automate the initial screening and organization of package compliance checks.

The system combines:

- 📷 Computer Vision
- 📝 OCR
- 🤖 AI-assisted information extraction
- ⚖️ Rule-based compliance validation
- 📱 Mobile inspection application
- 🖥 Government dashboard
- 📄 Digital reporting
- 🗄 Inspection history
- 📝 Citizen complaints

---

# ❗️ 2. Problem

## Existing Challenge

An enforcement officer may need to manually inspect a package and verify multiple declarations.

For example:

```text
📦 Product
   ↓
Read label manually
   ↓
Find MRP
   ↓
Find net quantity
   ↓
Find manufacturer
   ↓
Find date
   ↓
Check applicable requirements
   ↓
Record findings
   ↓
Take evidence
   ↓
Prepare report

AI-Assisted Legal Metrology Compliance & Inspection Platform


📷 Package Image
       ↓
🤖 AI / OCR
       ↓
📝 Declaration Extraction
       ↓
📦 Product Classification
       ↓
⚖️ Applicability Engine
       ↓
📜 Legal Rule Engine
       ↓
🔍 Compliance Validation
       ↓
🟢 PASS / 🟡 REVIEW / 🔴 POTENTIAL ISSUE
       ↓
📷 Evidence
       ↓
👮 Officer Verification
       ↓
📄 Digital Report


4. Main Objective

The objective is to assist enforcement personnel and citizens by providing a digital system capable of:

Scanning package images
Extracting declarations
Identifying potentially missing declarations
Checking applicable requirements
Performing rule-based validation
Assisting readability/font analysis
Collecting evidence
Maintaining inspection history
Managing complaints
Generating digital reports
Providing a centralized government dashboard


Mobile + Web Architecture
The project contains two frontend applications.


PLATFORM
                       │
          ┌────────────┴────────────┐
          │                         │
       📱 MOBILE                 🖥 WEB
          │                         │
   React Native + TS          React + TypeScript
          │                         │
   ┌──────┴──────┐                  │
   │             │                  │
👤 Citizen    👮 Officer            │
   │             │                  │
   └──────┬──────┘                  │
          │                         │
          └──────────┬──────────────┘
                     ↓
                🔗 REST API
                     ↓
                 ⚙️ FastAPI
                     │
       ┌─────────────┼─────────────┐
       ↓             ↓             ↓
    🤖 AI        ⚖️ RULES       🗄 DB
    ENGINE        ENGINE       PostgreSQL
       │             │             │
       └─────────────┼─────────────┘
                     ↓
              Compliance Result



6. User Roles
👤 Citizen

Citizens can:

Scan a product
View extracted package information
View preliminary compliance information
Understand potential issues
Submit complaints
Track complaints


Citizen Workflow

📷 Scan Product
      ↓
🤖 AI Analysis
      ↓
🔍 Compliance Screening
      ↓
🟢 / 🟡 / 🔴 Result
      ↓
📝 Submit Complaint
      ↓
👮 Officer Review


Legal Metrology Officer

Officers can:

Login securely
Capture package images
Create inspections
Review AI/OCR results
Check applicable requirements
Review potential violations
Capture evidence
Enter physical measurements
Add observations
Verify findings
Generate reports
View inspection history


Officer Workflow

👮 Officer Login
      ↓
📷 Scan Package
      ↓
🤖 AI Analysis
      ↓
⚖️ Rule Validation
      ↓
🔍 Findings
      ↓
📷 Evidence
      ↓
👮 Verification
      ↓
📄 Inspection Report


Administrator

Administrators can:

Manage users
Manage officers
Monitor inspections
View complaints
View potential violations
View products
Monitor analytics
Manage rule versions
Monitor system activity

7. Package Scanning

The package itself is the primary source for compliance analysis.

The application supports:

Front package image
Back package image
Side package image
Label image
Additional evidence images

QR / Barcode
QR/barcode scanning is an optional supporting feature.
It can help with:
Product identification
Quick product lookup
Linking to an existing product record
However:
The system does not depend on QR codes for compliance checking.
The main workflow is:
📦 Package
    ↓
📷 Image
    ↓
🤖 OCR + Computer Vision
    ↓
Compliance Analysis


8. AI / OCR Pipeline

The AI pipeline converts package images into structured information.
                 📷 IMAGE
                    ↓
            Image Quality Check
                    ↓
             Preprocessing
                    ↓
          Perspective Correction
                    ↓
          Text Region Detection
                    ↓
                   📝 OCR
                    ↓
          Text Normalization
                    ↓
        Declaration Extraction
                    ↓
          Structured Product Data
                    ↓
              ⚖️ Rule Engine

9. Declaration Extraction

The system attempts to identify information such as:
Product Name
MRP
Net Quantity
Manufacturer
Packer
Importer
Address
Date
Consumer Care Details
Other Visible Declarations

Example:
{
  "product_name": "ABC Biscuits",
  "mrp": "₹50",
  "net_quantity": "500 g",
  "manufacturer": "ABC Foods Pvt Ltd",
  "date": "06/2026",
  "consumer_care": "1800-XXXX-XXXX"
}


10. Applicability Engine
This is a critical component of the system.
The platform should not blindly apply every rule to every product.
Instead:
Product Information
        ↓
Product / Package Category
        ↓
Applicable Conditions
        ↓
Exceptions / Exemptions
        ↓
Applicable Requirements
The applicability engine determines which configured requirements need to be evaluated for the particular product/package scenario.




11. Legal Rule Engine
The legal rules are maintained separately from the AI system.
This makes the system easier to maintain and update.
AI answers:
"What information can be extracted from the package?"
Applicability Engine answers:
"Which requirements apply?"
Rule Engine answers:
"What does the applicable requirement require?"
Compliance Engine answers:
"Does the extracted information satisfy the configured requirement?"
Officer answers:
"Is the finding verified?"
🔍 12. Compliance Engine
The compliance engine receives:
Extracted Data
      +
Applicable Requirements
      ↓
Compliance Validators
      ↓
Findings
The system can produce:
🟢 PASS
No potential issue was identified by the configured checks.
🟡 REVIEW
The system could not confidently determine compliance and requires human verification.
🔴 POTENTIAL ISSUE
The configured checks identified a potential non-compliance that should be reviewed.
📏 13. Font & Readability Analysis
Computer Vision can assist in analyzing:
Text visibility
Text regions
Contrast
Approximate character size
Readability
Placement-related characteristics
However, a normal photograph may not provide reliable physical scale.
Therefore:
Reliable Measurement
       ↓
Automated Check

Uncertain Measurement
       ↓
🟡 REVIEW REQUIRED
       ↓
👮 Officer Verification
The system should not automatically declare a legal violation solely from an uncertain image measurement.
📷 14. Evidence Management
For every inspection, the officer can attach:
Package photographs
Label photographs
Additional evidence
Measurement information
Officer observations
Example:
Inspection
   │
   ├── 📷 Front Image
   ├── 📷 Back Image
   ├── 📷 Label Image
   ├── 📏 Measurement
   ├── 📝 Observation
   └── 🔍 Compliance Finding
👮 15. Human-in-the-Loop Verification
The system is designed as an AI-assisted inspection system, not an autonomous enforcement system.
                 🤖 AI
                  ↓
          Potential Finding
                  ↓
              📷 Evidence
                  ↓
             👮 Officer
                  ↓
        ┌─────────┴─────────┐
        ↓                   ↓
     Confirm              Reject
        │                   │
        └─────────┬─────────┘
                  ↓
          Final Inspection
                  ↓
             📄 Report
📄 16. Digital Reports
The system can generate inspection/compliance reports containing:
Inspection ID
Product details
Date/time
Location
Package images
Extracted declarations
Applicable requirements
Findings
Evidence
Measurements
Officer observations
Verification status
Reports can be exported as:
PDF
Editable format
🖥 17. Government Dashboard
The dashboard provides centralized monitoring.
              🖥 DASHBOARD
                    │
       ┌────────────┼────────────┐
       ↓            ↓            ↓
   📋 Inspections 📦 Products  ⚠️ Issues
       │            │            │
       ├────────────┼────────────┤
       ↓            ↓            ↓
   📝 Complaints 👮 Officers   📄 Reports
                    │
                    ↓
                 📊 Analytics



📊 18. Dashboard Example

┌──────────────────────────────────────────────┐
│       LEGAL METROLOGY DASHBOARD              │
├──────────────────────────────────────────────┤
│                                              │
│  INSPECTIONS     POTENTIAL ISSUES            │
│      245               38                    │
│                                              │
│  COMPLAINTS      PRODUCTS SCANNED            │
│       21               520                   │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  COMPLIANCE STATUS                            │
│                                              │
│  🟢 PASS                 207                 │
│  🟡 REVIEW                25                 │
│  🔴 POTENTIAL ISSUE       13                 │
│                                              │
├──────────────────────────────────────────────┤
│              RECENT INSPECTIONS              │
│                                              │
│  ABC Foods       🟢 PASS                     │
│  XYZ Soap        🟡 REVIEW                   │
│  PQR Oil         🔴 POTENTIAL ISSUE          │
│                                              │
└──────────────────────────────────────────────┘


🏗 19. System Architecture
                         USERS
                           │
             ┌─────────────┴─────────────┐
             │                           │
          📱 MOBILE                   🖥 WEB
             │                           │
     React Native + TS             React + TS
             │                           │
             └─────────────┬─────────────┘
                           │
                       REST API
                           │
                           ↓
                    ⚙️ FASTAPI BACKEND
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
       ↓                   ↓                   ↓
  🤖 AI SERVICE       ⚖️ RULE ENGINE      🗄 PostgreSQL
       │                   │                   │
       │                   │                   │
       ↓                   ↓                   ↓
   OpenCV             Applicability       Users
   PaddleOCR          Validators          Products
   Extraction         Exemptions          Inspections
   Detection          Rule Versions       Complaints
                                           Evidence
                                           Reports
       │                   │
       └──────────┬────────┘
                  ↓
           Compliance Result
                  │
                  ↓
            👮 Verification
                  │
                  ↓
             📄 Report



🛠 20. Technology Stack
Layer
Technology
📱 Mobile
React Native
📝 Mobile Language
TypeScript
🖥 Web
React.js
📝 Web Language
TypeScript
🎨 Web UI
Tailwind CSS
⚙️ Backend
FastAPI
🐍 Backend Language
Python
🤖 OCR
PaddleOCR
👁 Computer Vision
OpenCV
⚖️ Rule Engine
Python
🗄 Database
PostgreSQL
🔐 Authentication
JWT
🔗 API
REST
📄 Reports
HTML/PDF
🐳 Deployment
Docker


📁 21. Project Structure

legal-metrology-compliance/
│
├── 📱 mobile/
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   │   ├── auth/
│   │   │   ├── citizen/
│   │   │   ├── officer/
│   │   │   ├── scanner/
│   │   │   └── reports/
│   │   ├── navigation/
│   │   ├── services/
│   │   ├── store/
│   │   ├── utils/
│   │   └── theme/
│   │
│   ├── assets/
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
│
├── 🖥 dashboard/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
├── 🔗 shared/
│   ├── types/
│   │   ├── user.ts
│   │   ├── product.ts
│   │   ├── scan.ts
│   │   ├── compliance.ts
│   │   ├── inspection.ts
│   │   ├── complaint.ts
│   │   └── report.ts
│   │
│   ├── constants/
│   │   ├── roles.ts
│   │   ├── statuses.ts
│   │   └── endpoints.ts
│   │
│   └── index.ts
│
├── ⚙️ backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── database/
│   │   └── core/
│   │
│   ├── tests/
│   └── requirements.txt
│
├── 🤖 ai/
│   ├── preprocessing/
│   ├── ocr/
│   ├── extraction/
│   ├── detection/
│   └── inference.py
│
├── ⚖️ rule_engine/
│   ├── rules/
│   ├── applicability/
│   ├── validators/
│   └── compliance_engine.py
│
├── 🗄 database/
│   ├── migrations/
│   ├── seed/
│   └── schema.sql
│
├── 📄 reports/
│   ├── templates/
│   └── generator/
│
├── 🧪 tests/
│   ├── integration/
│   ├── api/
│   ├── ai/
│   └── rule_engine/
│
├── 📚 docs/
│   ├── architecture/
│   ├── api/
│   └── legal/
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── README.md
└── LICENSE


🗄 22. Database Design
Main entities:
                    USERS
                      │
          ┌───────────┴───────────┐
          ↓                       ↓
      INSPECTIONS            COMPLAINTS
          │
    ┌─────┼─────────────┐
    ↓     ↓             ↓
PRODUCT IMAGES      EVIDENCE
    │
    ↓
OCR RESULTS
    │
    ↓
COMPLIANCE CHECKS
    │
    ↓
VIOLATIONS / FINDINGS
    │
    ↓
OFFICER VERIFICATION
    │
    ↓
REPORT
Main tables
users
products
inspections
package_images
extracted_declarations
rules
rule_conditions
compliance_checks
violations
evidence
physical_measurements
officer_verifications
complaints
reports
audit_logs


🔗 23. API Structure
Authentication
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
Scanning
POST /api/scans
GET  /api/scans/{scan_id}
Products
POST /api/products
GET  /api/products
GET  /api/products/{product_id}
Compliance
POST /api/compliance/check
GET  /api/compliance/{inspection_id}
Inspections
POST /api/inspections
GET  /api/inspections
GET  /api/inspections/{inspection_id}
PUT  /api/inspections/{inspection_id}
Complaints
POST /api/complaints
GET  /api/complaints
GET  /api/complaints/{complaint_id}
Reports
POST /api/reports
GET  /api/reports/{report_id}


🔐 24. Authentication & Security
The platform uses role-based access.
                 🔐 AUTHENTICATION
                        │
          ┌─────────────┼─────────────┐
          ↓             ↓             ↓
       👤 CITIZEN    👮 OFFICER    🏛 ADMIN
Security mechanisms include:
JWT authentication
Password hashing
Role-based authorization
Secure token storage
HTTPS
API validation
Audit logging
Controlled evidence access


🚀 25. Installation
Clone Repository
git clone <repository-url>

cd legal-metrology-compliance
📱 Mobile
cd mobile

npm install

npx expo start
🖥 Dashboard
cd dashboard

npm install

npm run dev
⚙️ Backend
cd backend

python -m venv venv
Windows
venv\Scripts\activate
Linux / macOS
source venv/bin/activate
Install dependencies:
pip install -r requirements.txt
Run FastAPI:
uvicorn app.main:app --reload


🔐 26. Environment Variables
Create a .env file in the backend.
Example:
DATABASE_URL=postgresql://username:password@localhost:5432/legal_metrology

JWT_SECRET=your_secret_key

AI_SERVICE_URL=http://localhost:8001

STORAGE_URL=your_storage_url
Do not commit .env.
Use:
.env.example


for configuration documentation.


🎯 27. MVP
The first working prototype should focus on the following flow:
             📱 MOBILE
                 │
                 ↓
          📷 Capture Package
                 │
                 ↓
              📤 Upload
                 │
                 ↓
             ⚙️ FASTAPI
                 │
                 ↓
              🤖 OCR
                 │
                 ↓
        📝 Extract Information
                 │
                 ↓
         ⚖️ Applicability Check
                 │
                 ↓
            📜 Rule Engine
                 │
                 ↓
          🔍 Compliance Check
                 │
          ┌──────┼──────┐
          ↓      ↓      ↓
         🟢     🟡     🔴
        PASS   REVIEW  ISSUE
                        │
                        ↓
                    📷 Evidence
                        │
                        ↓
                   👮 Officer
                   Verification
                        │
                        ↓
                    📄 Report
                        │
                        ↓
                 🖥 Dashboard


🏆 28. SIH Demonstration Scenario
Scenario 1 — Compliant Package
📷 Scan
  ↓
🤖 OCR
  ↓
📝 Extract declarations
  ↓
⚖️ Determine applicable requirements
  ↓
📜 Validate
  ↓
🟢 PASS
  ↓
📄 Generate Report
Scenario 2 — Potential Issue
📷 Scan
  ↓
🤖 OCR
  ↓
📝 Extract declarations
  ↓
⚖️ Determine applicable requirements
  ↓
📜 Validate
  ↓
🔴 POTENTIAL ISSUE
  ↓
📷 Evidence
  ↓
👮 Officer Review
  ↓
✅ Confirm / ❌ Reject
  ↓
📄 Final Report
Scenario 3 — Citizen Complaint
👤 Citizen
    ↓
📷 Scan
    ↓
🤖 AI Analysis
    ↓
🟡 / 🔴 Potential Issue
    ↓
📝 Submit Complaint
    ↓
👮 Officer
    ↓
📋 Inspection
    ↓
📷 Evidence
    ↓
⚖️ Verification
    ↓
📄 Report


📈 29. Impact
👮 Enforcement Officers
The platform can help:
Reduce repetitive manual data entry
Speed up initial screening
Organize evidence
Standardize inspection records
Search previous inspections
Generate reports faster
👤 Citizens
The platform can help citizens:
Understand package information
Identify potential issues
Submit structured complaints
Track complaint status
🏛 Government
The platform can provide:
Centralized inspection records
Compliance analytics
Complaint monitoring
Product history
Potential violation trends
Better inspection planning


🌍 30. Scalability
The architecture can scale from a hackathon prototype to larger deployments.
                 MVP
                  ↓
             Pilot District
                  ↓
             State Level
                  ↓
            Multi-State
                  ↓
           National Scale
Possible future capabilities:
Multilingual OCR
Offline inspection
GIS-based inspection planning
Advanced computer vision
Large product repository
Analytics
Integration with government systems
E-commerce listing analysis
Automated rule-version management


⚠️ 31. Limitations
AI-based package analysis can be affected by:
Blurry images
Poor lighting
Reflections
Curved packages
Small text
Decorative fonts
Occluded labels
Multiple languages
Incomplete package views
Therefore the system uses:
🟢 PASS
🟡 REVIEW REQUIRED
🔴 POTENTIAL ISSUE
instead of treating every AI output as a final legal decision.


🧠 32. Key Design Principle
The most important architecture decision is the separation between AI and legal rules.

                    📦 PACKAGE
                         │
                         ↓
                       🤖 AI
                "What can we see?"
                         │
                         ↓
                  📝 EXTRACTED DATA
                         │
                         ↓
                ⚖️ APPLICABILITY
              "Which requirements apply?"
                         │
                         ↓
                    📜 RULE ENGINE
                  "What is required?"
                         │
                         ↓
                  🔍 COMPLIANCE
             "Does it satisfy them?"
                         │
                         ↓
                     📷 EVIDENCE
                         │
                         ↓
                    👮 OFFICER
                 "Verify finding"
                         │
                         ↓
                      📄 REPORT
This makes the system:
Explainable
Maintainable
Testable
Easier to update
Suitable for human verification


🛣 33. Development Roadmap
Phase 1 — Foundation
Repository setup
React Native application
React dashboard
FastAPI backend
PostgreSQL
Authentication
Phase 2 — Scanner
Camera
Image upload
Image review
QR/barcode support
Image storage
Phase 3 — AI
Image preprocessing
OCR
Text extraction
Declaration extraction
Confidence scoring
Phase 4 — Compliance
Rule database
Applicability engine
Exemption handling
Declaration validation
Readability analysis
Compliance results
Phase 5 — Inspection
Evidence management
Officer verification
Physical measurements
Inspection history
Phase 6 — Dashboard
Dashboard
Inspections
Products
Potential violations
Complaints
Officers
Analytics
Phase 7 — Reporting
PDF generation
Editable reports
Evidence attachment
Report history


📚 34. References
The implementation should use the latest applicable official Legal Metrology materials, including:
Legal Metrology Act, 2009
Legal Metrology (Packaged Commodities) Rules, 2011
Applicable amendments and notifications
Official Department of Consumer Affairs / Legal Metrology resources
Official reference:
https://consumeraffairs.gov.in/pages/legal-metrology-act
Legal requirements should be mapped into the application's rule database only after reviewing the applicable official provisions, amendments, exemptions and notifications.


⚖️ 35. Disclaimer
This project is intended to assist compliance screening and inspection workflows.
Automated results should not by themselves be treated as final legal determinations or enforcement orders.
The final decision should remain with the authorized enforcement process/officer.
The production version must use the latest applicable legal provisions, amendments, notifications, exemptions and official guidance.


🇮🇳 36. Project Vision
"From Manual Package Inspection to Intelligent, Evidence-Based Digital Compliance."
                    📦
                  PACKAGE
                     │
                     ↓
                 📷 SCAN
                     │
                     ↓
                  🤖 AI
                     │
                     ↓
              📝 EXTRACTION
                     │
                     ↓
             ⚖️ APPLICABILITY
                     │
                     ↓
                📜 RULES
                     │
                     ↓
             🔍 COMPLIANCE
                     │
              ┌──────┼──────┐
              ↓      ↓      ↓
             🟢     🟡     🔴
            PASS   REVIEW  ISSUE
                              │
                              ↓
                         📷 EVIDENCE
                              │
                              ↓
                           👮 OFFICER
                              │
                              ↓
                           📄 REPORT
                              │
                              ↓
                       🏛 GOVERNMENT




