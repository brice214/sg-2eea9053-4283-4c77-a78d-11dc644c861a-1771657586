-- ÉTAPE 3 : S'assurer que RLS est activé
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 4 : Vérifier que le profil existe
SELECT id, email, role, ministere_id FROM profiles WHERE id = '0011f465-615d-4055-9a7f-bb40bf97afb8';