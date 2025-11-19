/*
  # Add client tracking tables

  1. New Tables
    - `client_transactions`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to clients)
      - `date` (date, required)
      - `entry_type` (text, required) - 'invoice' or 'quantity'
      - `invoice_number` (text)
      - `quantity` (numeric)
      - `price_per_kg` (numeric)
      - `total_amount` (numeric, required)
      - `description` (text)
      - `created_at` (timestamptz, default now())
      - `user_id` (uuid, foreign key to auth.users)

    - `client_payments`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to clients)
      - `payment_date` (date, required)
      - `payment_method` (text, required) - 'effect', 'cheque', 'virement'
      - `collection_date` (date, required)
      - `amount` (numeric, required)
      - `created_at` (timestamptz, default now())
      - `user_id` (uuid, foreign key to auth.users)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Read their own entries
      - Create new entries
      - Delete their own entries
*/

-- Create client transactions table
CREATE TABLE IF NOT EXISTS client_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  date date NOT NULL,
  entry_type text NOT NULL CHECK (entry_type IN ('invoice', 'quantity')),
  invoice_number text,
  quantity numeric,
  price_per_kg numeric,
  total_amount numeric NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Create client payments table
CREATE TABLE IF NOT EXISTS client_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  payment_date date NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('effect', 'cheque', 'virement')),
  collection_date date NOT NULL,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE client_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for client_transactions
CREATE POLICY "Users can read own client transactions"
  ON client_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create client transactions"
  ON client_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own client transactions"
  ON client_transactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for client_payments
CREATE POLICY "Users can read own client payments"
  ON client_payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create client payments"
  ON client_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own client payments"
  ON client_payments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);