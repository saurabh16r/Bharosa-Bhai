-- Supabase Database Schema for Bharosa Bhai
-- Run this script in your Supabase SQL Editor to configure tables and security policies.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to avoid conflicts (optional but recommended for a clean setup)
DROP TABLE IF EXISTS discovery_calls CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS test_results CASCADE;
DROP TABLE IF EXISTS chat_history CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Create Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  age INTEGER,
  retire_at INTEGER,
  parents_selected BOOLEAN,
  parents_receive_pension TEXT,
  parent_monthly_pension INTEGER,
  parent_monthly_support INTEGER,
  parent_dependency_level TEXT,
  parent_dependency_percentage INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT check_phone_format CHECK (phone IS NULL OR (length(phone) = 10 AND phone ~ '^[6-9][0-9]{9}$')),
  CONSTRAINT check_age CHECK (age >= 18 AND age <= 70),
  CONSTRAINT check_retire_at CHECK (retire_at >= 40 AND retire_at <= 80 AND retire_at > age)
);

-- 2. Create Test Results Table
CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  raw_answers JSONB,
  health_score INTEGER,
  retirement_score INTEGER,
  goals_score INTEGER,
  protection_score INTEGER,
  journey_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create CRM Leads Table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'New Lead',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Discovery Calls Table
CREATE TABLE discovery_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Chat History Table
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --- Enable Row Level Security (RLS) ---
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- --- RLS Policies for Anonymous/Public Users (Form submissions) ---
CREATE POLICY "Allow public insert on users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on test_results" ON test_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on discovery_calls" ON discovery_calls FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on chat_history" ON chat_history FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public select on test_results" ON test_results FOR SELECT USING (true);
CREATE POLICY "Allow public select on leads" ON leads FOR SELECT USING (true);
CREATE POLICY "Allow public select on discovery_calls" ON discovery_calls FOR SELECT USING (true);
CREATE POLICY "Allow public select on chat_history" ON chat_history FOR SELECT USING (true);

-- --- RLS Policies for Authenticated Admin Users (Full dashboard access) ---
CREATE POLICY "Allow admin all actions on users" ON users FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin all actions on test_results" ON test_results FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin all actions on leads" ON leads FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin all actions on discovery_calls" ON discovery_calls FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin all actions on chat_history" ON chat_history FOR ALL TO authenticated USING (true);

-- 6. Create System Settings Table
DROP TABLE IF EXISTS system_settings CASCADE;
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for system_settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on system_settings" ON system_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert on system_settings" ON system_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on system_settings" ON system_settings FOR UPDATE USING (true);
CREATE POLICY "Allow admin all actions on system_settings" ON system_settings FOR ALL TO authenticated USING (true);

