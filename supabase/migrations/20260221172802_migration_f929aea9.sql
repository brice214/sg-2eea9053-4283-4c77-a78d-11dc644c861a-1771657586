-- Table pour les rappels de solde (arriérés de salaire)
CREATE TABLE IF NOT EXISTS rappels_solde (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Informations du rappel
  periode_debut DATE NOT NULL,
  periode_fin DATE NOT NULL,
  montant_total NUMERIC(12,2) NOT NULL,
  montant_paye NUMERIC(12,2) DEFAULT 0,
  montant_restant NUMERIC(12,2) NOT NULL,
  
  -- Détails
  type_rappel VARCHAR(50) NOT NULL, -- promotion, regularisation, avancement, indemnite
  motif TEXT,
  numero_decision VARCHAR(100),
  date_decision DATE,
  
  -- Statut
  statut VARCHAR(30) DEFAULT 'EN_ATTENTE',
  date_paiement_prevu DATE,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT check_type_rappel CHECK (type_rappel IN ('promotion', 'regularisation', 'avancement', 'indemnite', 'autre')),
  CONSTRAINT check_statut_rappel CHECK (statut IN ('EN_ATTENTE', 'EN_COURS', 'PAYE', 'ANNULE'))
);

-- Index pour les rappels
CREATE INDEX IF NOT EXISTS idx_rappels_agent ON rappels_solde(agent_id);
CREATE INDEX IF NOT EXISTS idx_rappels_statut ON rappels_solde(statut);

-- Table pour la messagerie (alertes DCRH → Agent)
CREATE TABLE IF NOT EXISTS messages_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Destinataire
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Expéditeur
  expediteur_id UUID NOT NULL REFERENCES profiles(id),
  expediteur_nom TEXT NOT NULL,
  expediteur_role VARCHAR(50),
  
  -- Contenu du message
  sujet TEXT NOT NULL,
  contenu TEXT NOT NULL,
  priorite VARCHAR(20) DEFAULT 'normale',
  categorie VARCHAR(50),
  
  -- Pièce jointe (optionnelle)
  fichier_url TEXT,
  fichier_nom VARCHAR(255),
  
  -- Statut de lecture
  lu BOOLEAN DEFAULT FALSE,
  date_lecture TIMESTAMPTZ,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT check_priorite CHECK (priorite IN ('basse', 'normale', 'haute', 'urgente')),
  CONSTRAINT check_categorie CHECK (categorie IN ('information', 'alerte', 'document', 'convocation', 'autre'))
);

-- Index pour les messages
CREATE INDEX IF NOT EXISTS idx_messages_agent ON messages_agents(agent_id);
CREATE INDEX IF NOT EXISTS idx_messages_lu ON messages_agents(lu);
CREATE INDEX IF NOT EXISTS idx_messages_date ON messages_agents(created_at DESC);

-- RLS pour rappels_solde
ALTER TABLE rappels_solde ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view their own rappels"
  ON rappels_solde FOR SELECT
  USING (agent_id IN (
    SELECT id FROM agents WHERE user_id = auth.uid()
  ));

CREATE POLICY "RH and admins can manage rappels"
  ON rappels_solde FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN agents a ON a.id = rappels_solde.agent_id
      WHERE p.id = auth.uid()
        AND p.role IN ('rh_ministere', 'rh_central', 'admin_ministere', 'admin')
        AND (p.ministere_id = a.ministere_id OR p.role IN ('admin', 'rh_central'))
    )
  );

-- RLS pour messages_agents
ALTER TABLE messages_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view their own messages"
  ON messages_agents FOR SELECT
  USING (agent_id IN (
    SELECT id FROM agents WHERE user_id = auth.uid()
  ));

CREATE POLICY "Agents can update read status"
  ON messages_agents FOR UPDATE
  USING (agent_id IN (
    SELECT id FROM agents WHERE user_id = auth.uid()
  ))
  WITH CHECK (agent_id IN (
    SELECT id FROM agents WHERE user_id = auth.uid()
  ));

CREATE POLICY "RH and admins can send messages"
  ON messages_agents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('rh_ministere', 'rh_central', 'admin_ministere', 'admin')
    )
  );

-- Commentaires
COMMENT ON TABLE rappels_solde IS 'Gestion des rappels de solde et arriérés de salaire des agents';
COMMENT ON TABLE messages_agents IS 'Messagerie unidirectionnelle DCRH → Agent pour les alertes et notifications';