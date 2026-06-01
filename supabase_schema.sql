-- Supabase Database Schema for Bharosa Bhai
-- Run this script in your Supabase SQL Editor

-- Create Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  age INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Test Results Table
CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER,
  emergency_score INTEGER,
  insurance_score INTEGER,
  investment_score INTEGER,
  tax_score INTEGER,
  retirement_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Chat History Table
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add basic Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for the lead capture
CREATE POLICY "Allow anonymous inserts to users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous inserts to test_results" ON test_results FOR INSERT WITH CHECK (true);

-- To restrict select queries to authenticated admin only:
CREATE POLICY "Allow admin to select users" ON users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin to select test_results" ON test_results FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin to select chat_history" ON chat_history FOR SELECT USING (auth.role() = 'authenticated');
