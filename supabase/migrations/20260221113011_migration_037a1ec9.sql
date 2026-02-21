-- ÉTAPE 2 : Recréer des politiques RLS SIMPLES et SANS BOUCLE
-- Politique 1 : Permettre à chaque utilisateur de voir SON PROPRE profil
CREATE POLICY "allow_select_own_profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Politique 2 : Permettre à chaque utilisateur de mettre à jour SON PROPRE profil
CREATE POLICY "allow_update_own_profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Politique 3 : Permettre l'insertion de nouveaux profils (pour l'enregistrement)
CREATE POLICY "allow_insert_profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);