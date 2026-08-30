# Legal Metrology Compliance System

**AI-Assisted Packaged Commodity Compliance & Digital Inspection
Platform**

Frontend-first Legal Metrology platform with three distinct role
experiences:

-   **Employee / Legal Metrology Officer** --- field inspection and
    compliance
-   **Citizen / User** --- consumer package screening, complaints and
    tracking
-   **Admin** --- system-wide monitoring, management, analytics and
    audit

> **Current scope:** Frontend only. React + TypeScript + Vite with mock
> data/services. Backend, database, production authentication, real
> OCR/AI and deployment are future integration work.

## 1. Technology Stack

-   React
-   TypeScript
-   Vite
-   React Router
-   Recharts
-   Leaflet / OpenStreetMap
-   Browser camera and file-upload APIs
-   Mock services and mock data

The service layer is structured so mock implementations can later be
replaced with real API calls.

## 2. Role Architecture

  -----------------------------------------------------------------------
  Role                                Primary purpose
  ----------------------------------- -----------------------------------
  Employee                            Field inspection, scanning,
                                      evidence, compliance and officer
                                      verification

  Citizen                             Package understanding, preliminary
                                      screening, complaints and tracking

  Admin                               System monitoring, analytics,
                                      users, rules, reports, geography
                                      and audit
  -----------------------------------------------------------------------

The three dashboards are intentionally different:

``` text
Employee → Field Operations
Citizen  → Consumer Service
Admin    → System Management
```

# 3. Employee Dashboard

## Purpose

The Employee represents a Legal Metrology enforcement officer.

Main workflow:

``` text
Login
→ Dashboard
→ New Inspection
→ Capture / Upload Package
→ Image Analysis
→ Extract Declarations
→ Applicability
→ Compliance Checks
→ Potential Issue / Review
→ Evidence
→ Officer Verification
→ Final Inspection
→ Report
```

## Navigation

Home, New Inspection / Scan, Compliance, Inspection Map, Complaints,
Inspections, Products, History, Reports, Notifications, Profile, About,
Settings, Sign Out.

## Employee Task A --- Shell + Home

-   Dedicated `/employee/*` shell
-   Government-style navy header and white sidebar
-   Professional SVG icons
-   Active route highlighting
-   Desktop persistent sidebar
-   Tablet collapsed sidebar
-   Mobile off-canvas navigation
-   Sign-out confirmation
-   Employee-only route protection
-   Employee name, department, office and ID
-   Dynamic page title

Home includes:

-   Greeting
-   Officer name and office/region
-   New Inspection CTA
-   Total Inspections
-   Products Scanned
-   Pending Reviews
-   Open Complaints
-   Potential Issues
-   Completed Reports
-   Compliance chart
-   Recent Inspections
-   Recent Citizen Complaints
-   Action Required
-   Government / Department Updates

## Employee Tasks B--J --- Inspection & Compliance

The inspection workflow supports:

``` text
Image
→ Image Quality
→ Preprocessing
→ Perspective Correction
→ Text Detection
→ OCR
→ Text Normalization
→ Declaration Extraction
→ Product Classification
→ Applicability
→ Rule Engine
→ Compliance Check
→ Evidence
→ Officer Verification
```

Features include:

-   Camera capture and image upload
-   Multiple package images
-   Front / Back / Side / Label
-   Image quality, lighting and blur indicators
-   Retake / Continue
-   Save Draft
-   Extracted declarations
-   Confidence scores
-   Applicable requirements
-   Compliance checklist
-   Rule trace / explanation
-   Evidence management
-   Font/readability analysis
-   Physical measurement entry
-   Officer verification
-   Inspection finalization

Employee result terminology:

-   **PASS**
-   **REVIEW REQUIRED**
-   **POTENTIAL ISSUE**

AI must never be presented as the final legal decision. Final
verification remains with the authorized officer.

## Employee Task K --- Inspections, Map & History

### Inspections

-   Inspection list
-   Summary cards
-   Search
-   Date/status/compliance/verification filters
-   Sorting
-   Responsive table/cards
-   View / Continue / Report

### Inspection Details

-   Workflow summary
-   Compliance summary
-   Evidence summary
-   Verification summary
-   Inspection information
-   Actions

### Inspection Map

-   Leaflet / OpenStreetMap
-   Priority/status markers
-   Filters
-   Location list
-   Details panel
-   Inspection and complaint information

### History

-   Date presets/custom range
-   Search
-   Status/compliance filters
-   Sorting
-   Responsive table/cards

## Employee Task L --- Complaints & Notifications

Complaint management:

-   All / New
-   Assigned
-   Under Inspection
-   Resolved
-   Closed

