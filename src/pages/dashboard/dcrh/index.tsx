import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { authService } from "@/services/authService";
import { agentService } from "@/services/agentService";
import { Users, CheckCircle, Clock, XCircle, FileText, TrendingUp, UserCheck, BarChart3 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Agent {
  id: string;
  matricule: string;
  nom: string;
  prenoms: string;
  corps: { nom: string };
  grade: { nom: string };
  statut: string;
  date_recrutement: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  ministere_id: string;
  ministere?: {
    id: string;
    nom: string;
    sigle: string;
  };
}

interface Stats {
  total_agents: number;
  en_attente: number;
  valides: number;
  rejetes: number;
}

export default function DCRHDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats>({
    total_agents: 0,
    en_attente: 0,
    valides: 0,
    rejetes: 0
  });
  const [agentsEnAttente, setAgentsEnAttente] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationAction, setValidationAction] = useState<"valider" | "rejeter">("valider");
  const [commentaire, setCommentaire] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { session } = await authService.getSession();
    
    if (!session) {
      router.push("/auth/login");
      return;
    }

    const { profile } = await authService.getUserProfile();
    if (profile) {
      if (profile.role !== "rh_central") {
        router.push("/dashboard");
        return;
      }
      
      if (!profile.ministere_id) {
        alert("Erreur : Votre compte n'est pas rattaché à un ministère. Contactez l'administrateur.");
        await authService.logout();
        router.push("/auth/login");
        return;
      }

      setUserProfile(profile);
      await loadDashboardData(profile.ministere_id);
    }

    setLoading(false);
  };

  const loadDashboardData = async (ministereId: string) => {
    const { agents: enAttente } = await agentService.getAgentsByStatus(ministereId, "EN_ATTENTE_VALIDATION");
    const { agents: valides } = await agentService.getAgentsByStatus(ministereId, "TITULAIRE");
    
    setAgentsEnAttente(enAttente || []);
    
    setStats({
      total_agents: (enAttente?.length || 0) + (valides?.length || 0),
      en_attente: enAttente?.length || 0,
      valides: valides?.length || 0,
      rejetes: 0
    });
  };

  const handleValidation = async () => {
    if (!selectedAgent || !userProfile) return;

    setSubmitting(true);
    try {
      if (validationAction === "valider") {
        const { success, error } = await agentService.validateAgent(
          selectedAgent.id,
          userProfile.id,
          commentaire
        );

        if (success) {
          alert("Dossier validé avec succès !");
          await loadDashboardData(userProfile.ministere_id);
          setShowValidationDialog(false);
          setSelectedAgent(null);
          setCommentaire("");
        } else {
          alert(`Erreur : ${error || "Impossible de valider le dossier"}`);
        }
      } else {
        const { success, error } = await agentService.rejectAgent(
          selectedAgent.id,
          userProfile.id,
          commentaire
        );

        if (success) {
          alert("Dossier rejeté avec succès !");
          await loadDashboardData(userProfile.ministere_id);
          setShowValidationDialog(false);
          setSelectedAgent(null);
          setCommentaire("");
        } else {
          alert(`Erreur : ${error || "Impossible de rejeter le dossier"}`);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
      alert("Une erreur est survenue lors de la validation");
    } finally {
      setSubmitting(false);
    }
  };

  const openValidationDialog = (agent: Agent, action: "valider" | "rejeter") => {
    setSelectedAgent(agent);
    setValidationAction(action);
    setShowValidationDialog(true);
  };

  const handleLogout = async () => {
    await authService.logout();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord DCRH...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Tableau de bord DCRH - USSALA"
        description="Tableau de bord DCRH pour la validation des dossiers administratifs"
      />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-green-700">USSALA</h1>
                <p className="text-sm text-gray-600">Plateforme de Gestion Administrative et Statutaire des Agents Publics</p>
                {userProfile?.ministere && (
                  <p className="text-sm text-green-700 font-medium mt-1">
                    {userProfile.ministere.nom} ({userProfile.ministere.sigle})
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{userProfile?.email}</p>
                <p className="text-xs text-gray-500 mb-2">Connecté</p>
                <Badge variant="outline" className="mb-2 border-blue-600 text-blue-700">
                  DCRH Central
                </Badge>
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="ml-2"
                >
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Tableau de bord DCRH
            </h2>
            <p className="text-gray-600">
              Validation et supervision des dossiers administratifs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
                <Users className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_agents}</div>
                <p className="text-xs text-gray-500 mt-1">Agents du ministère</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En attente</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.en_attente}</div>
                <p className="text-xs text-gray-500 mt-1">Dossiers à valider</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Validés</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.valides}</div>
                <p className="text-xs text-gray-500 mt-1">Dossiers validés</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejetés</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.rejetes}</div>
                <p className="text-xs text-gray-500 mt-1">Dossiers rejetés</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Dossiers en attente de validation
                </CardTitle>
                <CardDescription>
                  {stats.en_attente} dossier{stats.en_attente > 1 ? "s" : ""} en attente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {agentsEnAttente.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Aucun dossier en attente de validation</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Matricule</TableHead>
                          <TableHead>Nom et Prénoms</TableHead>
                          <TableHead>Corps/Grade</TableHead>
                          <TableHead>Date création</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {agentsEnAttente.map((agent) => (
                          <TableRow key={agent.id}>
                            <TableCell className="font-medium">{agent.matricule}</TableCell>
                            <TableCell>{agent.nom} {agent.prenoms}</TableCell>
                            <TableCell className="text-sm">
                              {agent.corps?.nom || "N/A"}
                              <br />
                              <span className="text-gray-500">{agent.grade?.nom || "N/A"}</span>
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(agent.created_at).toLocaleDateString("fr-FR")}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => openValidationDialog(agent, "valider")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Valider
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openValidationDialog(agent, "rejeter")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rejeter
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Modules de gestion
                </CardTitle>
                <CardDescription>
                  Accès rapide aux fonctionnalités DCRH
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push("/dashboard/dcrh/promotions")}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Promotions à valider
                  <Badge variant="secondary" className="ml-auto">Bientôt</Badge>
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push("/dashboard/dcrh/mutations")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Mutations à valider
                  <Badge variant="secondary" className="ml-auto">Bientôt</Badge>
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push("/dashboard/dcrh/titularisations")}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Titularisations à valider
                  <Badge variant="secondary" className="ml-auto">Bientôt</Badge>
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push("/dashboard/dcrh/statistiques")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Statistiques détaillées
                  <Badge variant="secondary" className="ml-auto">Bientôt</Badge>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {validationAction === "valider" ? "Valider le dossier" : "Rejeter le dossier"}
            </DialogTitle>
            <DialogDescription>
              {validationAction === "valider" 
                ? "Confirmer la validation du dossier administratif"
                : "Indiquer le motif de rejet du dossier"
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedAgent && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Matricule</p>
                  <p className="text-gray-900">{selectedAgent.matricule}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Nom et Prénoms</p>
                  <p className="text-gray-900">{selectedAgent.nom} {selectedAgent.prenoms}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Corps</p>
                  <p className="text-gray-900">{selectedAgent.corps?.nom || "N/A"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Grade</p>
                  <p className="text-gray-900">{selectedAgent.grade?.nom || "N/A"}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {validationAction === "valider" ? "Commentaire (optionnel)" : "Motif de rejet *"}
                </label>
                <Textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder={
                    validationAction === "valider"
                      ? "Ajouter un commentaire..."
                      : "Indiquer le motif de rejet..."
                  }
                  rows={4}
                  required={validationAction === "rejeter"}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowValidationDialog(false);
                setSelectedAgent(null);
                setCommentaire("");
              }}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleValidation}
              disabled={submitting || (validationAction === "rejeter" && !commentaire.trim())}
              className={validationAction === "valider" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={validationAction === "rejeter" ? "destructive" : "default"}
            >
              {submitting ? "Traitement..." : (validationAction === "valider" ? "Confirmer la validation" : "Confirmer le rejet")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}