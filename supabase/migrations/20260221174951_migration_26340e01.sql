-- Ajout des colonnes manquantes pour enrichir les informations professionnelles
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS date_reprise_service DATE,
ADD COLUMN IF NOT EXISTS date_mise_en_retraite DATE,
ADD COLUMN IF NOT EXISTS date_integration DATE,
ADD COLUMN IF NOT EXISTS date_reclassement DATE,
ADD COLUMN IF NOT EXISTS etablissement_affectation TEXT,
ADD COLUMN IF NOT EXISTS lieu_affectation_actuel TEXT;

COMMENT ON COLUMN agents.date_reprise_service IS 'Date de reprise de service après une période de disponibilité ou congé';
COMMENT ON COLUMN agents.date_mise_en_retraite IS 'Date prévue de mise en retraite';
COMMENT ON COLUMN agents.date_integration IS 'Date d''intégration dans le corps';
COMMENT ON COLUMN agents.date_reclassement IS 'Date du dernier reclassement';
COMMENT ON COLUMN agents.etablissement_affectation IS 'Établissement ou direction provinciale d''affectation';
COMMENT ON COLUMN agents.lieu_affectation_actuel IS 'Lieu géographique d''affectation actuel (ville, province)';