Complaint information:

-   Complaint ID
-   Product
-   Issue
-   Location
-   Citizen submission date
-   Evidence
-   Priority
-   Status

Actions:

-   View
-   Assign
-   Create Inspection
-   Update Status

Notifications include:

-   High-priority complaints
-   Verification requests
-   Pending reports
-   Department updates
-   Follow-up inspections

## Employee Task M --- Products & Reports

### Products

-   Product repository
-   Search
-   Manufacturer
-   Category
-   Barcode
-   Inspection ID
-   Inspection count
-   Compliance history
-   Potential issues
-   Last inspection

### Reports

-   Report list
-   Generate
-   View
-   Preview
-   Print/save as PDF
-   Product details
-   Inspection details
-   Package images
-   Declarations
-   Requirements
-   Findings
-   Evidence
-   Measurements
-   Officer observations
-   Verification status

## Employee Task N --- Profile, About & Settings

Profile:

-   Officer Name
-   Employee ID
-   Designation
-   Department
-   Office
-   Region
-   Email
-   Phone

About covers:

-   Legal Metrology
-   Platform
-   Scanning
-   OCR
-   Compliance evaluation
-   AI limitations
-   Officer verification
-   Citizen complaints

Settings:

-   Notifications
-   Language
-   Security
-   Password
-   Camera preferences
-   Offline mode
-   Privacy
-   Data settings
-   App version

## Employee Task O --- Final Integration / QA

Verify:

-   All routes
-   Navigation
-   Responsive desktop/tablet/mobile layouts
-   Loading/empty/error states
-   Accessibility
-   Employee role protection
-   Complete SIH inspection flow
-   TypeScript
-   Production build

------------------------------------------------------------------------

# 4. Citizen Dashboard

## Purpose

Citizen is a consumer, NOT an enforcement officer.

Workflow:

``` text
SCAN
→ UNDERSTAND PACKAGE
→ PRELIMINARY SCREENING
→ POTENTIAL ISSUE
→ SUBMIT COMPLAINT
→ TRACK COMPLAINT
```

Citizen results:

-   🟢 **No Potential Issue Detected**
-   🟡 **Review Recommended**
-   🔴 **Potential Issue Detected**

Never present an automated result as a final legal determination.

## Navigation

Home, Scan Product, My Scans, My Complaints, Notifications, Learn,
Nearby / Help, Profile, About, Settings, Sign Out.

## Citizen Task A --- Shell + Home + Role Routing

-   Dedicated `/citizen/*` shell
-   Consumer-friendly government-service design
-   Desktop sidebar
-   Mobile bottom navigation + menu
-   Citizen-specific branding
-   Strict role protection

Home includes:

-   Welcome message
-   Citizen name
-   Scan Product CTA
-   My Complaints
-   My Scans
-   Recent Scans
-   Complaint Status
-   Helpful Information

No employee analytics.

## Citizen Task B --- Scan + Package Information + Screening

Scanning supports:

-   Camera
-   Image upload
-   Multiple images
-   Front / Back / Side / Label
-   Optional QR/barcode
-   Image preview
-   Quality/lighting/blur guidance
-   Retake
-   Continue

Mock analysis:

``` text
✓ Image received
✓ Image quality checked
✓ Text detected
✓ Declarations extracted
● Screening package information
```

Detected package information:

-   Product name
-   Generic name
-   MRP
-   Net quantity
-   Manufacturer
-   Packer
-   Importer
-   Address
-   Country of origin where applicable
-   Date information
-   Consumer care
-   Other detected information

Use **Detected information**, not **Verified legal information**.

Preliminary results:

-   No Potential Issue Detected
-   Review Recommended
-   Potential Issue Detected

Show explanation, image, detected information, confidence where useful
and next action.

## Citizen Task C --- Scans + Complaints + Tracking

My Scans:

-   `/citizen/scans`
-   `/citizen/scans/:scanId`

Show only the authenticated citizen's scans.

Filters:

-   All
-   No Potential Issue
-   Review Recommended
-   Potential Issue

Complaint routes:

-   `/citizen/complaints`
-   `/citizen/complaints/new`
-   `/citizen/complaints/:complaintId`

Complaint form:

-   Product
-   Issue
-   Purchase location
-   Purchase date
-   Description
-   Package images
-   Supporting documents
-   Optional bill/evidence

Generate a demo Complaint ID.

Tracking timeline:

``` text
Submitted
→ Received
→ Assigned
→ Inspection
→ Verification
→ Resolved
→ Closed
```

Only display events that exist in mock data.

## Citizen Task D --- Support + Final QA

