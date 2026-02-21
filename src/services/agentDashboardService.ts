import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type RappelSolde = Database["public"]["Tables"]["rappels_solde"]["Row"];
type MessageAgent = Database["public"]["Tables"]["messages_agents"]["Row"];

export interface RappelFinancier {
  total_rappel: number;
  total_percu: number;
  solde_restant: number;
  rappels: RappelSolde[];
}

export interface MessageWithSender extends MessageAgent {
  expediteur: {
    nom: string;
    prenoms: string;
  } | null;
}

export interface AgentCareerTimeline {
  date_recrutement?: string;
  date_integration?: string;
  date_titularisation?: string;
  date_prise_service?: string;
  date_reprise_service?: string;
  date_reclassement?: string;
  date_mise_en_retraite?: string;
}

export interface AgentCompletProfile {
  id: string;
  matricule: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone?: string;
  date_naissance?: string;
  lieu_naissance?: string;
  situation_matrimoniale?: string;
  nombre_enfants?: number;
  adresse_actuelle?: string;
  
  // Informations professionnelles enrichies
  date_recrutement?: string;
  date_integration?: string;
  date_titularisation?: string;
  date_prise_service?: string;
  date_reprise_service?: string;
  date_reclassement?: string;
  date_mise_en_retraite?: string;
  lieu_affectation_actuel?: string;
  etablissement_affectation?: string;
  
  ministere?: {
    nom: string;
    sigle: string;
  };
  corps?: {
    nom: string;
    code: string;
  };
  grade?: {
    nom: string;
    code: string;
  };
  informations_financieres?: {
    salaire_base: number;
    indemnite_logement: number;
    indemnite_transport: number;
    total_brut: number;
    total_retenues: number;
    net_a_payer: number;
    numero_compte?: string;
    banque?: string;
  };
}

export const agentDashboardService = {
  /**
   * Récupérer le profil complet de l'agent avec toutes les informations
   */
  async getAgentCompletProfile(userId: string): Promise<{ data: AgentCompletProfile | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("agents")
        .select(`
          *,
          ministere:ministere_id (nom, sigle),
          corps:corps_id (nom, code),
          grade:grade_id (nom, code),
          informations_financieres:informations_financieres_id (
            salaire_base,
            indemnite_logement,
            indemnite_transport,
            total_brut,
            total_retenues,
            net_a_payer,
            numero_compte,
            banque
          )
        `)
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("❌ Erreur profil agent:", error);
        return { data: null, error: error.message };
      }

      return { data: data as any, error: null };
    } catch (error: any) {
      console.error("❌ Erreur getAgentCompletProfile:", error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Récupérer la timeline de carrière de l'agent
   */
  async getCareerTimeline(agentId: string): Promise<{ data: AgentCareerTimeline | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("agents")
        .select(`
          date_recrutement,
          date_integration,
          date_titularisation,
          date_prise_service,
          date_reprise_service,
          date_reclassement,
          date_mise_en_retraite
        `)
        .eq("id", agentId)
        .single();

      if (error) {
        console.error("❌ Erreur timeline:", error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error("❌ Erreur getCareerTimeline:", error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Récupérer le résumé financier de l'agent (rappels de solde)
   */
  async getRappelsFinanciers(agentId: string): Promise<{ data: RappelFinancier | null; error: string | null }> {
    try {
      const { data: rappels, error } = await supabase
        .from("rappels_solde")
        .select("*")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Erreur rappels:", error);
        return { data: null, error: error.message };
      }

      const total_rappel = (rappels || []).reduce((sum, r) => sum + Number(r.montant_total), 0);
      const total_percu = (rappels || []).reduce((sum, r) => sum + Number(r.montant_paye || 0), 0);
      const solde_restant = (rappels || []).reduce((sum, r) => sum + Number(r.montant_restant), 0);

      return {
        data: {
          total_rappel,
          total_percu,
          solde_restant,
          rappels: rappels || []
        },
        error: null
      };
    } catch (error: any) {
      console.error("❌ Erreur getRappelsFinanciers:", error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Récupérer les messages reçus par l'agent
   */
  async getMessages(agentId: string, limit = 50): Promise<{ data: MessageWithSender[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("messages_agents")
        .select(`
          *,
          expediteur:expediteur_id (
            nom,
            prenoms
          )
        `)
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("❌ Erreur messages:", error);
        return { data: null, error: error.message };
      }

      const formattedData: MessageWithSender[] = (data || []).map((msg: any) => ({
        ...msg,
        expediteur: msg.expediteur ? {
          nom: msg.expediteur.nom,
          prenoms: msg.expediteur.prenoms
        } : null
      }));

      return { data: formattedData, error: null };
    } catch (error: any) {
      console.error("❌ Erreur getMessages:", error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Marquer un message comme lu
   */
  async markMessageAsRead(messageId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from("messages_agents")
        .update({
          lu: true,
          date_lecture: new Date().toISOString()
        })
        .eq("id", messageId);

      if (error) {
        console.error("❌ Erreur markMessageAsRead:", error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error: any) {
      console.error("❌ Erreur markMessageAsRead:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Compter les messages non lus
   */
  async countUnreadMessages(agentId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("messages_agents")
        .select("*", { count: "exact", head: true })
        .eq("agent_id", agentId)
        .eq("lu", false);

      if (error) {
        console.error("❌ Erreur count messages:", error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error("❌ Erreur countUnreadMessages:", error);
      return 0;
    }
  },

  /**
   * Calculer les statistiques de carrière
   */
  calculateCareerStats(agent: AgentCompletProfile) {
    const now = new Date();
    
    // Calcul de l'ancienneté
    let anciennete = 0;
    if (agent.date_recrutement) {
      const dateRecrutement = new Date(agent.date_recrutement);
      anciennete = Math.floor((now.getTime() - dateRecrutement.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    }

    // Calcul des années jusqu'à la retraite
    let anneesJusquaRetraite = null;
    if (agent.date_mise_en_retraite) {
      const dateMiseRetraite = new Date(agent.date_mise_en_retraite);
      anneesJusquaRetraite = Math.max(0, Math.floor((dateMiseRetraite.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365.25)));
    }

    // Calcul de l'âge
    let age = null;
    if (agent.date_naissance) {
      const dateNaissance = new Date(agent.date_naissance);
      age = Math.floor((now.getTime() - dateNaissance.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    }

    return {
      anciennete,
      anneesJusquaRetraite,
      age
    };
  }
};