/*
  # Mise à jour des politiques RLS pour les barils

  1. Modifications
    - Suppression des anciennes politiques restrictives
    - Création de nouvelles politiques permettant à tous les utilisateurs authentifiés d'accéder à tous les barils
  
  2. Nouvelles politiques
    - SELECT: Tous les utilisateurs authentifiés peuvent lire tous les barils
    - INSERT: Tous les utilisateurs authentifiés peuvent créer des barils
    - UPDATE: Tous les utilisateurs authentifiés peuvent modifier tous les barils
    - DELETE: Tous les utilisateurs authentifiés peuvent supprimer tous les barils
  
  3. Sécurité
    - RLS reste activé
    - Seuls les utilisateurs authentifiés ont accès
    - Pas de restrictions par user_id pour permettre le partage entre utilisateurs
*/

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can read own barrels" ON barrels;
DROP POLICY IF EXISTS "Users can create barrels" ON barrels;
DROP POLICY IF EXISTS "Users can update own barrels" ON barrels;
DROP POLICY IF EXISTS "Users can delete own barrels" ON barrels;

-- Créer les nouvelles politiques pour tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can read all barrels"
  ON barrels
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create barrels"
  ON barrels
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update all barrels"
  ON barrels
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete all barrels"
  ON barrels
  FOR DELETE
  TO authenticated
  USING (true);
