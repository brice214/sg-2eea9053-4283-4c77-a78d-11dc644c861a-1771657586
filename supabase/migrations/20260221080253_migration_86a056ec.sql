-- ====================================================================
-- SCHÉMA DE GESTION RH - FONCTION PUBLIQUE GABONAISE
-- ====================================================================

-- 1. Table des Ministères
CREATE TABLE ministeres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  sigle VARCHAR(20),
  description TEXT,
  responsable TEXT,
  adresse TEXT,
  telephone VARCHAR(20),
  email VARCHAR(100),
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des Directions (au sein des ministères)
CREATE TABLE directions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ministere_id UUID NOT NULL REFERENCES ministeres(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL,
  nom TEXT NOT NULL,
  sigle VARCHAR(20),
  type_direction VARCHAR(50), -- DG, DGA, Direction Centrale, Direction Régionale
  responsable TEXT,
  telephone VARCHAR(20),
  email VARCHAR(100),
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ministere_id, code)
);

-- 3. Table des Services (au sein des directions)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  direction_id UUID NOT NULL REFERENCES directions(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL,
  nom TEXT NOT NULL,
  type_service VARCHAR(50), -- Service, Division, Cellule, Bureau
  responsable TEXT,
  telephone VARCHAR(20),
  email VARCHAR(100),
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(direction_id, code)
);

-- 4. Table des Corps de la Fonction Publique
CREATE TABLE corps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  categorie VARCHAR(10) NOT NULL, -- A1, A2, B1, B2, C1, C2, D
  description TEXT,
  diplome_requis TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_categorie CHECK (categorie IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D'))
);

-- 5. Table des Grades
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corps_id UUID NOT NULL REFERENCES corps(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL,
  nom TEXT NOT NULL,
  ordre INTEGER NOT NULL, -- Ordre hiérarchique (1 = grade le plus bas)
  description TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(corps_id, code)
);

-- 6. Table des Échelles de rémunération
CREATE TABLE echelles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  grade_id UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
  indice_minimum INTEGER NOT NULL,
  indice_maximum INTEGER NOT NULL,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table des Échelons
CREATE TABLE echelons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  echelle_id UUID NOT NULL REFERENCES echelles(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  indice_brut INTEGER NOT NULL,
  indice_majore INTEGER NOT NULL,
  duree_mois INTEGER NOT NULL, -- Durée pour passer à l'échelon suivant
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(echelle_id, numero)
);

-- 8. Table des Postes (Cartographie des emplois)
CREATE TABLE postes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  intitule TEXT NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  corps_id UUID NOT NULL REFERENCES corps(id) ON DELETE RESTRICT,
  grade_minimum_id UUID REFERENCES grades(id) ON DELETE RESTRICT,
  description TEXT,
  missions TEXT,
  competences_requises TEXT,
  statut VARCHAR(20) DEFAULT 'vacant', -- vacant, pourvu, supprimé
  date_creation DATE DEFAULT CURRENT_DATE,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_statut_poste CHECK (statut IN ('vacant', 'pourvu', 'supprimé'))
);

