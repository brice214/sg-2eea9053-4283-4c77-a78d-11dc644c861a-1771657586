import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Agent = Database["public"]["Tables"]["agents"]["Row"];
type AgentInsert = Database["public"]["Tables"]["agents"]["Insert"];
type Document = Database["public"]["Tables"]["documents_agents"]["Row"];
type DocumentInsert = Database["public"]["Tables"]["documents_agents"]["Insert"];

export interface AgentFormData {
  // Informations personnelles
  nom: string;
  prenoms: string;
  date_naissance: string;
  lieu_naissance: string;
  sexe: "M" | "F";
  nationalite: string;
  situation_matrimoniale: "CELIBATAIRE" | "MARIE" | "DIVORCE" | "VEUF";
  nombre_enfants: number;
  
  // Contact
  telephone: string;
  email: string;
  adresse: string;
  
  // Informations administratives
  ministere_id: string;
  direction_id: string | null;
  service_id: string | null;
  poste_id: string;
  corps_id: string;
  grade_id: string;
  echelle_id: string;
  echelon_id: string;
  
  // Recrutement
  mode_recrutement: "CONCOURS" | "CONTRACTUEL" | "DETACHEMENT" | "MUTATION";
  date_prise_service: string;
  date_integration: string | null;
  numero_decision_recrutement: string;
  date_decision_recrutement: string;
  
  // Documents
  documents: Array<{
    type_document_id: string;
    fichier?: File;
    numero_piece?: string;
    date_emission?: string;
    date_expiration?: string;
  }>;
}

