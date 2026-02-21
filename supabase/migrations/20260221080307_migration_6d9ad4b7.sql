-- ====================================================================
-- MISE À JOUR DE LA TABLE PROFILES POUR LES RÔLES
-- ====================================================================

-- Ajouter les colonnes nécessaires à la table profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(30) DEFAULT 'agent';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ministere_id UUID REFERENCES ministeres(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS direction_id UUID REFERENCES directions(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES services(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS actif BOOLEAN DEFAULT true;

-- Contrainte pour les rôles
ALTER TABLE profiles ADD CONSTRAINT check_role CHECK (
  role IN ('agent', 'rh_ministere', 'rh_central', 'admin', 'directeur', 'chef_service')
);

-- Créer un index sur le rôle
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);