### Notifications

-   Complaint received
-   Assignment/status updates
-   Evidence requested
-   Complaint resolved
-   Helpful/system notifications

### Learn

Consumer education:

-   What is MRP?
-   What is net quantity?
-   Package declarations
-   Package screening
-   Complaint process
-   What happens after submission?
-   How to capture clear images

Do not invent legal provisions or penalties.

### Nearby / Help

-   Consumer help
-   Legal Metrology information
-   Official government links/contact information

Do not invent government contact details.

### Profile

-   Name
-   Mobile
-   Email
-   Language
-   Scan history
-   Complaint history

### About

-   Platform
-   Package screening
-   Complaint process
-   AI limitations
-   Officer verification
-   Citizen role

### Settings

-   Notifications
-   Language
-   Privacy
-   Security
-   Password
-   App preferences

Final QA covers routes, role protection, responsive design,
accessibility, loading/empty/error states and the complete citizen scan
→ complaint → tracking flow.

------------------------------------------------------------------------

# 5. Admin Dashboard

## Purpose

Admin responsibilities:

``` text
Monitor
Manage
Analyze
Configure
Control
Audit
```

Admin is not primarily a package-scanning user.

Admin is completely different from Employee and Citizen.

## Navigation

Overview, Analytics, Employees, Citizens, Inspections, Complaints,
Products, Rule Management, Geographic Monitoring, Reports,
Announcements, Roles & Permissions, Audit Logs, Notifications, System
Settings, Sign Out.

## Admin Task A --- Shell + Overview + Analytics + Geography

### Shell

-   Protected `/admin/*` routes
-   Government/enterprise styling
-   Data-driven interface
-   Desktop full sidebar
-   Tablet collapsible sidebar
-   Mobile navigation
-   Admin-specific visual identity

### Overview

KPIs:

-   Total Inspections
-   Products Scanned
-   Open Complaints
-   Potential Issues
-   Employees
-   Reports Generated
-   Pending Verification

### Analytics

Charts:

-   Compliance distribution
-   Monthly inspections
-   Complaint trend
-   Potential issue trend
-   Product categories
-   Inspection activity

Filters:

-   Today
-   7 Days
-   30 Days
-   Custom Range

### Geographic Monitoring

Hierarchy:

``` text
India
→ State
→ District
→ Market
→ Retail Location
```

Show:

-   Inspection count
-   Complaint count
-   Potential issues
-   Repeat locations
-   Pending inspections

Location details:

-   Location name
-   Last inspection
-   Inspections
-   Complaints
-   Potential issues
-   Pending inspections

## Admin Task B --- Management + Operations

### Employee Management

Show:

-   Employee
-   Employee ID
-   Department
-   Office
-   Region
-   Inspection count
-   Pending cases
-   Status

Actions:

-   View
-   Assign
-   Deactivate

### Citizen Management

Show only appropriate information:

-   User ID
-   Account status
-   Complaint count
-   Active complaints
-   Registration date

Avoid unnecessary personal information.

### Inspection Management

Show:

-   Inspection ID
-   Product
-   Location
-   Officer
-   Date
-   Status
-   Finding
-   Report

Filters:

-   State
-   District
-   Officer
-   Product
-   Category
-   Date
-   Status

### Complaint Management

Tabs:

-   New
-   Assigned
-   Under Inspection
-   Verification
-   Resolved
-   Closed

Actions:

-   View
-   Assign Officer
-   Change Priority
-   Create Inspection
-   View Evidence
-   Update Status

### Product Repository

Search:

-   Product
-   Manufacturer
-   Category
-   Barcode
-   Inspection ID

Show:

-   Product
-   Manufacturer
-   Category
-   Inspection count
-   Compliance history
-   Potential issues
-   Last inspection

### Rule Management

Fields:

-   Rule ID
-   Requirement
-   Product category
-   Applicability
-   Exception
-   Validation method
-   Official source
-   Version
-   Effective date
-   Status

Actions:

-   Create Draft
-   View
-   Edit
-   Version
-   Activate
-   Deactivate

**Never invent legal rules.**

Use mock/demo rules only and clearly label them as such.

Rule versioning shows:

-   Current version
-   Previous version
-   Effective date
-   Change history

### Reports

Types:

-   State-wise
-   District-wise
-   Product-wise
-   Complaint-wise
-   Inspection-wise
-   Officer activity
-   Potential issue trends

Actions:

-   Generate
-   Preview
-   Export PDF
-   Export editable format

Frontend exports must not pretend a real backend generated the report.

## Admin Task C --- Control + Audit + Final QA

### Announcements

Types:

