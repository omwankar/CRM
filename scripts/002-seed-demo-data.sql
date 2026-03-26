-- Seed demo data for CRM testing
-- Matches the actual database schema created in 001-create-schema.sql
-- Note: Users must be created first via Supabase Auth, then their IDs can be used here

-- Seed sample certifications (these will be associated with the first authenticated user)
-- After login, users can assign these to themselves or other users

-- Seed sample Partnerships
INSERT INTO partnerships (partner_name, partner_type, contact_person, contact_email, contact_phone, start_date, end_date, status, description, created_at, updated_at)
VALUES
  ('Tech Solutions Inc', 'vendor', 'John Smith', 'john@techsolutions.com', '555-0101', '2022-06-01'::date, '2025-06-01'::date, 'active', 'Strategic technology partner providing cloud services', NOW(), NOW()),
  ('Global Services Ltd', 'client', 'Sarah Johnson', 'sarah@globalservices.com', '555-0102', '2023-01-15'::date, '2026-01-15'::date, 'active', 'Key client for consultation services', NOW(), NOW()),
  ('Data Analytics Co', 'strategic', 'Mike Davis', 'mike@dataanalytics.com', '555-0103', '2023-09-01'::date, '2024-09-01'::date, 'active', 'Analytics and reporting services provider', NOW(), NOW());

-- Seed sample Insurance
INSERT INTO insurance (policy_name, policy_type, provider_name, policy_number, coverage_amount, premium_amount, start_date, expiry_date, renewal_date, status, created_at, updated_at)
VALUES
  ('General Liability', 'general_liability', 'InsureCorp', 'POL-2024-001', 1000000, 25000, '2023-01-01'::date, '2025-01-01'::date, '2024-12-01'::date, 'active', NOW(), NOW()),
  ('Professional Indemnity', 'professional_indemnity', 'SafeGuard Insurance', 'POL-2024-002', 500000, 15000, '2023-06-15'::date, '2025-06-15'::date, '2025-05-15'::date, 'active', NOW(), NOW()),
  ('Cyber Liability', 'cyber_liability', 'CyberShield', 'POL-2024-003', 250000, 12000, '2024-01-01'::date, '2025-01-01'::date, '2024-12-15'::date, 'active', NOW(), NOW()),
  ('Property Insurance', 'property', 'PropertyGuard', 'POL-2024-004', 2000000, 35000, '2023-03-01'::date, '2024-03-01'::date, '2024-02-01'::date, 'expired', NOW(), NOW());

-- Seed sample Vendors
INSERT INTO vendors (vendor_name, vendor_type, contact_person, contact_email, contact_phone, address, city, country, website, description, created_at, updated_at)
VALUES
  ('Office Supplies Plus', 'product', 'Robert Brown', 'robert@officesupplies.com', '555-0201', '123 Business St', 'New York', 'USA', 'www.officesupplies.com', 'Primary office supplies vendor', NOW(), NOW()),
  ('Software Licensing Co', 'service', 'Emma Wilson', 'emma@softwarelicensing.com', '555-0202', '456 Tech Ave', 'San Francisco', 'USA', 'www.softwarelicensing.com', 'Software and licensing provider', NOW(), NOW()),
  ('Cleaning Services Pro', 'service', 'Tom Garcia', 'tom@cleaningpro.com', '555-0203', '789 Service Ln', 'Chicago', 'USA', 'www.cleaningpro.com', 'Facility maintenance vendor', NOW(), NOW());

-- Seed sample Buyers
INSERT INTO buyers (buyer_name, contact_person, contact_email, contact_phone, address, city, country, website, industry, description, created_at, updated_at)
VALUES
  ('Alice Thompson', 'Alice Thompson', 'alice@enterprisecorp.com', '555-0301', '321 Corporate Blvd', 'Boston', 'USA', 'www.enterprisecorp.com', 'Technology', 'Top tier buyer - Enterprise Corp', NOW(), NOW()),
  ('David Martinez', 'David Martinez', 'david@growthindustries.com', '555-0302', '654 Growth Ave', 'Austin', 'USA', 'www.growthindustries.com', 'Manufacturing', 'Mid-size account - Growth Industries', NOW(), NOW()),
  ('Lisa Anderson', 'Lisa Anderson', 'lisa@startupsventures.com', '555-0303', '987 Innovation St', 'Seattle', 'USA', 'www.startupsventures.com', 'Startups', 'Growing relationship - Startup Ventures', NOW(), NOW());

-- Seed sample Documents (requires related_table and related_id)
-- Using placeholder UUIDs for related entities
INSERT INTO documents (related_table, related_id, document_name, document_type, file_url, file_size, file_type, created_at, updated_at)
VALUES
  ('partnerships', '00000000-0000-0000-0000-000000000001'::uuid, 'Tech Solutions Inc Agreement', 'contract', 'https://example.com/contract-tech.pdf', 2100000, 'pdf', NOW(), NOW()),
  ('insurance', '00000000-0000-0000-0000-000000000002'::uuid, 'General Liability Policy', 'policy', 'https://example.com/insurance-policy.pdf', 1500000, 'pdf', NOW(), NOW()),
  ('vendors', '00000000-0000-0000-0000-000000000003'::uuid, 'Vendor Agreement', 'contract', 'https://example.com/vendor-agreement.pdf', 850000, 'pdf', NOW(), NOW()),
  ('partnerships', '00000000-0000-0000-0000-000000000004'::uuid, 'Partnership Terms', 'agreement', 'https://example.com/partnership-terms.pdf', 750000, 'pdf', NOW(), NOW());

-- Seed sample Admin Settings (using key-value structure)
INSERT INTO admin_settings (setting_name, setting_value, data_type, created_at, updated_at)
VALUES
  ('alert_days_before_expiry', '30', 'integer', NOW(), NOW()),
  ('email_notifications_enabled', 'true', 'boolean', NOW(), NOW()),
  ('alert_email', 'admin@example.com', 'string', NOW(), NOW())
ON CONFLICT (setting_name) DO UPDATE SET
  updated_at = NOW();
