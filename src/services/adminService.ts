import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Agent = Database["public"]["Tables"]["agents"]["Row"];
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

export interface AdminStats {
  total_agents: number;
  total_rh: number;
  total_dcrh: number;
  dcrh_actif: Profile | null;
}

export const adminService = {
  /**
   * Récupérer les statistiques du ministère
   */
  async getMinistereStats(ministere_id: string): Promise<AdminStats> {
    try {
      // Total agents du ministère
      const { count: total_agents } = await supabase
        .from("agents")
        .select("id", { count: "exact", head: true })
        .eq("ministere_id", ministere_id)
        .eq("actif", true);

      // Total RH
      const { count: total_rh } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("ministere_id", ministere_id)
        .eq("role", "rh_ministere")
        .eq("actif", true);

      // Total DCRH (devrait être 0 ou 1)
      const { data: dcrh_profiles, count: total_dcrh } = await supabase
        .from("profiles")
        .select("*")
        .eq("ministere_id", ministere_id)
        .eq("role", "rh_central")
        .eq("actif", true);

      return {
        total_agents: total_agents || 0,
        total_rh: total_rh || 0,
        total_dcrh: total_dcrh || 0,
        dcrh_actif: dcrh_profiles && dcrh_profiles.length > 0 ? dcrh_profiles[0] : null
      };
    } catch (error) {
      console.error("Erreur récupération stats:", error);
      return {
        total_agents: 0,
        total_rh: 0,
        total_dcrh: 0,
        dcrh_actif: null
      };
    }
  },

  /**
   * Rechercher des agents existants dans le ministère
   */
  async searchAgents(ministere_id: string, search: string): Promise<{ agents: any[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("agents")
        .select(`
          *,
          corps:corps_id(nom),
          grade:grade_id(nom),
          poste:poste_id(intitule)
        `)
        .eq("ministere_id", ministere_id)
        .eq("actif", true)
        .or(`nom.ilike.%${search}%,prenoms.ilike.%${search}%,matricule.ilike.%${search}%,email.ilike.%${search}%`)
        .limit(10);

      if (error) {
        return { agents: [], error: error.message };
      }

      return { agents: data || [], error: null };
    } catch (error: any) {
      return { agents: [], error: error.message || "Erreur lors de la recherche" };
    }
  },

  /**
   * Vérifier si un agent a déjà un compte utilisateur
   */
  async checkIfAgentHasAccount(agent_id: string): Promise<{ hasAccount: boolean; profile: Profile | null }> {
    try {
      // Chercher l'agent
      const { data: agent } = await supabase
        .from("agents")
        .select("user_id")
        .eq("id", agent_id)
        .single();

      if (!agent || !agent.user_id) {
        return { hasAccount: false, profile: null };
      }

      // Chercher le profil
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", agent.user_id)
        .single();

      return { hasAccount: true, profile: profile || null };
    } catch (error) {
      return { hasAccount: false, profile: null };
    }
  },

  /**
   * Promouvoir un agent existant en RH
   */
  async promoteToRH(
    agent_id: string,
    ministere_id: string,
    admin_id: string
  ): Promise<{ success: boolean; profile: Profile | null; error: string | null }> {
    try {
      // 1. Récupérer l'agent
      const { data: agent, error: agentError } = await supabase
        .from("agents")
        .select("*")
        .eq("id", agent_id)
        .single();

      if (agentError || !agent) {
        return { success: false, profile: null, error: "Agent non trouvé" };
      }

      // 2. Vérifier si l'agent a déjà un compte
      const { hasAccount, profile: existingProfile } = await this.checkIfAgentHasAccount(agent_id);

      let profileId: string;

      if (hasAccount && existingProfile) {
        // Mettre à jour le rôle existant
        const { data: updatedProfile, error: updateError } = await supabase
          .from("profiles")
          .update({ role: "rh_ministere" })
          .eq("id", existingProfile.id)
          .select()
          .single();

        if (updateError) {
          return { success: false, profile: null, error: updateError.message };
        }

        profileId = existingProfile.id;
      } else {
        // Créer un nouveau compte utilisateur
        const tempPassword = `RH_${agent.matricule}_${Date.now().toString().slice(-4)}`;
        
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: agent.email || `${agent.matricule}@administration.ga`,
          password: tempPassword,
          email_confirm: true
        });

        if (authError || !authData.user) {
          return { success: false, profile: null, error: "Erreur lors de la création du compte: " + authError?.message };
        }

        // Créer le profil
        const { data: newProfile, error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: authData.user.id,
            email: agent.email || `${agent.matricule}@administration.ga`,
            full_name: `${agent.nom} ${agent.prenoms}`,
            role: "rh_ministere",
            ministere_id: ministere_id,
            direction_id: agent.direction_id,
            service_id: agent.service_id
          })
          .select()
          .single();

        if (profileError) {
          return { success: false, profile: null, error: profileError.message };
        }

        // Lier l'agent au compte utilisateur
        await supabase
          .from("agents")
          .update({ user_id: authData.user.id })
          .eq("id", agent_id);

        profileId = authData.user.id;
      }

      // Récupérer le profil final
      const { data: finalProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      return { success: true, profile: finalProfile, error: null };
    } catch (error: any) {
      return { success: false, profile: null, error: error.message || "Erreur lors de la promotion" };
    }
  },

  /**
   * Vérifier s'il existe un DCRH actif pour le ministère
   */
  async checkActiveDCRH(ministere_id: string): Promise<{ exists: boolean; dcrh: Profile | null }> {
    try {
      const { data, count } = await supabase
        .from("profiles")
        .select("*")
        .eq("ministere_id", ministere_id)
        .eq("role", "rh_central")
        .eq("actif", true);

      return {
        exists: (count || 0) > 0,
        dcrh: data && data.length > 0 ? data[0] : null
      };
    } catch (error) {
      return { exists: false, dcrh: null };
    }
  },

  /**
   * Verrouiller le DCRH actuel
   */
  async lockCurrentDCRH(
    ministere_id: string,
    admin_id: string,
    raison: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      // 1. Vérifier s'il y a un DCRH actif
      const { exists, dcrh } = await this.checkActiveDCRH(ministere_id);

      if (!exists || !dcrh) {
        return { success: false, error: "Aucun DCRH actif à verrouiller" };
      }

      // 2. Désactiver le compte DCRH
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ actif: false })
        .eq("id", dcrh.id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // 3. Enregistrer le verrouillage
      const { error: lockError } = await supabase
        .from("dcrh_locks")
        .insert({
          ministere_id,
          ancien_dcrh_id: dcrh.id,
          verrouille_par: admin_id,
          raison,
          actif: true
        });

      if (lockError) {
        console.error("Erreur enregistrement verrouillage:", lockError);
        // On continue même si l'enregistrement du lock échoue
      }

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message || "Erreur lors du verrouillage" };
    }
  },

  /**
   * Promouvoir un agent existant en DCRH (après verrouillage du DCRH actuel)
   */
  async promoteToDCRH(
    agent_id: string,
    ministere_id: string,
    admin_id: string
  ): Promise<{ success: boolean; profile: Profile | null; error: string | null }> {
    try {
      // 1. Vérifier s'il y a déjà un DCRH actif
      const { exists } = await this.checkActiveDCRH(ministere_id);

      if (exists) {
        return { 
          success: false, 
          profile: null, 
          error: "Un DCRH est déjà actif. Veuillez d'abord le verrouiller." 
        };
      }

      // 2. Récupérer l'agent
      const { data: agent, error: agentError } = await supabase
        .from("agents")
        .select("*")
        .eq("id", agent_id)
        .single();

      if (agentError || !agent) {
        return { success: false, profile: null, error: "Agent non trouvé" };
      }

      // 3. Vérifier si l'agent a déjà un compte
      const { hasAccount, profile: existingProfile } = await this.checkIfAgentHasAccount(agent_id);

      let profileId: string;

      if (hasAccount && existingProfile) {
        // Mettre à jour le rôle existant
        const { data: updatedProfile, error: updateError } = await supabase
          .from("profiles")
          .update({ role: "rh_central", actif: true })
          .eq("id", existingProfile.id)
          .select()
          .single();

        if (updateError) {
          return { success: false, profile: null, error: updateError.message };
        }

        profileId = existingProfile.id;
      } else {
        // Créer un nouveau compte utilisateur
        const tempPassword = `DCRH_${agent.matricule}_${Date.now().toString().slice(-4)}`;
        
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: agent.email || `dcrh.${agent.matricule}@administration.ga`,
          password: tempPassword,
          email_confirm: true
        });

        if (authError || !authData.user) {
          return { success: false, profile: null, error: "Erreur lors de la création du compte: " + authError?.message };
        }

        // Créer le profil
        const { data: newProfile, error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: authData.user.id,
            email: agent.email || `dcrh.${agent.matricule}@administration.ga`,
            full_name: `${agent.nom} ${agent.prenoms}`,
            role: "rh_central",
            ministere_id: ministere_id,
            direction_id: agent.direction_id,
            service_id: agent.service_id,
            actif: true
          })
          .select()
          .single();

        if (profileError) {
          return { success: false, profile: null, error: profileError.message };
        }

        // Lier l'agent au compte utilisateur
        await supabase
          .from("agents")
          .update({ user_id: authData.user.id })
          .eq("id", agent_id);

        profileId = authData.user.id;
      }

      // Récupérer le profil final
      const { data: finalProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      return { success: true, profile: finalProfile, error: null };
    } catch (error: any) {
      return { success: false, profile: null, error: error.message || "Erreur lors de la promotion" };
    }
  },

  /**
   * Récupérer la liste des RH du ministère
   */
  async getRHList(ministere_id: string): Promise<{ rh_list: any[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          ministeres:ministere_id(nom, sigle)
        `)
        .eq("ministere_id", ministere_id)
        .eq("role", "rh_ministere")
        .eq("actif", true)
        .order("created_at", { ascending: false });

      if (error) {
        return { rh_list: [], error: error.message };
      }

      return { rh_list: data || [], error: null };
    } catch (error: any) {
      return { rh_list: [], error: error.message || "Erreur lors de la récupération" };
    }
  },

  /**
   * Révoquer un rôle RH
   */
  async revokeRHRole(profile_id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: "agent" })
        .eq("id", profile_id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message || "Erreur lors de la révocation" };
    }
  }
};