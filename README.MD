# ⚖️ Legal Metrology Compliance System

### AI-Powered Packaged Commodity Compliance & Inspection Platform

> An intelligent software system that analyzes packaged commodity images, extracts mandatory declarations, determines applicable Legal Metrology requirements, identifies potential non-compliance, and assists enforcement officers in generating digital inspection reports.

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Real-Life Example](#-real-life-example)
- [Key Features](#-key-features)
- [System Workflow](#-system-workflow)
- [System Architecture](#-system-architecture)
- [User Roles](#-user-roles)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [AI Pipeline](#-ai-pipeline)
- [Legal Rule Engine](#-legal-rule-engine)
- [Compliance Result](#-compliance-result)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Project](#-running-the-project)
- [API Overview](#-api-overview)
- [Database](#-database)
- [Security](#-security)
- [Testing](#-testing)
- [Future Scope](#-future-scope)
- [Limitations](#-limitations)
- [Project Impact](#-project-impact)
- [Contributing](#-contributing)
- [License](#-license)

---

# 📖 About the Project

Packaged commodities sold in India are required to carry various mandatory declarations under the **Legal Metrology Act, 2009** and the **Legal Metrology (Packaged Commodities) Rules, 2011**, subject to applicability and prescribed exceptions.

Examples of important package information include:

- Product identity
- Net quantity
- Maximum Retail Price (MRP)
- Manufacturer / Packer / Importer details
- Address
- Date-related declarations
- Consumer care information
- Other declarations prescribed by applicable provisions

Currently, checking these declarations across a large number of products can require significant manual effort.

Our system aims to assist this process using:

- Computer Vision
- OCR
- Rule-based validation
- Product classification
- Evidence management
- Digital inspection workflows

---

# ❗ Problem Statement

### Smart India Hackathon Problem Statement

> Develop a software application capable of scanning packaged commodity labels, product images and product information to automatically assess compliance with the Legal Metrology (Packaged Commodities) Rules, 2011.

The system should help identify potential issues such as:

- Missing declarations
- Incorrect or incomplete information
- Potential MRP-related issues
- Readability problems
- Font-size related concerns
- Improper placement
- Other applicable declaration requirements

The final legal decision remains with the authorized enforcement process/officer.

---

# 💡 Our Solution

We propose an **AI-assisted Legal Metrology Compliance and Inspection Platform**.

The platform follows:

```text
📦 Product
     ↓
📷 Capture / Upload Package Images
     ↓
🤖 Image Processing
     ↓
📝 OCR
     ↓
🔍 Declaration Extraction
     ↓
📦 Product Classification
     ↓
⚖️ Applicability & Exemption Check
     ↓
📜 Legal Rule Engine
     ↓
🔎 Compliance Validation
     ↓
🟢 PASS / 🟡 REVIEW / 🔴 POTENTIAL ISSUE
     ↓
📷 Evidence
     ↓
👮 Officer Verification
     ↓
📄 Digital Inspection Report