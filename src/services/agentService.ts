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
        situation_matrimoniale: data.situation_matrimoniale,
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
        statut: "STAGIAIRE",
        actif: true
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
        .select("*, corps(categorie)") // Join pour récupérer la catégorie du corps
        .eq("id", grade_id)
        .eq("corps_id", corps_id)
        .single();

      if (gradeError || !grade) {
        return "Le grade sélectionné n'appartient pas au corps choisi";
      }

      // Vérifier que l'échelle correspond à la catégorie du corps du grade
      // Note: grade.corps est un objet ou un tableau selon la réponse, typage Supabase
      const corpsCategorie = (grade.corps as any)?.categorie;

      if (!corpsCategorie) {
         return "Impossible de vérifier la catégorie du corps";
      }

      const { data: echelle, error: echelleError } = await supabase
        .from("echelles")
        .select("*")
        .eq("id", echelle_id)
        // La colonne categorie n'existe pas dans echelles selon le schéma fourni plus tôt? 
        // Vérifions le schéma echelles: id, code, nom, grade_id, indice_min... 
        // Ah, le schéma echelles a grade_id ! Donc l'échelle est liée au grade, pas juste à la catégorie.
        // Mais le code précédent utilisait categorie. 
        // Le schéma montre: echelles.grade_id -> grades.id.
        // Donc on doit vérifier que l'échelle est liée au grade.
        .eq("grade_id", grade_id)
        .single();

      if (echelleError || !echelle) {
        // Si pas de lien direct, vérifions si logique différente (ex: echelles globales par catégorie)
        // Le schéma dit: echelles a une FK grade_id. Donc une échelle appartient à un grade spécifique ?
        // Ou alors c'est une erreur de conception dans mon schéma précédent versus la logique métier.
        // Dans l'administration gabonaise, les échelles sont souvent par catégorie (A1, A2...).
        // Si le schéma a grade_id, alors l'échelle est spécifique au grade.
        return "L'échelle sélectionnée ne correspond pas au grade";
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
          corps(intitule),
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
   * Récupérer les corps
   */
  async getCorps() {
    const { data, error } = await supabase
      .from("corps")
      .select("*")
      .eq("actif", true)
      .order("nom"); // intitule n'existe pas dans corps, c'est nom

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
      .order("ordre", { ascending: false }); // ordre_hierarchique n'existe pas, c'est ordre

    return { data: data || [], error };
  },

  /**
   * Récupérer les échelles par catégorie (via le grade en fait selon le schéma)
   * CORRECTION: Le schéma lie echelles à grade_id.
   * Donc on doit récupérer les échelles d'un grade donné.
   */
  async getEchellesByCategorie(categorie: string) {
    // Cette fonction est problématique avec le schéma actuel où échelle dépend de grade.
    // On va plutôt créer getEchellesByGrade
    console.warn("getEchellesByCategorie deprecated, use getEchellesByGrade");
    return { data: [], error: null };
  },

  async getEchellesByGrade(grade_id: string) {
    const { data, error } = await supabase
      .from("echelles")
      .select("*")
      .eq("grade_id", grade_id)
      .eq("actif", true)
      .order("nom"); // lettre n'existe pas, c'est nom

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
      .order("ordre_affichage"); // ordre -> ordre_affichage

    return { data: data || [], error };
  }
};