/*
  # Add supplier tracking tables

  1. New Tables
    - `supplier_transactions`
      - `id` (uuid, primary key)
      - `supplier_id` (uuid, foreign key to suppliers)
      - `date` (date, required)
      - `quantity` (numeric, required)
      - `quantity_type` (text, required) - 'cm' or 'kg'
      - `price_per_kg` (numeric, required)
      - `total_price` (numeric, required)
      - `created_at` (timestamptz, default now())
      - `user_id` (uuid, foreign key to auth.users)

    - `supplier_payments`
      - `id` (uuid, primary key)
      - `supplier_id` (uuid, foreign key to suppliers)
      - `date` (date, required)
      - `description` (text)
      - `amount` (numeric, required)
      - `created_at` (timestamptz, default now())
      - `user_id` (uuid, foreign key to auth.users)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Read their own entries
      - Create new entries
      - Update their own entries
      - Delete their own entries
*/

-- Create supplier transactions table
CREATE TABLE IF NOT EXISTS supplier_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  date date NOT NULL,
  quantity numeric NOT NULL,
  quantity_type text NOT NULL CHECK (quantity_type IN ('cm', 'kg')),
  price_per_kg numeric NOT NULL,
  total_price numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Create supplier payments table
CREATE TABLE IF NOT EXISTS supplier_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  date date NOT NULL,
  description text,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE supplier_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for supplier_transactions
CREATE POLICY "Users can read own supplier transactions"
  ON supplier_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create supplier transactions"
  ON supplier_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own supplier transactions"
  ON supplier_transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own supplier transactions"
  ON supplier_transactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for supplier_payments
CREATE POLICY "Users can read own supplier payments"
  ON supplier_payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create supplier payments"
  ON supplier_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own supplier payments"
  ON supplier_payments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own supplier payments"
  ON supplier_payments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);