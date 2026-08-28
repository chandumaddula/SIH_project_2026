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




