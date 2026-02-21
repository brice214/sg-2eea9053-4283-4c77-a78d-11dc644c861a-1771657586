 
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          actif: boolean | null
          adresse_actuelle: string | null
          annee_obtention: number | null
          corps_id: string
          created_at: string | null
          date_naissance: string
          date_premiere_nomination: string | null
          date_prise_service: string | null
          date_recrutement: string
          date_titularisation: string | null
          date_validation: string | null
          diplome_principal: string
          direction_id: string | null
          dossier_complet: boolean | null
          dossier_valide: boolean | null
          echelle_id: string | null
          echelon_id: string | null
          email: string | null
          etablissement: string | null
          grade_id: string
          id: string
          lieu_naissance: string
          matricule: string
          ministere_id: string | null
          nationalite: string | null
          nom: string
          nom_jeune_fille: string | null
          nombre_enfants: number | null
          numero_dossier: string | null
          observations: string | null
          poste_id: string | null
          prenoms: string
          province: string | null
          service_id: string | null
          sexe: string
          situation_matrimoniale: string | null
          specialite: string | null
          statut: string
          telephone: string | null
          updated_at: string | null
          user_id: string | null
          validateur_id: string | null
          ville: string | null
        }
        Insert: {
          actif?: boolean | null
          adresse_actuelle?: string | null
          annee_obtention?: number | null
          corps_id: string
          created_at?: string | null
          date_naissance: string
          date_premiere_nomination?: string | null
          date_prise_service?: string | null
          date_recrutement: string
          date_titularisation?: string | null
          date_validation?: string | null
          diplome_principal: string
          direction_id?: string | null
          dossier_complet?: boolean | null
          dossier_valide?: boolean | null
          echelle_id?: string | null
          echelon_id?: string | null
          email?: string | null
          etablissement?: string | null
          grade_id: string
          id?: string
          lieu_naissance: string
          matricule: string
          ministere_id?: string | null
          nationalite?: string | null
          nom: string
          nom_jeune_fille?: string | null
          nombre_enfants?: number | null
          numero_dossier?: string | null
          observations?: string | null
          poste_id?: string | null
          prenoms: string
          province?: string | null
          service_id?: string | null
          sexe: string
          situation_matrimoniale?: string | null
          specialite?: string | null
          statut?: string
          telephone?: string | null
          updated_at?: string | null
          user_id?: string | null
          validateur_id?: string | null
          ville?: string | null
        }
        Update: {
          actif?: boolean | null
          adresse_actuelle?: string | null
          annee_obtention?: number | null
          corps_id?: string
          created_at?: string | null
          date_naissance?: string
          date_premiere_nomination?: string | null
          date_prise_service?: string | null
          date_recrutement?: string
          date_titularisation?: string | null
          date_validation?: string | null
          diplome_principal?: string
          direction_id?: string | null
          dossier_complet?: boolean | null
          dossier_valide?: boolean | null
          echelle_id?: string | null
          echelon_id?: string | null
          email?: string | null
          etablissement?: string | null
          grade_id?: string
          id?: string
          lieu_naissance?: string
          matricule?: string
          ministere_id?: string | null
          nationalite?: string | null
          nom?: string
          nom_jeune_fille?: string | null
          nombre_enfants?: number | null
          numero_dossier?: string | null
          observations?: string | null
          poste_id?: string | null
          prenoms?: string
          province?: string | null
          service_id?: string | null
          sexe?: string
          situation_matrimoniale?: string | null
          specialite?: string | null
          statut?: string
          telephone?: string | null
          updated_at?: string | null
          user_id?: string | null
          validateur_id?: string | null
          ville?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_corps_id_fkey"
            columns: ["corps_id"]
            isOneToOne: false
            referencedRelation: "corps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_echelle_id_fkey"
            columns: ["echelle_id"]
            isOneToOne: false
            referencedRelation: "echelles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_echelon_id_fkey"
            columns: ["echelon_id"]
            isOneToOne: false
            referencedRelation: "echelons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_ministere_id_fkey"
            columns: ["ministere_id"]
            isOneToOne: false
            referencedRelation: "ministeres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_poste_id_fkey"
            columns: ["poste_id"]
            isOneToOne: false
            referencedRelation: "postes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_validateur_id_fkey"
            columns: ["validateur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      corps: {
        Row: {
          actif: boolean | null
          categorie: string
          code: string
          created_at: string | null
          description: string | null
          diplome_requis: string | null
          id: string
          nom: string
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          categorie: string
          code: string
          created_at?: string | null
          description?: string | null
          diplome_requis?: string | null
          id?: string
          nom: string
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          categorie?: string
          code?: string
          created_at?: string | null
          description?: string | null
          diplome_requis?: string | null
          id?: string
          nom?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      directions: {
        Row: {
          actif: boolean | null
          code: string
          created_at: string | null
          email: string | null
          id: string
          ministere_id: string
          nom: string
          responsable: string | null
          sigle: string | null
          telephone: string | null
          type_direction: string | null
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          code: string
          created_at?: string | null
          email?: string | null
          id?: string
          ministere_id: string
          nom: string
          responsable?: string | null
          sigle?: string | null
          telephone?: string | null
          type_direction?: string | null
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          code?: string
          created_at?: string | null
          email?: string | null
          id?: string
          ministere_id?: string
          nom?: string
          responsable?: string | null
          sigle?: string | null
          telephone?: string | null
          type_direction?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directions_ministere_id_fkey"
            columns: ["ministere_id"]
            isOneToOne: false
            referencedRelation: "ministeres"
            referencedColumns: ["id"]
          },
        ]
      }
      documents_administratifs: {
        Row: {
          agent_id: string
          created_at: string | null
          date_emission: string | null
          date_expiration: string | null
          date_validation: string | null
          fichier_nom: string | null
          fichier_taille: number | null
          fichier_url: string | null
          id: string
          intitule: string
          motif_rejet: string | null
          numero_document: string | null
          observations: string | null
          organisme_emetteur: string | null
          statut: string | null
          type_document_id: string
          updated_at: string | null
          valide_par: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          date_emission?: string | null
          date_expiration?: string | null
          date_validation?: string | null
          fichier_nom?: string | null
          fichier_taille?: number | null
          fichier_url?: string | null
          id?: string
          intitule: string
          motif_rejet?: string | null
          numero_document?: string | null
          observations?: string | null
          organisme_emetteur?: string | null
          statut?: string | null
          type_document_id: string
          updated_at?: string | null
          valide_par?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          date_emission?: string | null
          date_expiration?: string | null
          date_validation?: string | null
          fichier_nom?: string | null
          fichier_taille?: number | null
          fichier_url?: string | null
          id?: string
          intitule?: string
          motif_rejet?: string | null
          numero_document?: string | null
          observations?: string | null
          organisme_emetteur?: string | null
          statut?: string | null
          type_document_id?: string
          updated_at?: string | null
          valide_par?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_administratifs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_administratifs_type_document_id_fkey"
            columns: ["type_document_id"]
            isOneToOne: false
            referencedRelation: "types_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_administratifs_valide_par_fkey"
            columns: ["valide_par"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      echelles: {
        Row: {
          actif: boolean | null
          code: string
          created_at: string | null
          grade_id: string
          id: string
          indice_maximum: number
          indice_minimum: number
          nom: string
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          code: string
          created_at?: string | null
          grade_id: string
          id?: string
          indice_maximum: number
          indice_minimum: number
          nom: string
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          code?: string
          created_at?: string | null
          grade_id?: string
          id?: string
          indice_maximum?: number
          indice_minimum?: number
          nom?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "echelles_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grades"
            referencedColumns: ["id"]
          },
        ]
      }
      echelons: {
        Row: {
          actif: boolean | null
          created_at: string | null
          duree_mois: number
          echelle_id: string
          id: string
          indice_brut: number
          indice_majore: number
          numero: number
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          created_at?: string | null
          duree_mois: number
          echelle_id: string
          id?: string
          indice_brut: number
          indice_majore: number
          numero: number
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          created_at?: string | null
          duree_mois?: number
          echelle_id?: string
          id?: string
          indice_brut?: number
          indice_majore?: number
          numero?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "echelons_echelle_id_fkey"
            columns: ["echelle_id"]
            isOneToOne: false
            referencedRelation: "echelles"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          actif: boolean | null
          code: string
          corps_id: string
          created_at: string | null
          description: string | null
          id: string
          nom: string
          ordre: number
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          code: string
          corps_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          nom: string
          ordre: number
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          code?: string
          corps_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          nom?: string
          ordre?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grades_corps_id_fkey"
            columns: ["corps_id"]
            isOneToOne: false
            referencedRelation: "corps"
            referencedColumns: ["id"]
          },
        ]
      }
      historique_validations: {
        Row: {
          action: string
          agent_id: string
          commentaire: string | null
          date_action: string | null
          details: Json | null
          effectue_par: string
          entite: string
          entite_id: string | null
          id: string
        }
        Insert: {
          action: string
          agent_id: string
          commentaire?: string | null
          date_action?: string | null
          details?: Json | null
          effectue_par: string
          entite: string
          entite_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          agent_id?: string
          commentaire?: string | null
          date_action?: string | null
          details?: Json | null
          effectue_par?: string
          entite?: string
          entite_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "historique_validations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historique_validations_effectue_par_fkey"
            columns: ["effectue_par"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ministeres: {
        Row: {
          actif: boolean | null
          adresse: string | null
          code: string
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          nom: string
          responsable: string | null
          sigle: string | null
          telephone: string | null
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          adresse?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          nom: string
          responsable?: string | null
          sigle?: string | null
          telephone?: string | null
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          adresse?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          nom?: string
          responsable?: string | null
          sigle?: string | null
          telephone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      postes: {
        Row: {
          actif: boolean | null
          code: string
          competences_requises: string | null
          corps_id: string
          created_at: string | null
          date_creation: string | null
          description: string | null
          grade_minimum_id: string | null
          id: string
          intitule: string
          missions: string | null
          service_id: string | null
          statut: string | null
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          code: string
          competences_requises?: string | null
          corps_id: string
          created_at?: string | null
          date_creation?: string | null
          description?: string | null
          grade_minimum_id?: string | null
          id?: string
          intitule: string
          missions?: string | null
          service_id?: string | null
          statut?: string | null
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          code?: string
          competences_requises?: string | null
          corps_id?: string
          created_at?: string | null
          date_creation?: string | null
          description?: string | null
          grade_minimum_id?: string | null
          id?: string
          intitule?: string
          missions?: string | null
          service_id?: string | null
          statut?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "postes_corps_id_fkey"
            columns: ["corps_id"]
            isOneToOne: false
            referencedRelation: "corps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postes_grade_minimum_id_fkey"
            columns: ["grade_minimum_id"]
            isOneToOne: false
            referencedRelation: "grades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postes_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          actif: boolean | null
          avatar_url: string | null
          created_at: string | null
          direction_id: string | null
          email: string | null
          full_name: string | null
          id: string
          ministere_id: string | null
          role: string | null
          service_id: string | null
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          direction_id?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          ministere_id?: string | null
          role?: string | null
          service_id?: string | null
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          direction_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          ministere_id?: string | null
          role?: string | null
          service_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_ministere_id_fkey"
            columns: ["ministere_id"]
            isOneToOne: false
            referencedRelation: "ministeres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          actif: boolean | null
          code: string
          created_at: string | null
          direction_id: string
          email: string | null
          id: string
          nom: string
          responsable: string | null
          telephone: string | null
          type_service: string | null
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          code: string
          created_at?: string | null
          direction_id: string
          email?: string | null
          id?: string
          nom: string
          responsable?: string | null
          telephone?: string | null
          type_service?: string | null
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          code?: string
          created_at?: string | null
          direction_id?: string
          email?: string | null
          id?: string
          nom?: string
          responsable?: string | null
          telephone?: string | null
          type_service?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
        ]
      }
      types_documents: {
        Row: {
          actif: boolean | null
          code: string
          created_at: string | null
          description: string | null
          id: string
          nom: string
          obligatoire: boolean | null
          ordre_affichage: number | null
        }
        Insert: {
          actif?: boolean | null
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          nom: string
          obligatoire?: boolean | null
          ordre_affichage?: number | null
        }
        Update: {
          actif?: boolean | null
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          nom?: string
          obligatoire?: boolean | null
          ordre_affichage?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generer_matricule: { Args: never; Returns: string }
      verifier_coherence_carriere: {
        Args: {
          p_corps_id: string
          p_echelle_id: string
          p_echelon_id: string
          p_grade_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
