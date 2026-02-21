-- Réactiver RLS sur profiles mais avec une politique plus permissive
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Créer une nouvelle politique qui permet à TOUS les utilisateurs authentifiés de voir TOUS les profils
-- (Temporairement pour le débogage, on restreindra après)
CREATE POLICY "Authenticated users can view all profiles"
ON profiles FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Créer une politique pour permettre la mise à jour de son propre profil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);