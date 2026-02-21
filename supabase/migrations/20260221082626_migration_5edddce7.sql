-- ====================================================================
-- ÉTAPE 1 : AJUSTEMENT DU SCHÉMA POUR LA GRILLE INDICIAIRE 2015
-- ====================================================================

-- 1.1 Corriger la contrainte sur corps.categorie (uniquement A1, A2, B1, B2, C)
ALTER TABLE corps 
DROP CONSTRAINT IF EXISTS check_categorie;

ALTER TABLE corps 
ADD CONSTRAINT check_categorie CHECK (categorie IN ('A1', 'A2', 'B1', 'B2', 'C'));

-- 1.2 Ajouter la catégorie dans la table echelles pour lien direct
ALTER TABLE echelles
ADD COLUMN IF NOT EXISTS categorie VARCHAR(2);

-- Ajouter une contrainte de cohérence
ALTER TABLE echelles
DROP CONSTRAINT IF EXISTS check_categorie_echelle;

ALTER TABLE echelles
ADD CONSTRAINT check_categorie_echelle CHECK (categorie IN ('A1', 'A2', 'B1', 'B2', 'C'));

-- 1.3 Renommer et ajuster les champs dans echelons
-- Ajouter indice_reference (l'indice exact de la grille)
ALTER TABLE echelons
ADD COLUMN IF NOT EXISTS indice_reference INTEGER;

-- Ajouter salaire_base (calculé automatiquement)
ALTER TABLE echelons
ADD COLUMN IF NOT EXISTS salaire_base NUMERIC(15, 2);

-- Renommer duree_mois en duree_annees
ALTER TABLE echelons
ADD COLUMN IF NOT EXISTS duree_annees INTEGER;

-- Copier les valeurs existantes (duree_mois / 12 = duree_annees)
UPDATE echelons 
SET duree_annees = CEIL(duree_mois / 12.0)::INTEGER
WHERE duree_annees IS NULL AND duree_mois IS NOT NULL;

-- 1.4 Ajouter un index sur la catégorie des échelles
CREATE INDEX IF NOT EXISTS idx_echelles_categorie ON echelles(categorie);

-- 1.5 Ajouter des commentaires pour la documentation
COMMENT ON COLUMN echelles.categorie IS 'Catégorie de l''échelle selon la grille indiciaire 2015 (A1, A2, B1, B2, C)';
COMMENT ON COLUMN echelons.indice_reference IS 'Indice de référence exact selon la grille indiciaire 2015';
COMMENT ON COLUMN echelons.salaire_base IS 'Salaire de base = indice_reference × 500 FCFA';
COMMENT ON COLUMN echelons.duree_annees IS 'Durée en années avant avancement (2 ou 3 ans selon la grille)';