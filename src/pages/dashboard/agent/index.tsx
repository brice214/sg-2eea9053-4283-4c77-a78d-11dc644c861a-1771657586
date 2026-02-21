import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { authService } from "@/services/authService";
import { agentService } from "@/services/agentService";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building2, 
  Briefcase, 
  GraduationCap,
  DollarSign,
  CreditCard,
  FileText,
  Heart,
  Users,
  LogOut,
  Eye,
  Download
} from "lucide-react";

interface AgentProfile {
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
  date_recrutement?: string;
  ministere?: {
    nom: string;
    sigle: string;
  };
  corps?: {
    nom: string;
  };
  grade?: {
    nom: string;
  };
  informations_financieres?: {
    salaire_base: number;
    indemnite_logement: number;
    indemnite_transport: number;
    total_brut: number;
    total_retenues: number;
    net_a_payer: number;
    rib?: string;
    banque?: string;
  };
}

export default function AgentDashboard() {
  const router = useRouter();
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const session = await authService.getCurrentSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }

      const { profile, error } = await authService.getUserProfile();
      if (error || !profile) {
        console.error("❌ Erreur profil:", error);
        router.push("/auth/login");
        return;
      }

      if (profile.role !== "agent") {
        router.push("/dashboard");
        return;
      }

      await loadAgentData(profile.id);
    } catch (error) {
      console.error("❌ Erreur auth:", error);
      router.push("/auth/login");
    }
  };

  const loadAgentData = async (userId: string) => {
    try {
      const { data, error } = await agentService.getAgentByUserId(userId);
      
      if (error) {
        console.error("❌ Erreur chargement agent:", error);
        return;
      }

      if (data) {
        setAgent(data);
      }
    } catch (error) {
      console.error("❌ Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    router.push("/auth/login");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-GA", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non renseigné";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (nom: string, prenoms: string) => {
    return `${prenoms.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const getSituationMatrimonialeLabel = (situation?: string) => {
    const labels: Record<string, string> = {
      celibataire: "Célibataire",
      marie: "Marié(e)",
      divorce: "Divorcé(e)",
      veuf: "Veuf/Veuve",
    };
    return situation ? labels[situation] || situation : "Non renseigné";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Profil non trouvé</CardTitle>
            <CardDescription>
              Impossible de charger vos informations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/auth/login")} className="w-full">
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`${agent.prenoms} ${agent.nom} - Tableau de bord Agent`}
        description="Tableau de bord personnel de l'agent public"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <User className="h-6 w-6 text-green-600" />
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    USSALA
                  </h1>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div>
                  <p className="text-sm text-gray-500">Mon Espace Agent</p>
                  <p className="text-xs text-gray-400">{agent.ministere?.nom}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{agent.prenoms} {agent.nom}</p>
                  <p className="text-xs text-gray-500">{agent.matricule}</p>
                </div>
                <Avatar className="h-10 w-10 border-2 border-green-200">
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white">
                    {getInitials(agent.nom, agent.prenoms)}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bienvenue, {agent.prenoms} !
            </h2>
            <p className="text-gray-600">
              Consultez vos informations administratives et financières
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations Administratives */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informations Personnelles */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        Informations Personnelles
                      </CardTitle>
                      <CardDescription>Vos données personnelles</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Actif
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Matricule</p>
                      <p className="font-semibold text-gray-900">{agent.matricule}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Nom complet</p>
                      <p className="font-semibold text-gray-900">{agent.prenoms} {agent.nom}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Email
                      </p>
                      <p className="font-medium text-gray-700">{agent.email}</p>
                    </div>
                    {agent.telephone && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Téléphone
                        </p>
                        <p className="font-medium text-gray-700">{agent.telephone}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Date de naissance
                      </p>
                      <p className="font-medium text-gray-700">{formatDate(agent.date_naissance)}</p>
                    </div>
                    {agent.lieu_naissance && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Lieu de naissance
                        </p>
                        <p className="font-medium text-gray-700">{agent.lieu_naissance}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        Situation matrimoniale
                      </p>
                      <p className="font-medium text-gray-700">
                        {getSituationMatrimonialeLabel(agent.situation_matrimoniale)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Nombre d'enfants
                      </p>
                      <p className="font-medium text-gray-700">{agent.nombre_enfants || 0}</p>
                    </div>
                  </div>
                  {agent.adresse_actuelle && (
                    <>
                      <Separator />
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Adresse actuelle
                        </p>
                        <p className="font-medium text-gray-700">{agent.adresse_actuelle}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Informations Professionnelles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-green-600" />
                    Informations Professionnelles
                  </CardTitle>
                  <CardDescription>Votre situation administrative</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        Ministère
                      </p>
                      <p className="font-semibold text-gray-900">{agent.ministere?.nom}</p>
                      <Badge variant="secondary" className="mt-1">
                        {agent.ministere?.sigle}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Date de recrutement
                      </p>
                      <p className="font-medium text-gray-700">{formatDate(agent.date_recrutement)}</p>
                    </div>
                    {agent.corps && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          Corps
                        </p>
                        <p className="font-medium text-gray-700">{agent.corps.nom}</p>
                      </div>
                    )}
                    {agent.grade && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          Grade
                        </p>
                        <p className="font-medium text-gray-700">{agent.grade.nom}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Informations Financières */}
              {agent.informations_financieres && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-yellow-600" />
                      Informations Financières
                    </CardTitle>
                    <CardDescription>Votre situation financière actuelle</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Rémunération */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Rémunération mensuelle</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                          <p className="text-sm text-blue-600 mb-1">Salaire de base</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {formatCurrency(agent.informations_financieres.salaire_base)}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                          <p className="text-sm text-green-600 mb-1">Indemnité de logement</p>
                          <p className="text-2xl font-bold text-green-900">
                            {formatCurrency(agent.informations_financieres.indemnite_logement)}
                          </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                          <p className="text-sm text-purple-600 mb-1">Indemnité de transport</p>
                          <p className="text-2xl font-bold text-purple-900">
                            {formatCurrency(agent.informations_financieres.indemnite_transport)}
                          </p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                          <p className="text-sm text-yellow-600 mb-1">Total brut</p>
                          <p className="text-2xl font-bold text-yellow-900">
                            {formatCurrency(agent.informations_financieres.total_brut)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Net à payer */}
                    <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-lg p-6 text-white">
                      <p className="text-sm opacity-90 mb-2">Net à payer mensuel</p>
                      <p className="text-4xl font-bold">
                        {formatCurrency(agent.informations_financieres.net_a_payer)}
                      </p>
                      <p className="text-xs opacity-75 mt-2">
                        Après retenues ({formatCurrency(agent.informations_financieres.total_retenues)})
                      </p>
                    </div>

                    <Separator />

                    {/* Coordonnées bancaires */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Coordonnées bancaires
                      </h4>
                      <div className="space-y-2">
                        {agent.informations_financieres.banque && (
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-gray-500">Banque</span>
                            <span className="font-medium text-gray-900">
                              {agent.informations_financieres.banque}
                            </span>
                          </div>
                        )}
                        {agent.informations_financieres.rib && (
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-gray-500">RIB</span>
                            <span className="font-mono text-sm font-medium text-gray-900">
                              {agent.informations_financieres.rib}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Actions rapides */}
            <div className="space-y-6">
              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Voir mon bulletin de paie
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Demander un document
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger mon dossier
                  </Button>
                </CardContent>
              </Card>

              {/* Statistiques */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ma carrière</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <p className="text-3xl font-bold text-green-600">
                      {agent.date_recrutement 
                        ? Math.floor((new Date().getTime() - new Date(agent.date_recrutement).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
                        : 0}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Années de service</p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Promotions</span>
                      <Badge variant="secondary">0</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Mutations</span>
                      <Badge variant="secondary">0</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Congés disponibles</span>
                      <Badge variant="secondary">30 jours</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500">
                © 2026 USSALA - République Gabonaise
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Connexion sécurisée (SSL/TLS)</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}