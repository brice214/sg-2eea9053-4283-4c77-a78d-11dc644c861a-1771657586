ALTER TABLE agents
ADD COLUMN IF NOT EXISTS mode_recrutement VARCHAR(50),
ADD COLUMN IF NOT EXISTS numero_decision_recrutement VARCHAR(50),
ADD COLUMN IF NOT EXISTS date_decision_recrutement DATE;

-- Mise à jour de la contrainte check_statut pour inclure les nouveaux statuts si nécessaire
ALTER TABLE agents DROP CONSTRAINT IF EXISTS check_statut;
ALTER TABLE agents ADD CONSTRAINT check_statut CHECK (statut IN ('stagiaire', 'titulaire', 'contractuel', 'détaché', 'disponibilité', 'retraité', 'STAGIAIRE', 'TITULAIRE', 'EN_ATTENTE_VALIDATION', 'DETACHE', 'RETRAITE'));