/*
  # Gestion Gasoil - Diesel Consumption Tracking

  1. New Tables
    - `diesel_consumption`
      - `id` (uuid, primary key) - Unique identifier
      - `date` (date) - Date of fuel consumption
      - `vehicle_type` (text) - Type of vehicle (Camions/Voitures/Autre)
      - `vehicle_name` (text) - Name of the vehicle
      - `amount_dh` (numeric) - Amount paid in DH
      - `price_per_liter` (numeric) - Price per liter in DH
      - `liters_calculated` (numeric) - Calculated liters
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp
  
  2. Security
    - Enable RLS on `diesel_consumption` table
    - Add policy for authenticated users to manage diesel consumption records
    
  3. Indexes
    - Index on `date` for efficient date-based queries
    - Index on `vehicle_name` for vehicle filtering
*/

CREATE TABLE IF NOT EXISTS diesel_consumption (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  vehicle_type text NOT NULL,
  vehicle_name text NOT NULL,
  amount_dh numeric(10, 2) NOT NULL CHECK (amount_dh > 0),
  price_per_liter numeric(10, 2) NOT NULL CHECK (price_per_liter > 0),
  liters_calculated numeric(10, 2) NOT NULL CHECK (liters_calculated >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE diesel_consumption ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Users can view diesel consumption records"
  ON diesel_consumption FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert diesel consumption records"
  ON diesel_consumption FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update diesel consumption records"
  ON diesel_consumption FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete diesel consumption records"
  ON diesel_consumption FOR DELETE
  TO authenticated
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_diesel_consumption_date 
  ON diesel_consumption(date DESC);

CREATE INDEX IF NOT EXISTS idx_diesel_consumption_vehicle 
  ON diesel_consumption(vehicle_name);

CREATE INDEX IF NOT EXISTS idx_diesel_consumption_created_at 
  ON diesel_consumption(created_at DESC);