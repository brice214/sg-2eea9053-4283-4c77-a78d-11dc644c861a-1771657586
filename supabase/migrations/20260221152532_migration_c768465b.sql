-- Ajouter le rôle 'admin_ministere' au CHECK constraint de la table profiles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_role;

ALTER TABLE profiles ADD CONSTRAINT check_role 
CHECK (role IN ('agent', 'rh_ministere', 'rh_central', 'admin_ministere', 'admin', 'directeur', 'chef_service'));