-- 9. Table principale des Agents
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  matricule VARCHAR(20) UNIQUE NOT NULL, -- Généré automatiquement
  numero_dossier VARCHAR(30) UNIQUE,
  
  -- Identité
  nom VARCHAR(100) NOT NULL,
  prenoms VARCHAR(200) NOT NULL,
  nom_jeune_fille VARCHAR(100),
  sexe VARCHAR(1) NOT NULL,
  date_naissance DATE NOT NULL,
  lieu_naissance TEXT NOT NULL,
  nationalite VARCHAR(50) DEFAULT 'Gabonaise',
  
  -- Contact
  telephone VARCHAR(20),
  email VARCHAR(100),
  adresse_actuelle TEXT,
  ville VARCHAR(100),
  province VARCHAR(100),
  
  -- État civil
  situation_matrimoniale VARCHAR(20),
  nombre_enfants INTEGER DEFAULT 0,
  
  -- Situation administrative
  statut VARCHAR(30) NOT NULL DEFAULT 'stagiaire', -- stagiaire, titulaire, contractuel, détaché
  ministere_id UUID REFERENCES ministeres(id) ON DELETE RESTRICT,
  direction_id UUID REFERENCES directions(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  poste_id UUID REFERENCES postes(id) ON DELETE SET NULL,
  
  -- Carrière
  corps_id UUID NOT NULL REFERENCES corps(id) ON DELETE RESTRICT,
  grade_id UUID NOT NULL REFERENCES grades(id) ON DELETE RESTRICT,
  echelle_id UUID REFERENCES echelles(id) ON DELETE RESTRICT,
  echelon_id UUID REFERENCES echelons(id) ON DELETE RESTRICT,
  
  -- Dates importantes
  date_recrutement DATE NOT NULL,
  date_prise_service DATE,
  date_titularisation DATE,
  date_premiere_nomination DATE,
  
  -- Diplômes
  diplome_principal TEXT NOT NULL,
  specialite TEXT,
  annee_obtention INTEGER,
  etablissement TEXT,
  
  -- Statut du dossier
  dossier_complet BOOLEAN DEFAULT false,
  dossier_valide BOOLEAN DEFAULT false,
  date_validation DATE,
  validateur_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  observations TEXT,
  
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT check_sexe CHECK (sexe IN ('M', 'F')),
  CONSTRAINT check_statut CHECK (statut IN ('stagiaire', 'titulaire', 'contractuel', 'détaché', 'disponibilité', 'retraité')),
  CONSTRAINT check_situation_matrimoniale CHECK (situation_matrimoniale IN ('célibataire', 'marié(e)', 'divorcé(e)', 'veuf(ve)', 'union libre'))
);

-- 10. Table des Types de Documents
CREATE TABLE types_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  description TEXT,
  obligatoire BOOLEAN DEFAULT true,
  ordre_affichage INTEGER,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Table des Documents Administratifs
CREATE TABLE documents_administratifs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  type_document_id UUID NOT NULL REFERENCES types_documents(id) ON DELETE RESTRICT,
  numero_document VARCHAR(50),
  intitule TEXT NOT NULL,
  fichier_url TEXT, -- URL Supabase Storage
  fichier_nom VARCHAR(255),
  fichier_taille INTEGER, -- en octets
  date_emission DATE,
  date_expiration DATE,
  organisme_emetteur TEXT,
  observations TEXT,
  statut VARCHAR(20) DEFAULT 'en_attente', -- en_attente, validé, rejeté
  valide_par UUID REFERENCES profiles(id) ON DELETE SET NULL,
  date_validation TIMESTAMP WITH TIME ZONE,
  motif_rejet TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_statut_doc CHECK (statut IN ('en_attente', 'validé', 'rejeté'))
);

-- 12. Table Historique des Validations
CREATE TABLE historique_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- creation, validation, rejet, modification
  entite VARCHAR(50) NOT NULL, -- dossier, document, carriere
  entite_id UUID,
  effectue_par UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  date_action TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB,
  commentaire TEXT
);

-- Index pour optimiser les recherches
CREATE INDEX idx_agents_matricule ON agents(matricule);
CREATE INDEX idx_agents_ministere ON agents(ministere_id);
CREATE INDEX idx_agents_statut ON agents(statut);
CREATE INDEX idx_agents_nom ON agents(nom, prenoms);
CREATE INDEX idx_documents_agent ON documents_administratifs(agent_id);
CREATE INDEX idx_documents_statut ON documents_administratifs(statut);
CREATE INDEX idx_directions_ministere ON directions(ministere_id);
CREATE INDEX idx_services_direction ON services(direction_id);
CREATE INDEX idx_grades_corps ON grades(corps_id);
CREATE INDEX idx_echelons_echelle ON echelons(echelle_id);