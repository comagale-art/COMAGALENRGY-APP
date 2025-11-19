/*
  # Create tanks table

  1. New Tables
    - `tanks`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `product_type` (text, required) 
      - `quantity` (numeric, required)
      - `is_loading` (boolean, default true)
      - `description` (text)
      - `date` (date, required)
      - `time` (time, required)
      - `created_at` (timestamptz, default now())
      - `user_id` (uuid, foreign key to auth.users)

  2. Security
    - Enable RLS on `tanks` table
    - Add policies for authenticated users to:
      - Read their own tanks
      - Create new tanks
      - Update their own tanks
      - Delete their own tanks
*/

-- Create tanks table
CREATE TABLE IF NOT EXISTS tanks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  product_type text NOT NULL,
  quantity numeric NOT NULL,
  is_loading boolean DEFAULT true,
  description text,
  date date NOT NULL,
  time time NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE tanks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own tanks"
  ON tanks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tanks"
  ON tanks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tanks"
  ON tanks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tanks"
  ON tanks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);