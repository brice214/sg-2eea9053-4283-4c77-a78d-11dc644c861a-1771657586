-- ====================================================================
-- CORRECTION STRUCTURELLE : Rendre grades.corps_id nullable
-- pour permettre des grades transversaux selon la grille indiciaire 2015
-- ====================================================================

-- Supprimer les anciennes données pour repartir sur de bonnes bases
DELETE FROM echelons;
DELETE FROM echelles;
DELETE FROM agents; -- Supprimer les agents car ils référencent des grades
DELETE FROM grades;

-- Rendre corps_id nullable dans la table grades
ALTER TABLE grades 
ALTER COLUMN corps_id DROP NOT NULL;

-- Ajouter un commentaire pour clarifier
COMMENT ON COLUMN grades.corps_id IS 'ID du corps (nullable pour les grades transversaux de la grille indiciaire)';