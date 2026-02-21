import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { authService } from "@/services/authService";
import { agentService, type AgentFormData } from "@/services/agentService";
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CreateAgent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Options pour les selects
  const [ministeres, setMinisteres] = useState<any[]>([]);
  const [corps, setCorps] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [echelles, setEchelles] = useState<any[]>([]);
  const [echelons, setEchelons] = useState<any[]>([]);
  const [postes, setPostes] = useState<any[]>([]);
  const [typesDocuments, setTypesDocuments] = useState<any[]>([]);

  // Données du formulaire
  const [formData, setFormData] = useState<Partial<AgentFormData>>({
    sexe: "M",
    nationalite: "Gabonaise",
    situation_matrimoniale: "CELIBATAIRE",
    nombre_enfants: 0,
    mode_recrutement: "CONCOURS",
    documents: []
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const session = await authService.getCurrentSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }
    loadOptions();
  };

  const loadOptions = async () => {
    setLoading(true);

    // Charger toutes les options
    const [
      ministeresData,
      corpsData,
      gradesData,
      postesData,
      typesDocsData
    ] = await Promise.all([
      agentService.getMinisteres(),
      agentService.getCorps(),
      agentService.getGradesTransversaux(), // NOUVEAU: Grades transversaux de la grille 2015
      agentService.getPostes(),
      agentService.getTypesDocuments()
    ]);

    setMinisteres(ministeresData.data);
    setCorps(corpsData.data);
    setGrades(gradesData.data); // Grades transversaux chargés immédiatement
    setPostes(postesData.data);
    setTypesDocuments(typesDocsData.data);

    setLoading(false);
  };

  const handleCorpsChange = async (corps_id: string) => {
    setFormData({ ...formData, corps_id, grade_id: undefined, echelle_id: undefined, echelon_id: undefined });
    
    // Réinitialiser les échelles et échelons
    setEchelles([]);
    setEchelons([]);
  };

  const handleGradeChange = async (grade_id: string) => {
    setFormData({ ...formData, grade_id, echelle_id: undefined, echelon_id: undefined });
    
    // Charger les échelles pour la combinaison (catégorie du corps × grade)
    if (formData.corps_id) {
      const { data } = await agentService.getEchellesByCorpsAndGrade(formData.corps_id, grade_id);
      setEchelles(data);
      setEchelons([]);
    }
  };

  const handleEchelleChange = async (echelle_id: string) => {
    setFormData({ ...formData, echelle_id, echelon_id: undefined });
    
    // Charger les échelons de l'échelle
    const { data } = await agentService.getEchelonsByEchelle(echelle_id);
    setEchelons(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation basique
    if (!formData.nom || !formData.prenoms || !formData.date_naissance) {
      setError("Veuillez remplir tous les champs obligatoires (marqués d'une étoile)");
      return;
    }

    if (!formData.ministere_id || !formData.corps_id || !formData.grade_id || !formData.echelle_id || !formData.echelon_id) {
      setError("Veuillez remplir toutes les informations administratives");
      return;
    }

    if (!formData.date_prise_service || !formData.numero_decision_recrutement || !formData.date_decision_recrutement) {
      setError("Veuillez remplir toutes les informations de recrutement");
      return;
    }

    setSubmitting(true);

    try {
      const { agent, error: createError } = await agentService.createAgent(formData as AgentFormData);

      if (createError) {
        setError(createError);
        setSubmitting(false);
        return;
      }

      if (agent) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard/rh");
        }, 2000);
      }
    } catch (err) {
      setError("Une erreur inattendue s'est produite");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Créer un dossier administratif - USSALA"
        description="Création d'un nouveau dossier administratif d'agent public"
      />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/rh">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900">Créer un dossier administratif</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Dossier administratif créé avec succès ! Redirection en cours...
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations personnelles */}
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>État civil de l'agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom *</Label>
                    <Input
                      id="nom"
                      required
                      value={formData.nom || ""}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prenoms">Prénoms *</Label>
                    <Input
                      id="prenoms"
                      required
                      value={formData.prenoms || ""}
                      onChange={(e) => setFormData({ ...formData, prenoms: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_naissance">Date de naissance *</Label>
                    <Input
                      id="date_naissance"
                      type="date"
                      required
                      value={formData.date_naissance || ""}
                      onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lieu_naissance">Lieu de naissance *</Label>
                    <Input
                      id="lieu_naissance"
                      required
                      value={formData.lieu_naissance || ""}
                      onChange={(e) => setFormData({ ...formData, lieu_naissance: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sexe">Sexe *</Label>
                    <Select
                      value={formData.sexe}
                      onValueChange={(value: "M" | "F") => setFormData({ ...formData, sexe: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculin</SelectItem>
                        <SelectItem value="F">Féminin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="situation_matrimoniale">Situation matrimoniale *</Label>
                    <Select
                      value={formData.situation_matrimoniale}
                      onValueChange={(value: any) => setFormData({ ...formData, situation_matrimoniale: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CELIBATAIRE">Célibataire</SelectItem>
                        <SelectItem value="MARIE">Marié(e)</SelectItem>
                        <SelectItem value="DIVORCE">Divorcé(e)</SelectItem>
                        <SelectItem value="VEUF">Veuf(ve)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nombre_enfants">Nombre d'enfants *</Label>
                    <Input
                      id="nombre_enfants"
                      type="number"
                      min="0"
                      required
                      value={formData.nombre_enfants || 0}
                      onChange={(e) => setFormData({ ...formData, nombre_enfants: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Coordonnées</CardTitle>
                <CardDescription>Informations de contact</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone *</Label>
                    <Input
                      id="telephone"
                      type="tel"
                      required
                      placeholder="+241 XX XX XX XX"
                      value={formData.telephone || ""}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adresse">Adresse complète *</Label>
                  <Textarea
                    id="adresse"
                    required
                    rows={2}
                    value={formData.adresse || ""}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Informations administratives */}
            <Card>
              <CardHeader>
                <CardTitle>Informations administratives</CardTitle>
                <CardDescription>Affectation et classification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ministere">Ministère employeur *</Label>
                  <Select
                    value={formData.ministere_id}
                    onValueChange={(value) => setFormData({ ...formData, ministere_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un ministère" />
                    </SelectTrigger>
                    <SelectContent>
                      {ministeres.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="poste">Poste *</Label>
                  <Select
                    value={formData.poste_id}
                    onValueChange={(value) => setFormData({ ...formData, poste_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un poste" />
                    </SelectTrigger>
                    <SelectContent>
                      {postes.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.intitule}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="corps">Corps *</Label>
                    <Select
                      value={formData.corps_id}
                      onValueChange={handleCorpsChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un corps" />
                      </SelectTrigger>
                      <SelectContent>
                        {corps.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nom} (Catégorie {c.categorie})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade *</Label>
                    <Select
                      value={formData.grade_id}
                      onValueChange={handleGradeChange}
                      disabled={!formData.corps_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades.map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.corps_id && !formData.grade_id && (
                      <p className="text-xs text-gray-500">
                        Grades disponibles pour toutes les catégories (Grille 2015)
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="echelle">Échelle *</Label>
                    <Select
                      value={formData.echelle_id}
                      onValueChange={handleEchelleChange}
                      disabled={!formData.corps_id || !formData.grade_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une échelle" />
                      </SelectTrigger>
                      <SelectContent>
                        {echelles.map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.corps_id && formData.grade_id && echelles.length === 0 && (
                      <p className="text-xs text-red-500">
                        Aucune échelle disponible pour cette combinaison
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="echelon">Échelon *</Label>
                    <Select
                      value={formData.echelon_id}
                      onValueChange={(value) => setFormData({ ...formData, echelon_id: value })}
                      disabled={!formData.echelle_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un échelon" />
                      </SelectTrigger>
                      <SelectContent>
                        {echelons.map((ec) => (
                          <SelectItem key={ec.id} value={ec.id}>
                            {ec.numero === 0 ? "Stagiaire" : `${ec.numero}${ec.numero === 1 ? "er" : "ème"} échelon`} 
                            {ec.indice_reference && ` (Indice: ${ec.indice_reference})`}
                            {ec.salaire_base && ` - ${Number(ec.salaire_base).toLocaleString('fr-FR')} FCFA`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations de recrutement */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de recrutement</CardTitle>
                <CardDescription>Détails du recrutement et de la prise de service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mode_recrutement">Mode de recrutement *</Label>
                    <Select
                      value={formData.mode_recrutement}
                      onValueChange={(value: any) => setFormData({ ...formData, mode_recrutement: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CONCOURS">Concours</SelectItem>
                        <SelectItem value="CONTRACTUEL">Contractuel</SelectItem>
                        <SelectItem value="DETACHEMENT">Détachement</SelectItem>
                        <SelectItem value="MUTATION">Mutation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_prise_service">Date de prise de service *</Label>
                    <Input
                      id="date_prise_service"
                      type="date"
                      required
                      value={formData.date_prise_service || ""}
                      onChange={(e) => setFormData({ ...formData, date_prise_service: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero_decision">N° décision de recrutement *</Label>
                    <Input
                      id="numero_decision"
                      required
                      placeholder="Ex: 001/PR/2026"
                      value={formData.numero_decision_recrutement || ""}
                      onChange={(e) => setFormData({ ...formData, numero_decision_recrutement: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_decision">Date de la décision *</Label>
                    <Input
                      id="date_decision"
                      type="date"
                      required
                      value={formData.date_decision_recrutement || ""}
                      onChange={(e) => setFormData({ ...formData, date_decision_recrutement: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Link href="/dashboard/rh">
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                {submitting ? "Création en cours..." : "Créer le dossier"}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}