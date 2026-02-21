-- Créer une table pour tracer les verrouillages de DCRH
CREATE TABLE IF NOT EXISTS dcrh_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ministere_id UUID NOT NULL REFERENCES ministeres(id) ON DELETE CASCADE,
  ancien_dcrh_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verrouille_par UUID NOT NULL REFERENCES profiles(id),
  date_verrouillage TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  raison TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_dcrh_locks_ministere ON dcrh_locks(ministere_id);
CREATE INDEX IF NOT EXISTS idx_dcrh_locks_actif ON dcrh_locks(actif);

-- Commentaire
COMMENT ON TABLE dcrh_locks IS 'Historique des verrouillages de comptes DCRH (un seul DCRH actif par ministère)';