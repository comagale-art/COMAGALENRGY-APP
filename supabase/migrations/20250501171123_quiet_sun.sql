/*
  # Add completion status to tracking tables

  1. Changes
    - Add completion status columns to supplier and client tracking tables
    - Add completion_date column to store when tracking was completed
*/

-- Add completion status to supplier tracking
ALTER TABLE supplier_transactions 
ADD COLUMN IF NOT EXISTS is_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS completed_at timestamptz;

ALTER TABLE supplier_payments
ADD COLUMN IF NOT EXISTS is_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Add completion status to client tracking
ALTER TABLE client_transactions
ADD COLUMN IF NOT EXISTS is_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS completed_at timestamptz;

ALTER TABLE client_payments
ADD COLUMN IF NOT EXISTS is_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS completed_at timestamptz;