export const agentService = {
  /**
   * Créer un nouveau dossier administratif d'agent
   */
  async createAgent(data: AgentFormData): Promise<{ agent: Agent | null; error: string | null }> {
    try {
      // 1. Valider la cohérence corps → grade → échelle → échelon
      const validationError = await this.validateHierarchy(
        data.corps_id,
        data.grade_id,
        data.echelle_id,
        data.echelon_id
      );
      
      if (validationError) {
        return { agent: null, error: validationError };
      }

      // 2. Vérifier que le poste existe et est disponible
      const { data: poste, error: posteError } = await supabase
        .from("postes")
        .select("*")
        .eq("id", data.poste_id)
        .eq("actif", true)
        .single();

      if (posteError || !poste) {
        return { agent: null, error: "Le poste sélectionné n'existe pas ou n'est pas actif" };
      }

      // 3. Créer l'agent (le matricule sera généré automatiquement par le trigger)
      const agentData: AgentInsert = {
        nom: data.nom,
        prenoms: data.prenoms,
        date_naissance: data.date_naissance,
        lieu_naissance: data.lieu_naissance,
        sexe: data.sexe,
        nationalite: data.nationalite,
        situation_matrimoniale: data.situation_matrimoniale,
        nombre_enfants: data.nombre_enfants,
        telephone: data.telephone,
        email: data.email,
        adresse: data.adresse,
        ministere_id: data.ministere_id,
        direction_id: data.direction_id,
        service_id: data.service_id,
        poste_id: data.poste_id,
        corps_id: data.corps_id,
        grade_id: data.grade_id,
        echelle_id: data.echelle_id,
        echelon_id: data.echelon_id,
        mode_recrutement: data.mode_recrutement,
        date_prise_service: data.date_prise_service,
        date_integration: data.date_integration,
        numero_decision_recrutement: data.numero_decision_recrutement,
        date_decision_recrutement: data.date_decision_recrutement,
        statut: "STAGIAIRE",
        situation_administrative: "EN_SERVICE"
      };

      const { data: newAgent, error: agentError } = await supabase
        .from("agents")
        .insert(agentData)
        .select()
        .single();

      if (agentError) {
        console.error("Erreur création agent:", agentError);
        return { agent: null, error: `Erreur lors de la création de l'agent: ${agentError.message}` };
      }

      // 4. Créer les entrées de documents (sans fichiers pour l'instant)
      if (data.documents && data.documents.length > 0) {
        const documentsData: DocumentInsert[] = data.documents.map(doc => ({
          agent_id: newAgent.id,
          type_document_id: doc.type_document_id,
          numero_piece: doc.numero_piece || null,
          date_emission: doc.date_emission || null,
          date_expiration: doc.date_expiration || null,
          statut: "EN_ATTENTE"
        }));

        const { error: docsError } = await supabase
          .from("documents_agents")
          .insert(documentsData);

        if (docsError) {
          console.error("Erreur création documents:", docsError);
          // On continue même si les documents ne sont pas créés
        }
      }

      return { agent: newAgent, error: null };
    } catch (error) {
      console.error("Erreur inattendue:", error);
      return { agent: null, error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Valider la hiérarchie corps → grade → échelle → échelon
   */
  async validateHierarchy(
    corps_id: string,
    grade_id: string,
    echelle_id: string,
    echelon_id: string
  ): Promise<string | null> {
    try {
      // Vérifier que le grade appartient bien au corps
      const { data: grade, error: gradeError } = await supabase
        .from("grades")
        .select("*")
        .eq("id", grade_id)
        .eq("corps_id", corps_id)
        .single();

      if (gradeError || !grade) {
        return "Le grade sélectionné n'appartient pas au corps choisi";
      }

      // Vérifier que l'échelle correspond au grade
      const { data: echelle, error: echelleError } = await supabase
        .from("echelles")
        .select("*")
        .eq("id", echelle_id)
        .eq("categorie", grade.categorie)
        .single();

      if (echelleError || !echelle) {
        return "L'échelle sélectionnée ne correspond pas à la catégorie du grade";
      }

      // Vérifier que l'échelon appartient à l'échelle
      const { data: echelon, error: echelonError } = await supabase
        .from("echelons")
        .select("*")
        .eq("id", echelon_id)
        .eq("echelle_id", echelle_id)
        .single();

      if (echelonError || !echelon) {
        return "L'échelon sélectionné n'appartient pas à l'échelle choisie";
      }

      return null;
    } catch (error) {
      return "Erreur lors de la validation de la hiérarchie";
    }
  },

  /**
   * Récupérer la liste des agents avec filtres
   */
  async getAgents(filters?: {
    ministere_id?: string;
    statut?: string;
    search?: string;
  }): Promise<{ agents: Agent[]; error: string | null }> {
    try {
      let query = supabase
        .from("agents")
        .select(`
          *,
          ministeres(nom),
          corps(intitule),
          grades(intitule),
          postes(intitule)
        `)
        .order("created_at", { ascending: false });

      if (filters?.ministere_id) {
        query = query.eq("ministere_id", filters.ministere_id);
      }

      if (filters?.statut) {
        query = query.eq("statut", filters.statut);
      }

      if (filters?.search) {
        query = query.or(`nom.ilike.%${filters.search}%,prenoms.ilike.%${filters.search}%,matricule.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erreur récupération agents:", error);
        return { agents: [], error: error.message };
      }

      return { agents: data || [], error: null };
    } catch (error) {
      return { agents: [], error: "Erreur lors de la récupération des agents" };
    }
  },

  /**
   * Récupérer les statistiques du tableau de bord RH
   */
  async getStatistics(ministere_id?: string): Promise<{
    total_agents: number;
    stagiaires: number;
    titulaires: number;
    en_attente_validation: number;
  }> {
    try {
      let query = supabase.from("agents").select("statut", { count: "exact" });
      
      if (ministere_id) {
        query = query.eq("ministere_id", ministere_id);
      }

      const { count: total } = await query;
      const { count: stagiaires } = await query.eq("statut", "STAGIAIRE");
      const { count: titulaires } = await query.eq("statut", "TITULAIRE");
      const { count: en_attente } = await query.eq("statut", "EN_ATTENTE_VALIDATION");

      return {
        total_agents: total || 0,
        stagiaires: stagiaires || 0,
        titulaires: titulaires || 0,
        en_attente_validation: en_attente || 0
      };
    } catch (error) {
      console.error("Erreur statistiques:", error);
      return {
        total_agents: 0,
        stagiaires: 0,
        titulaires: 0,
        en_attente_validation: 0
      };
    }
  },

  /**
   * Récupérer les ministères
   */
  async getMinisteres() {
    const { data, error } = await supabase
      .from("ministeres")
      .select("*")
      .eq("actif", true)
      .order("nom");

    return { data: data || [], error };
  },

  /**
   * Récupérer les corps
   */
  async getCorps() {
    const { data, error } = await supabase
      .from("corps")
      .select("*")
      .eq("actif", true)
      .order("intitule");

    return { data: data || [], error };
  },

  /**
   * Récupérer les grades d'un corps
   */
  async getGradesByCorps(corps_id: string) {
    const { data, error } = await supabase
      .from("grades")
      .select("*")
      .eq("corps_id", corps_id)
      .eq("actif", true)
      .order("ordre_hierarchique", { ascending: false });

    return { data: data || [], error };
  },

  /**
   * Récupérer les échelles par catégorie
   */
  async getEchellesByCategorie(categorie: string) {
    const { data, error } = await supabase
      .from("echelles")
      .select("*")
      .eq("categorie", categorie)
      .eq("active", true)
      .order("lettre");

    return { data: data || [], error };
  },

  /**
   * Récupérer les échelons d'une échelle
   */
  async getEchelonsByEchelle(echelle_id: string) {
    const { data, error } = await supabase
      .from("echelons")
      .select("*")
      .eq("echelle_id", echelle_id)
      .order("numero");

    return { data: data || [], error };
  },

  /**
   * Récupérer les postes
   */
  async getPostes() {
    const { data, error } = await supabase
      .from("postes")
      .select("*")
      .eq("actif", true)
      .order("intitule");

    return { data: data || [], error };
  },

  /**
   * Récupérer les types de documents
   */
  async getTypesDocuments() {
    const { data, error } = await supabase
      .from("types_documents")
      .select("*")
      .eq("actif", true)
      .order("ordre");

    return { data: data || [], error };
  }
};