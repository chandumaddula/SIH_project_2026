# ⚖️ Legal Metrology Compliance System

> AI-Powered Packaged Commodity Compliance & Inspection Platform built in accordance with the Legal Metrology (Packaged Commodities) Rules, 2011 (PCR 2011).

---

## 📁 Finalized Directory Structure

```text
legal-metrology-compliance/
│
├── dashboard/
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Loading.tsx
│   │   │   │   └── StatusBadge.tsx
│   │   │   │
│   │   │   └── layout/
│   │   │       ├── Sidebar.tsx
│   │   │       ├── Header.tsx
│   │   │       └── PageContainer.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Register.tsx
│   │   │   │
│   │   │   ├── citizen/
│   │   │   │   └── CitizenDashboard.tsx
│   │   │   │
│   │   │   ├── officer/
│   │   │   │   └── OfficerDashboard.tsx
│   │   │   │
│   │   │   ├── organisation/
│   │   │   │   └── OrganisationDashboard.tsx
│   │   │   │
│   │   │   └── admin/
│   │   │       └── AdminDashboard.tsx
│   │   │
│   │   ├── routes/
│   │   │   ├── AppRoutes.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── RoleRoute.tsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── authService.ts
│   │   │
│   │   ├── store/
│   │   │   └── authStore.ts
│   │   │
│   │   ├── types/
│   │   │   └── user.ts
│   │   │
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   │
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   └── users.py
│   │   │
│   │   ├── models/
│   │   │   └── user.py
│   │   │
│   │   ├── schemas/
│   │   │   └── user.py
│   │   │
│   │   ├── services/
│   │   │   └── auth_service.py
│   │   │
│   │   ├── database/
│   │   │   ├── connection.py
│   │   │   └── base.py
│   │   │
│   │   └── core/
│   │       ├── config.py
│   │       └── security.py
│   │
│   ├── tests/
│   ├── requirements.txt
│   └── .env
│
├── docs/
│   └── architecture.md
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 🛠️ Getting Started

### 1. Backend Setup (FastAPI Python)

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

FastAPI Documentation available at: `http://localhost:8000/docs`

### 2. Dashboard Setup (React + TypeScript)

```bash
cd dashboard
npm install
npm run dev
```

Dashboard Web App running at: `http://localhost:3000`

---

## 👥 User Roles & Access Control

- **Citizen / Consumer**: Scans packaged commodity labels and files compliance complaints.
- **Enforcement Officer**: Manages field inspection audits, verifies evidence, and issues digital violation notices.
- **Organisation / Manufacturer**: Submits package label artwork for pre-market clearance.
- **Administrator**: Configures rule thresholds, manages user roles, and monitors audit logs.