import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Agent = Database["public"]["Tables"]["agents"]["Row"];
type AgentInsert = Database["public"]["Tables"]["agents"]["Insert"];
// Utilisation de documents_administratifs au lieu de documents_agents
type Document = Database["public"]["Tables"]["documents_administratifs"]["Row"];
type DocumentInsert = Database["public"]["Tables"]["documents_administratifs"]["Insert"];

export interface AgentFormData {
  // Informations personnelles
  nom: string;
  prenoms: string;
  date_naissance: string;
  lieu_naissance: string;
  sexe: "M" | "F";
  nationalite: string;
  situation_matrimoniale: string;
  nombre_enfants: number;
  
  // Contact
  telephone: string;
  email: string;
  adresse: string; // Sera mappé vers adresse_actuelle
  
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
  mode_recrutement: string;
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

      // 3. Préparer les données de l'agent
      // Génération d'un matricule temporaire si le trigger ne le fait pas (fallback)
      const tempMatricule = `TEMP-${Date.now().toString().slice(-6)}`;

      const agentData: AgentInsert = {
        matricule: tempMatricule, // Sera écrasé par le trigger ou géré ici
        nom: data.nom,
        prenoms: data.prenoms,
        date_naissance: data.date_naissance,
        lieu_naissance: data.lieu_naissance,
        sexe: data.sexe,
        nationalite: data.nationalite,
        situation_matrimoniale: data.situation_matrimoniale.toLowerCase(), // Force lowercase to match DB constraint
        nombre_enfants: data.nombre_enfants,
        telephone: data.telephone,
        email: data.email,
        adresse_actuelle: data.adresse, // Mapping correct
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
        // date_integration n'existe pas dans le schéma actuel, on l'ignore ou on l'ajoute si nécessaire
        numero_decision_recrutement: data.numero_decision_recrutement,
        date_decision_recrutement: data.date_decision_recrutement,
        date_recrutement: data.date_decision_recrutement, // Champ obligatoire dans le schéma
        diplome_principal: "Non renseigné", // Champ obligatoire, à demander dans le formulaire plus tard
        statut: "EN_ATTENTE_VALIDATION",
        actif: true
      };

      console.log("🔍 [createAgent] AGENT DATA TO INSERT:", JSON.stringify(agentData, null, 2));
      console.log("🔍 [createAgent] situation_matrimoniale VALUE:", agentData.situation_matrimoniale);
      console.log("🔍 [createAgent] situation_matrimoniale TYPE:", typeof agentData.situation_matrimoniale);

      const { data: newAgent, error: agentError } = await supabase
        .from("agents")
        .insert(agentData)
        .select()
        .single();

      if (agentError) {
        console.error("Erreur création agent:", agentError);
        return { agent: null, error: `Erreur lors de la création de l'agent: ${agentError.message}` };
      }

      // 4. Créer les entrées de documents
      if (data.documents && data.documents.length > 0) {
        // Récupérer les infos des types de documents pour les intitulés
        const { data: typesDocs } = await supabase.from("types_documents").select("id, nom");
        const typesMap = new Map(typesDocs?.map(t => [t.id, t.nom]) || []);

        const documentsData: DocumentInsert[] = data.documents.map(doc => ({
          agent_id: newAgent.id,
          type_document_id: doc.type_document_id,
          intitule: typesMap.get(doc.type_document_id) || "Document",
          numero_document: doc.numero_piece || null,
          date_emission: doc.date_emission || null,
          date_expiration: doc.date_expiration || null,
          statut: "en_attente"
        }));

        const { error: docsError } = await supabase
          .from("documents_administratifs")
          .insert(documentsData);

        if (docsError) {
          console.error("Erreur création documents:", docsError);
          // On continue même si les documents ne sont pas créés
        }
      }

