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
  expediteur?: {
    nom: string;
    prenoms: string;
  };
}

export const agentDashboardService = {
  /**
   * Récupérer le résumé financier de l'agent (rappels de solde)
   */
  async getRappelsFinanciers(agentId: string): Promise<{ data: RappelFinancier | null; error: string | null }> {
    try {
      const { data: rappels, error } = await supabase
        .from("rappels_solde")
        .select("*")
        .eq("agent_id", agentId)
        .order("date_creation", { ascending: false });

      if (error) {
        console.error("❌ Erreur rappels:", error);
        return { data: null, error: error.message };
      }

      const total_rappel = (rappels || []).reduce((sum, r) => sum + r.montant_total, 0);
      const total_percu = (rappels || []).reduce((sum, r) => sum + r.montant_percu, 0);
      const solde_restant = (rappels || []).reduce((sum, r) => sum + r.solde_restant, 0);

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
        .order("date_envoi", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("❌ Erreur messages:", error);
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
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
  }
};