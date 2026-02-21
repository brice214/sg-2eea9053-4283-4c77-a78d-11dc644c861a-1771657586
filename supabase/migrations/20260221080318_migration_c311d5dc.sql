-- ====================================================================
-- FONCTION DE GÉNÉRATION AUTOMATIQUE DE MATRICULE
-- ====================================================================

CREATE OR REPLACE FUNCTION generer_matricule()
RETURNS VARCHAR(20) AS $$
DECLARE
  annee VARCHAR(4);
  mois VARCHAR(2);
  compteur INTEGER;
  nouveau_matricule VARCHAR(20);
BEGIN
  -- Obtenir l'année et le mois courants
  annee := TO_CHAR(CURRENT_DATE, 'YYYY');
  mois := TO_CHAR(CURRENT_DATE, 'MM');
  
  -- Compter le nombre d'agents créés ce mois-ci
  SELECT COUNT(*) + 1 INTO compteur
  FROM agents
  WHERE SUBSTRING(matricule, 1, 6) = annee || mois;
  
  -- Générer le matricule : YYYYMM-NNNN
  nouveau_matricule := annee || mois || '-' || LPAD(compteur::TEXT, 4, '0');
  
  -- Vérifier l'unicité (au cas où)
  WHILE EXISTS (SELECT 1 FROM agents WHERE matricule = nouveau_matricule) LOOP
    compteur := compteur + 1;
    nouveau_matricule := annee || mois || '-' || LPAD(compteur::TEXT, 4, '0');
  END LOOP;
  
  RETURN nouveau_matricule;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- TRIGGER POUR GÉNÉRATION AUTOMATIQUE DU MATRICULE
-- ====================================================================

CREATE OR REPLACE FUNCTION trigger_generer_matricule()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.matricule IS NULL OR NEW.matricule = '' THEN
    NEW.matricule := generer_matricule();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_agent_matricule
BEFORE INSERT ON agents
FOR EACH ROW
EXECUTE FUNCTION trigger_generer_matricule();

-- ====================================================================
-- FONCTION DE VÉRIFICATION DE COHÉRENCE CORPS → GRADE → ÉCHELLE
-- ====================================================================

CREATE OR REPLACE FUNCTION verifier_coherence_carriere(
  p_corps_id UUID,
  p_grade_id UUID,
  p_echelle_id UUID,
  p_echelon_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  grade_valide BOOLEAN;
  echelle_valide BOOLEAN;
  echelon_valide BOOLEAN;
BEGIN
  -- Vérifier que le grade appartient bien au corps
  SELECT EXISTS (
    SELECT 1 FROM grades 
    WHERE id = p_grade_id AND corps_id = p_corps_id
  ) INTO grade_valide;
  
  IF NOT grade_valide THEN
    RAISE EXCEPTION 'Le grade ne correspond pas au corps spécifié';
  END IF;
  
  -- Vérifier que l'échelle appartient bien au grade
  SELECT EXISTS (
    SELECT 1 FROM echelles 
    WHERE id = p_echelle_id AND grade_id = p_grade_id
  ) INTO echelle_valide;
  
  IF NOT echelle_valide THEN
    RAISE EXCEPTION 'L''échelle ne correspond pas au grade spécifié';
  END IF;
  
  -- Vérifier que l'échelon appartient bien à l'échelle
  IF p_echelon_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM echelons 
      WHERE id = p_echelon_id AND echelle_id = p_echelle_id
    ) INTO echelon_valide;
    
    IF NOT echelon_valide THEN
      RAISE EXCEPTION 'L''échelon ne correspond pas à l''échelle spécifiée';
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;