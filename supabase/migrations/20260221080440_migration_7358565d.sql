-- Ajouter la colonne role à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'agent' CHECK (role IN ('admin', 'rh_central', 'rh_ministere', 'rh_direction', 'agent', 'superviseur'));

-- Créer un index sur le rôle
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Mettre à jour les politiques RLS pour profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'rh_central', 'rh_ministere')
    )
  );