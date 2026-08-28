-- Legal Metrology DB Schema

CREATE TABLE IF NOT EXISTS inspection_officers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    badge_number VARCHAR(100) UNIQUE NOT NULL,
    jurisdiction VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inspection_sessions (
    id VARCHAR(64) PRIMARY KEY,
    officer_id VARCHAR(64) REFERENCES inspection_officers(id),
    product_name VARCHAR(255),
    category VARCHAR(100),
    compliance_status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inspection_evidences (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(64) REFERENCES inspection_sessions(id),
    image_url TEXT NOT NULL,
    bounding_box_json JSONB,
    extracted_text TEXT
);

CREATE TABLE IF NOT EXISTS rule_violations (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(64) REFERENCES inspection_sessions(id),
    rule_id VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    legal_reference VARCHAR(255) NOT NULL
);
