/*
  # Add truck consumption tracking

  1. New Tables
    - `truck_consumption`
      - `id` (uuid, primary key)
      - `truck_id` (text, required) - ID of the truck (solo1, solo2, man, renault)
      - `date` (date, required)
      - `fuel_money` (numeric, required) - Amount spent on fuel in MAD
      - `fuel_price` (numeric, required) - Price per liter in MAD
      - `consumption_rate` (numeric, required) - Consumption rate in L/100km
      - `previous_km` (numeric, required)
      - `current_km` (numeric, required)
      - `created_at` (timestamptz, default now())
      - `user_id` (uuid, foreign key to auth.users)

  2. Security
    - Enable RLS on `truck_consumption` table
    - Add policies for authenticated users to:
      - Read their own entries
      - Create new entries
      - Update their own entries
      - Delete their own entries
*/

-- Create truck consumption table
CREATE TABLE IF NOT EXISTS truck_consumption (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id text NOT NULL,
  date date NOT NULL,
  fuel_money numeric NOT NULL,
  fuel_price numeric NOT NULL,
  consumption_rate numeric NOT NULL,
  previous_km numeric NOT NULL,
  current_km numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE truck_consumption ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own truck consumption entries"
  ON truck_consumption
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create truck consumption entries"
  ON truck_consumption
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own truck consumption entries"
  ON truck_consumption
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own truck consumption entries"
  ON truck_consumption
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);