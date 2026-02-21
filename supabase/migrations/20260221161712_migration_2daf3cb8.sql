-- Créer la table informations_financieres pour stocker les données financières des agents
CREATE TABLE IF NOT EXISTS informations_financieres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Salaire de base et composantes
  salaire_base NUMERIC(12, 2) NOT NULL DEFAULT 0,
  indemnite_logement NUMERIC(12, 2) DEFAULT 0,
  indemnite_transport NUMERIC(12, 2) DEFAULT 0,
  indemnite_fonction NUMERIC(12, 2) DEFAULT 0,
  prime_rendement NUMERIC(12, 2) DEFAULT 0,
  autres_primes NUMERIC(12, 2) DEFAULT 0,
  
  -- Total et déductions
  total_brut NUMERIC(12, 2) GENERATED ALWAYS AS (
    salaire_base + COALESCE(indemnite_logement, 0) + COALESCE(indemnite_transport, 0) + 
    COALESCE(indemnite_fonction, 0) + COALESCE(prime_rendement, 0) + COALESCE(autres_primes, 0)
  ) STORED,
  cotisation_cnss NUMERIC(12, 2) DEFAULT 0,
  cotisation_cnamgs NUMERIC(12, 2) DEFAULT 0,
  impot_sur_revenu NUMERIC(12, 2) DEFAULT 0,
  autres_retenues NUMERIC(12, 2) DEFAULT 0,
  total_retenues NUMERIC(12, 2) GENERATED ALWAYS AS (
    COALESCE(cotisation_cnss, 0) + COALESCE(cotisation_cnamgs, 0) + 
    COALESCE(impot_sur_revenu, 0) + COALESCE(autres_retenues, 0)
  ) STORED,
  net_a_payer NUMERIC(12, 2) GENERATED ALWAYS AS (
    (salaire_base + COALESCE(indemnite_logement, 0) + COALESCE(indemnite_transport, 0) + 
     COALESCE(indemnite_fonction, 0) + COALESCE(prime_rendement, 0) + COALESCE(autres_primes, 0)) -
    (COALESCE(cotisation_cnss, 0) + COALESCE(cotisation_cnamgs, 0) + 
     COALESCE(impot_sur_revenu, 0) + COALESCE(autres_retenues, 0))
  ) STORED,
  
  -- Informations bancaires
  numero_compte TEXT,
  banque TEXT,
  
  -- Métadonnées
  derniere_mise_a_jour DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_informations_financieres_agent_id ON informations_financieres(agent_id);

-- RLS policies
ALTER TABLE informations_financieres ENABLE ROW LEVEL SECURITY;

-- Policy: Les agents peuvent voir leurs propres informations financières
CREATE POLICY "Agents can view their own financial info" ON informations_financieres
  FOR SELECT USING (
    agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid())
  );

-- Policy: Les RH et admins peuvent voir toutes les informations financières de leur ministère
CREATE POLICY "RH and admins can view ministry financial info" ON informations_financieres
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN agents a ON a.id = informations_financieres.agent_id
      WHERE p.id = auth.uid()
      AND p.role IN ('rh_ministere', 'rh_central', 'admin_ministere', 'admin')
      AND (p.ministere_id = a.ministere_id OR p.role IN ('admin', 'rh_central'))
    )
  );

-- Policy: Seuls les RH et admins peuvent modifier les informations financières
CREATE POLICY "RH and admins can modify financial info" ON informations_financieres
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN agents a ON a.id = informations_financieres.agent_id
      WHERE p.id = auth.uid()
      AND p.role IN ('rh_ministere', 'rh_central', 'admin_ministere', 'admin')
      AND (p.ministere_id = a.ministere_id OR p.role IN ('admin', 'rh_central'))
    )
  );

COMMENT ON TABLE informations_financieres IS 'Informations financières et de paie des agents publics';