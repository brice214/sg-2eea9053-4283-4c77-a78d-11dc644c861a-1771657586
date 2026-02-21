-- Vérifier et corriger les politiques RLS sur la table profiles
-- Permettre aux utilisateurs de lire leur propre profil

-- 1. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- 2. Créer de nouvelles politiques RLS pour profiles
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 3. S'assurer que RLS est activé
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;