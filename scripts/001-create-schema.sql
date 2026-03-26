-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'manager');
CREATE TYPE certification_status AS ENUM ('active', 'expired', 'pending_renewal');
CREATE TYPE membership_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE partnership_status AS ENUM ('active', 'inactive', 'on_hold');
CREATE TYPE insurance_status AS ENUM ('active', 'expired', 'pending_renewal');
CREATE TYPE vendor_type AS ENUM ('product', 'service', 'both');
CREATE TYPE document_type AS ENUM ('contract', 'agreement', 'certificate', 'policy', 'other');
CREATE TYPE alert_type AS ENUM ('expiry', 'renewal_due', 'system', 'info');

-- Users table (extended from Supabase auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  role user_role NOT NULL DEFAULT 'manager',
  department VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certifications table
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  certification_name VARCHAR(255) NOT NULL,
  issuing_authority VARCHAR(255),
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  certificate_number VARCHAR(100),
  status certification_status DEFAULT 'active',
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memberships table
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_name VARCHAR(255) NOT NULL,
  membership_type VARCHAR(100),
  member_id VARCHAR(100),
  join_date DATE NOT NULL,
  renewal_date DATE,
  status membership_status DEFAULT 'active',
  benefits TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partnerships table
CREATE TABLE partnerships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_name VARCHAR(255) NOT NULL,
  partner_type VARCHAR(100),
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  start_date DATE NOT NULL,
  end_date DATE,
  status partnership_status DEFAULT 'active',
  description TEXT,
  terms_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insurance policies table
CREATE TABLE insurance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_name VARCHAR(255) NOT NULL,
  policy_type VARCHAR(100),
  provider_name VARCHAR(255),
  policy_number VARCHAR(100),
  coverage_amount DECIMAL(15, 2),
  premium_amount DECIMAL(15, 2),
  start_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  renewal_date DATE,
  status insurance_status DEFAULT 'active',
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors table
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_name VARCHAR(255) NOT NULL,
  vendor_type vendor_type,
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  website VARCHAR(255),
  description TEXT,
  contract_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buyers table
CREATE TABLE buyers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  company_type VARCHAR(100),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  website VARCHAR(255),
  industry VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRM/Subscriptions table
CREATE TABLE crm_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  subscription_name VARCHAR(255) NOT NULL,
  subscription_type VARCHAR(100),
  start_date DATE NOT NULL,
  renewal_date DATE,
  billing_amount DECIMAL(15, 2),
  billing_frequency VARCHAR(50),
  status membership_status DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  related_table VARCHAR(100) NOT NULL,
  related_id UUID NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  document_type document_type,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type VARCHAR(50),
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_type alert_type NOT NULL,
  related_table VARCHAR(100),
  related_id UUID,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  days_before_expiry INT DEFAULT 30,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log table for audit trail
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table for alert preferences
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_name VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  data_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_certifications_user_id ON certifications(user_id);
CREATE INDEX idx_certifications_expiry_date ON certifications(expiry_date);
CREATE INDEX idx_certifications_status ON certifications(status);
CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_renewal_date ON memberships(renewal_date);
CREATE INDEX idx_partnerships_status ON partnerships(status);
CREATE INDEX idx_insurance_expiry_date ON insurance(expiry_date);
CREATE INDEX idx_insurance_status ON insurance(status);
CREATE INDEX idx_vendors_vendor_type ON vendors(vendor_type);
CREATE INDEX idx_buyers_industry ON buyers(industry);
CREATE INDEX idx_crm_subscriptions_buyer_id ON crm_subscriptions(buyer_id);
CREATE INDEX idx_crm_subscriptions_renewal_date ON crm_subscriptions(renewal_date);
CREATE INDEX idx_documents_related ON documents(related_table, related_id);
CREATE INDEX idx_alerts_related ON alerts(related_table, related_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own profile and admins can view all
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- Managers can view and edit their own certifications, admins can view/edit all
CREATE POLICY "Users can view own certifications" ON certifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all certifications" ON certifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Users can insert own certifications" ON certifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own certifications" ON certifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can update any certifications" ON certifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- Similar policies for other tables - allowing managers to own records and admins to manage all
CREATE POLICY "Users can view own memberships" ON memberships
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all memberships" ON memberships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Users can insert own memberships" ON memberships
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own memberships" ON memberships
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view partnerships" ON partnerships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'manager')
    )
  );

CREATE POLICY "Admins can insert partnerships" ON partnerships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can view insurance" ON insurance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'manager')
    )
  );

CREATE POLICY "Admins can view vendors" ON vendors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'manager')
    )
  );

CREATE POLICY "Admins can view buyers" ON buyers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'manager')
    )
  );

CREATE POLICY "Admins can view subscriptions" ON crm_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'manager')
    )
  );

CREATE POLICY "Users can view documents" ON documents
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can view alerts" ON alerts
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Admins can view activity logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can view settings" ON admin_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Only super admin can update settings" ON admin_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