      return { agent: newAgent, error: null };
    } catch (error: any) {
      console.error("Erreur inattendue:", error);
      return { agent: null, error: error.message || "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Valider la hiérarchie corps → grade → échelle → échelon
   * NOUVELLE LOGIQUE pour la grille indiciaire 2015
   */
  async validateHierarchy(
    corps_id: string,
    grade_id: string,
    echelle_id: string,
    echelon_id: string
  ): Promise<string | null> {
    try {
      // 1. Récupérer le corps pour connaître sa catégorie
      const { data: corps, error: corpsError } = await supabase
        .from("corps")
        .select("categorie")
        .eq("id", corps_id)
        .single();

      if (corpsError || !corps) {
        return "Le corps sélectionné n'existe pas";
      }

      // 2. Vérifier que le grade existe (grades transversaux)
      const { data: grade, error: gradeError } = await supabase
        .from("grades")
        .select("*")
        .eq("id", grade_id)
        .is("corps_id", null) // Grade transversal
        .single();

      if (gradeError || !grade) {
        return "Le grade sélectionné n'existe pas ou n'est pas valide";
      }

      // 3. Vérifier que l'échelle correspond à (catégorie du corps × grade)
      const { data: echelle, error: echelleError } = await supabase
        .from("echelles")
        .select("*")
        .eq("id", echelle_id)
        .eq("categorie", corps.categorie) // Même catégorie que le corps
        .eq("grade_id", grade_id) // Même grade sélectionné
        .single();

      if (echelleError || !echelle) {
        return `L'échelle sélectionnée ne correspond pas à la combinaison catégorie ${corps.categorie} × grade ${grade.nom}`;
      }

      // 4. Vérifier que l'échelon appartient à l'échelle
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
      console.error("Erreur validation hiérarchie:", error);
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
          corps(nom),
          grades(nom),
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
        // Recherche textuelle simple
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
      let query = supabase.from("agents").select("statut", { count: "exact", head: true });
      
      if (ministere_id) {
        query = query.eq("ministere_id", ministere_id);
      }
      const { count: total } = await query;

      // Pour les autres stats, on doit faire des requêtes séparées car on ne peut pas faire de group by count facilement avec l'API simple
      const getCount = async (statut: string) => {
        let q = supabase.from("agents").select("statut", { count: "exact", head: true }).eq("statut", statut);
        if (ministere_id) q = q.eq("ministere_id", ministere_id);
        const { count } = await q;
        return count || 0;
      };

      const [stagiaires, titulaires, en_attente] = await Promise.all([
        getCount("STAGIAIRE"),
        getCount("TITULAIRE"),
        getCount("EN_ATTENTE_VALIDATION")
      ]);

      return {
        total_agents: total || 0,
        stagiaires,
        titulaires,
        en_attente_validation: en_attente
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
   * Récupérer les corps avec leur catégorie
   */
  async getCorps() {
    console.log("🔍 [getCorps] Fetching corps...");
    const { data, error } = await supabase
      .from("corps")
      .select("*")
      .eq("actif", true)
      .order("categorie, nom");

    console.log("🔍 [getCorps] Result:", { count: data?.length || 0, error });
    return { data: data || [], error };
  },

  /**
   * Récupérer les grades transversaux (non liés à un corps spécifique)
   * Ces grades sont issus de la grille indiciaire 2015
   */
  async getGradesTransversaux() {
    console.log("🔍 [getGradesTransversaux] Fetching transversal grades...");
    const { data, error } = await supabase
      .from("grades")
      .select("*")
      .is("corps_id", null) // Grades transversaux uniquement
      .eq("actif", true)
      .order("ordre", { ascending: false });

    console.log("🔍 [getGradesTransversaux] Result:", { count: data?.length || 0, error });
    return { data: data || [], error };
  },

  /**
   * Récupérer les échelles disponibles pour une combinaison corps × grade
   * NOUVELLE LOGIQUE selon la grille indiciaire 2015
   * 
   * @param corps_id - ID du corps (contient la catégorie)
   * @param grade_id - ID du grade (transversal)
   * @returns Échelles correspondant à (catégorie du corps × grade)
   */
  async getEchellesByCorpsAndGrade(corps_id: string, grade_id: string) {
    console.log("🔍 [getEchellesByCorpsAndGrade] Fetching echelles for:", { corps_id, grade_id });
    try {
      // 1. Récupérer la catégorie du corps
      const { data: corps, error: corpsError } = await supabase
        .from("corps")
        .select("categorie")
        .eq("id", corps_id)
        .single();

      if (corpsError || !corps) {
        console.error("❌ [getEchellesByCorpsAndGrade] Corps error:", corpsError);
        return { data: [], error: corpsError };
      }

      console.log("🔍 [getEchellesByCorpsAndGrade] Corps category:", corps.categorie);

      // 2. Récupérer les échelles correspondant à cette catégorie ET ce grade
      const { data, error } = await supabase
        .from("echelles")
        .select("*")
        .eq("categorie", corps.categorie)
        .eq("grade_id", grade_id)
        .eq("actif", true);

      console.log("🔍 [getEchellesByCorpsAndGrade] Result:", { count: data?.length || 0, error });
      return { data: data || [], error };
    } catch (error: any) {
      console.error("💥 [getEchellesByCorpsAndGrade] Unexpected error:", error);
      return { data: [], error };
    }
  },

  /**
   * Récupérer les échelons d'une échelle
   */
  async getEchelonsByEchelle(echelle_id: string) {
    console.log("🔍 [getEchelonsByEchelle] Fetching echelons for echelle:", echelle_id);
    const { data, error } = await supabase
      .from("echelons")
      .select("*")
      .eq("echelle_id", echelle_id)
      .order("numero", { ascending: false }); // 5ème, 4ème, 3ème, 2ème, 1er

    console.log("🔍 [getEchelonsByEchelle] Result:", { count: data?.length || 0, error });
    return { data: data || [], error };
  },

  /**
   * Récupérer les postes
   */
  async getPostes() {
    console.log("🔍 [getPostes] Fetching postes...");
    const { data, error } = await supabase
      .from("postes")
      .select("*")
      .eq("actif", true)
      .order("intitule");

    console.log("🔍 [getPostes] Result:", { count: data?.length || 0, error });
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
      .order("ordre_affichage");

    return { data: data || [], error };
  },

  getAgentsByStatus: async (ministereId: string, statut: string) => {
    try {
      const { data: agents, error } = await supabase
        .from("agents")
        .select(`
          id,
          matricule,
          nom,
          prenoms,
          statut,
          date_recrutement,
          created_at,
          corps:corps_id (nom),
          grade:grade_id (nom),
          echelon:echelon_id (numero),
          ministere:ministere_id (nom, sigle)
        `)
        .eq("ministere_id", ministereId)
        .eq("statut", statut)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching agents by status:", error);
        return { agents: null, error: error.message };
      }

      return { agents, error: null };
    } catch (error) {
      console.error("Error fetching agents by status:", error);
      return { agents: null, error: "Failed to fetch agents" };
    }
  },

  validateAgent: async (agentId: string, validateurId: string, commentaire?: string) => {
    try {
      const { data: agent, error: updateError } = await supabase
        .from("agents")
        .update({
          statut: "STAGIAIRE",
          dossier_valide: true,
          date_validation: new Date().toISOString(),
          validateur_id: validateurId,
          updated_at: new Date().toISOString()
        })
        .eq("id", agentId)
        .select()
        .single();

      if (updateError) {
        console.error("Error validating agent:", updateError);
        return { success: false, error: updateError.message };
      }

      const { error: histError } = await supabase
        .from("historique_validations")
        .insert({
          agent_id: agentId,
          action: "validation",
          entite: "agent",
          entite_id: agentId,
          effectue_par: validateurId,
          details: { statut_precedent: "EN_ATTENTE_VALIDATION", nouveau_statut: "STAGIAIRE" },
          commentaire: commentaire || "Dossier validé par la DCRH"
        });

      if (histError) {
        console.error("Error creating validation history:", histError);
      }

      return { success: true, agent, error: null };
    } catch (error) {
      console.error("Error validating agent:", error);
      return { success: false, error: "Failed to validate agent" };
    }
  },

  rejectAgent: async (agentId: string, validateurId: string, motif: string) => {
    try {
      const { data: agent, error: updateError } = await supabase
        .from("agents")
        .update({
          statut: "REJETE",
          dossier_valide: false,
          observations: motif,
          updated_at: new Date().toISOString()
        })
        .eq("id", agentId)
        .select()
        .single();

      if (updateError) {
        console.error("Error rejecting agent:", updateError);
        return { success: false, error: updateError.message };
      }

      const { error: histError } = await supabase
        .from("historique_validations")
        .insert({
          agent_id: agentId,
          action: "rejet",
          entite: "agent",
          entite_id: agentId,
          effectue_par: validateurId,
          details: { statut_precedent: "EN_ATTENTE_VALIDATION", nouveau_statut: "REJETE" },
          commentaire: motif
        });

      if (histError) {
        console.error("Error creating rejection history:", histError);
      }

      return { success: true, agent, error: null };
    } catch (error) {
      console.error("Error rejecting agent:", error);
      return { success: false, error: "Failed to reject agent" };
    }
  },

  /**
   * Récupérer un agent par son user_id
   */
  async getAgentByUserId(userId: string) {
    try {
      const { data, error } = await supabase
        .from("agents")
        .select(`
          *,
          ministeres (nom, sigle),
          corps (nom),
          grades (nom),
          informations_financieres (
            salaire_base,
            indemnite_logement,
            indemnite_transport,
            total_brut,
            total_retenues,
            net_a_payer,
            rib,
            banque
          )
        `)
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("❌ Erreur getAgentByUserId:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("❌ Erreur getAgentByUserId:", error);
      return { data: null, error };
    }
  }
};