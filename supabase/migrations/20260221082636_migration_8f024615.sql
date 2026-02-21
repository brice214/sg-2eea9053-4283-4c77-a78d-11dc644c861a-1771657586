-- ====================================================================
-- ÉTAPE 2 : CRÉATION D'UNE FONCTION DE CALCUL AUTOMATIQUE DU SALAIRE
-- ====================================================================

CREATE OR REPLACE FUNCTION calculer_salaire_base()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcul automatique : salaire_base = indice_reference × 500
  IF NEW.indice_reference IS NOT NULL THEN
    NEW.salaire_base := NEW.indice_reference * 500;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_calcul_salaire_base ON echelons;
CREATE TRIGGER trigger_calcul_salaire_base
  BEFORE INSERT OR UPDATE ON echelons
  FOR EACH ROW
  EXECUTE FUNCTION calculer_salaire_base();