-   Department announcement
-   System announcement
-   Inspection campaign
-   Training update
-   Legal update

Fields:

-   Title
-   Category
-   Description
-   Publish date
-   Expiry
-   Status

### Roles & Permissions

Roles:

-   Admin
-   Employee
-   Citizen

Permissions:

-   Scan
-   Inspection
-   Complaint
-   Evidence
-   Rules
-   Reports
-   Analytics
-   Users
-   Settings

Frontend permission controls are demo UI only and do not replace backend
security.

### Audit Logs

Fields:

-   User
-   Role
-   Action
-   Entity
-   Entity ID
-   Date
-   Time
-   IP/device where appropriate
-   Result

Actions:

-   Search
-   Filter
-   Export

### Notifications

-   High-priority complaints
-   Pending inspections
-   Rule updates
-   System errors
-   Reports
-   Announcements

### System Settings

-   Authentication
-   Notifications
-   Report configuration
-   Storage
-   System configuration
-   Data retention
-   API status
-   AI/OCR service status

Never expose secrets or credentials.

### System Health

Show:

-   Backend status
-   Database status
-   AI/OCR status
-   Storage status
-   API status

Use clearly labelled mock/demo status in frontend mode.

### Final Admin QA

Verify:

-   Admin login and routing
-   All Admin navigation
-   Overview
-   Analytics
-   Geography
-   Employees
-   Citizens
-   Inspections
-   Complaints
-   Products
-   Rules
-   Reports
-   Announcements
-   Permissions
-   Audit Logs
-   Notifications
-   Settings
-   System Health
-   Sign Out
-   Responsive behavior
-   Accessibility
-   Employee preservation
-   Citizen preservation
-   TypeScript
-   Production build

------------------------------------------------------------------------

# 6. Role Protection

The application must maintain strict role separation:

``` text
Employee → /employee/*
Citizen  → /citizen/*
Admin    → /admin/*
```

Examples:

-   Citizen cannot access Employee routes.
-   Citizen cannot access Admin routes.
-   Employee cannot access Admin routes.
-   Admin routes require an authenticated Admin role.

Frontend guards are not a replacement for server-side authorization in
production.

------------------------------------------------------------------------

# 7. Mock Data

The frontend uses realistic mock data for SIH demonstration.

Target datasets include:

### Employee

-   5+ employees
-   15+ products
-   20+ inspections
-   10+ complaints
-   Compliance results
-   Evidence
-   Reports
-   Notifications
-   Map locations

### Citizen

-   3+ citizens
-   10+ scans
-   10+ complaints
-   Notifications
-   No-potential-issue scenario
-   Review scenario
-   Potential-issue scenario

### Admin

-   20 employees
-   50 citizens
-   100 products
-   200 inspections
-   100 complaints
-   100 compliance checks
-   50 reports
-   Rule versions
-   Audit logs
-   Notifications
-   Geographic data

Reuse existing mock data where practical.

------------------------------------------------------------------------

# 8. Core SIH Demonstration

## Employee

``` text
Employee Login
→ Dashboard
→ New Inspection
→ Package Image
→ Analysis
→ Declarations
→ Applicability
→ Compliance
→ Potential Issue
→ Evidence
→ Officer Verification
→ Final Inspection
→ Report
```

## Citizen

``` text
Citizen Login
→ Home
→ Scan Product
→ Package Information
→ Preliminary Result
→ Complaint
→ Complaint ID
→ Track Complaint
```

## Admin

``` text
Admin Login
→ Overview
→ Analytics
→ Geographic Monitoring
→ Employee Activity
→ Complaints
→ Inspections
→ Products
→ Rules
→ Reports
→ Audit Logs
→ System Health
```

------------------------------------------------------------------------

# 9. AI and Legal Safety

The application must separate:

``` text
AI
"What can we see?"
        ↓
Applicability Engine
"Which requirements apply?"
        ↓
Rule Engine
"What is required?"
        ↓
Compliance Engine
"Does the extracted information satisfy the configured check?"
        ↓
Evidence
"What supports the finding?"
        ↓
Authorized Officer
"Is the finding verified?"
        ↓
Final Inspection / Enforcement Process
```

AI is never the final legal authority.

For Citizen:

-   No Potential Issue Detected
-   Review Recommended
-   Potential Issue Detected

For Employee:

-   PASS
-   REVIEW REQUIRED
-   POTENTIAL ISSUE

Never present automated screening as a confirmed legal violation.

------------------------------------------------------------------------

# 10. API-Ready Architecture

Current implementation uses mock services.

Future API contracts include:

### Authentication

``` text
POST /api/auth/login
GET  /api/auth/me
```

