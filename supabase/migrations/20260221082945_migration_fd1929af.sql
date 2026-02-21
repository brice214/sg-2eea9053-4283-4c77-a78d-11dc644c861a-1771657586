-- ====================================================================
-- CORRECTION 1 : Agrandir le champ code de la table echelles
-- ====================================================================

ALTER TABLE echelles 
ALTER COLUMN code TYPE VARCHAR(50);

-- ====================================================================
-- CORRECTION 2 : Rendre grade_id nullable temporairement pour l'import
-- ====================================================================

ALTER TABLE echelles 
ALTER COLUMN grade_id DROP NOT NULL;

-- ====================================================================
-- CORRECTION 3 : Supprimer les anciennes données pour réimporter
-- ====================================================================

-- Supprimer les échelons existants
DELETE FROM echelons;

-- Supprimer les échelles existantes
DELETE FROM echelles;

-- Supprimer les grades existants
DELETE FROM grades;