### Citizen

``` text
POST /api/scans
GET  /api/scans
POST /api/complaints
GET  /api/complaints
GET  /api/complaints/{id}
GET  /api/notifications
```

### Employee

``` text
POST /api/scans
GET  /api/scans/{scan_id}
POST /api/compliance/check
GET  /api/compliance/{inspection_id}
POST /api/inspections
GET  /api/inspections
GET  /api/inspections/{inspection_id}
PUT  /api/inspections/{inspection_id}
GET  /api/complaints
GET  /api/complaints/{complaint_id}
POST /api/reports
GET  /api/reports/{report_id}
```

### Admin

``` text
GET /api/admin/overview
GET /api/admin/analytics
GET /api/admin/employees
GET /api/admin/citizens
GET /api/admin/inspections
GET /api/admin/complaints
GET /api/admin/products
GET /api/admin/rules
GET /api/admin/reports
GET /api/admin/audit-logs
GET /api/admin/system-health
```

Keep services separate from UI components so they can later be replaced
with real API implementations.

------------------------------------------------------------------------

# 11. Frontend-Only Status

The current project is a frontend/SIH demonstration prototype.

### Currently functional

-   React UI
-   TypeScript
-   Vite
-   Role-based frontend routing
-   Employee dashboard
-   Citizen dashboard
-   Admin dashboard
-   Camera/file-upload interfaces
-   Image previews
-   Mock workflows
-   Mock services
-   Responsive layouts
-   Charts
-   Maps
-   Forms
-   Tables
-   Complaint flows
-   Inspection flows
-   Reports UI
-   Admin management UI

### Not yet production-connected

-   Real backend
-   Persistent production database
-   Production authentication/session infrastructure
-   Server-side authorization
-   Cloud file storage
-   Real OCR
-   Production AI pipeline
-   Production compliance/rules engine
-   Production notifications
-   Production report generation
-   Production deployment

------------------------------------------------------------------------

# 12. Future Full-Stack Architecture

``` text
                    FRONTEND
       ┌────────────┼────────────┐
       ↓            ↓            ↓
   Employee       Citizen       Admin
       └────────────┼────────────┘
                    ↓
                Backend API
                    ↓
       ┌────────────┼────────────┐
       ↓            ↓            ↓
 Authentication  PostgreSQL   File Storage
                    ↓
              Business Logic
                    ↓
       ┌────────────┼────────────┐
       ↓            ↓            ↓
     OCR/AI     Rules Engine   Reports
```

Example real workflow:

``` text
Citizen
→ Package Image
→ Backend
→ Storage + OCR
→ Preliminary Screening
→ Complaint
→ Database
→ Employee Inspection
→ Evidence
→ Compliance
→ Officer Verification
→ Final Report
→ Admin Analytics/Audit
→ Citizen Status
```

------------------------------------------------------------------------

# 13. Development Rules

When continuing development:

1.  Inspect the existing project before changing files.
2.  Preserve completed functionality.
3.  Work incrementally.
4.  Avoid unnecessary rewrites.
5.  Keep services separate from UI components.
6.  Maintain strict role boundaries.
7.  Do not invent legal provisions.
8.  Do not invent government contact information.
9.  Do not present AI as a final legal decision-maker.
10. Run `npx tsc --noEmit` after significant changes.
11. Run `npm run build` before marking a task complete.
12. Do not start backend work until the frontend scope is accepted.

------------------------------------------------------------------------

# 14. Overall Project Status

``` text
PHASE 1 — Frontend Foundation
                    ✅

EMPLOYEE — Tasks A–O
                    ✅

CITIZEN — Tasks A–D
                    ✅ / final verification as applicable

ADMIN — Tasks A–C
                    🔄 / complete incrementally

BACKEND
                    ⏳ Future

DATABASE
                    ⏳ Future

REAL OCR / AI
                    ⏳ Future

PRODUCTION SECURITY
                    ⏳ Future

DEPLOYMENT
                    ⏳ Future
```

## Final Vision

### Employee

**Field Enforcement**

``` text
Inspect → Analyze → Evidence → Verify → Report
```

### Citizen

**Consumer Assistance**

``` text
Scan → Understand → Screen → Complain → Track
```

### Admin

**Central Management**

``` text
Monitor → Analyze → Manage → Configure → Audit
```

The three role experiences share the same platform foundation but remain
visually and functionally distinct.

------------------------------------------------------------------------

**Project stage:** Frontend prototype / SIH demonstration stage.

**Next major stage:** Backend + database + real authentication + file
storage + real OCR/AI + compliance/rules integration + security +
testing + deployment.
