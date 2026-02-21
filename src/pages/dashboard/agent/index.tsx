import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { authService } from "@/services/authService";
import { agentDashboardService, type AgentCompletProfile, type RappelSolde, type MessageAgent } from "@/services/agentDashboardService";
import {
  Shield,
  User,
  Briefcase,
  DollarSign,
  FileText,
  Mail,
  LogOut,
  Home,
  Calendar,
  MapPin,
  Phone,
  Building2,
  CreditCard,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Bell
} from "lucide-react";

type ActiveSection = "dashboard" | "profile" | "career" | "finances" | "documents" | "messages";

export default function AgentDashboard() {
  const router = useRouter();
  const [agent, setAgent] = useState<AgentCompletProfile | null>(null);
  const [rappels, setRappels] = useState<RappelSolde[]>([]);
  const [messages, setMessages] = useState<MessageAgent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<ActiveSection>("dashboard");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const session = await authService.getCurrentSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }

      const { data: agentData, error: agentError } = await agentDashboardService.getAgentCompletProfile(session.user.id);
      if (agentError) {
        setError(agentError);
        setIsLoading(false);
        return;
      }

      if (agentData) {
        setAgent(agentData);
        
        // Use getRappelsFinanciers instead of getRappelsSolde
        const { data: rappelsData } = await agentDashboardService.getRappelsFinanciers(agentData.id);
        if (rappelsData && rappelsData.rappels) setRappels(rappelsData.rappels);

        const { data: messagesData } = await agentDashboardService.getMessages(agentData.id);
        if (messagesData) setMessages(messagesData);

        const count = await agentDashboardService.countUnreadMessages(agentData.id);
        setUnreadCount(count);
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Erreur lors du chargement des données");
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    router.push("/auth/login");
  };

  const handleMarkAsRead = async (messageId: string) => {
    const result = await agentDashboardService.markMessageAsRead(messageId);
    if (result.success) {
      loadDashboardData();
    }
  };

  const calculateFinancials = () => {
    const totalRappels = rappels.reduce((sum, r) => sum + r.montant_total, 0);
    const totalPaye = rappels.reduce((sum, r) => sum + (r.montant_paye || 0), 0);
    const totalRestant = rappels.reduce((sum, r) => sum + (r.montant_restant || 0), 0);
    const rappelsEnCours = rappels.filter(r => r.statut === "en_cours").length;

    return { totalRappels, totalPaye, totalRestant, rappelsEnCours };
  };

  const getCareerStats = () => {
    if (!agent) return null;
    return agentDashboardService.calculateCareerStats(agent);
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "Non renseigné";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto" />
          <p className="text-green-700 font-medium">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 p-4">
        <Card className="w-full max-w-md shadow-2xl border-green-100">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Erreur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{error || "Impossible de charger vos données"}</p>
            <Button onClick={() => router.push("/auth/login")} className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const careerStats = getCareerStats();
  const financials = calculateFinancials();

  const menuItems = [
    { id: "dashboard" as ActiveSection, label: "Tableau de bord", icon: Home },
    { id: "profile" as ActiveSection, label: "Profil Personnel", icon: User },
    { id: "career" as ActiveSection, label: "Carrière & Parcours", icon: Briefcase },
    { id: "finances" as ActiveSection, label: "Finances & Rappels", icon: DollarSign },
    { id: "documents" as ActiveSection, label: "Documents", icon: FileText },
    { id: "messages" as ActiveSection, label: "Messagerie", icon: Mail, badge: unreadCount }
  ];

  return (
    <>
      <SEO 
        title={`Tableau de bord - ${agent.nom} ${agent.prenoms}`}
        description="Espace personnel agent public - USSALA Gabon"
      />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 flex">
        {/* Sidebar Menu */}
        <aside className="w-80 bg-white border-r border-green-100 shadow-xl flex flex-col fixed h-full z-10">
          {/* Header with Logo */}
          <div className="p-6 border-b border-green-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent">
                  USSALA
                </h1>
                <p className="text-xs text-gray-500">Espace Agent</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-100">
              <p className="text-sm font-semibold text-gray-800">{agent.nom} {agent.prenoms}</p>
              <p className="text-xs text-gray-600 mt-1">{agent.grade?.nom || "Grade non renseigné"}</p>
              <p className="text-xs text-green-600 font-medium mt-1">{agent.corps?.nom || "Corps non renseigné"}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-green-50 hover:text-green-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-500"}`} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge className="bg-red-500 text-white border-0 animate-pulse">
                      {item.badge}
                    </Badge>
                  )}
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </button>
              );
            })}
          </nav>

          {/* Footer with Logout */}
          <div className="p-4 border-t border-green-100">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto ml-80">
          <div className="max-w-7xl mx-auto p-8">
            {/* Dashboard Section */}
            {activeSection === "dashboard" && (
              <div className="space-y-6">
                {/* Hero Section */}
                <Card className="shadow-2xl border-green-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-3xl font-bold mb-2">
                          Bienvenue, {agent.prenoms} {agent.nom}
                        </h2>
                        <div className="flex items-center gap-4 text-green-50">
                          <span className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {agent.ministere?.nom || "Ministère non renseigné"}
                          </span>
                          <span className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            {agent.grade?.nom || "Grade non renseigné"}
                          </span>
                        </div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                        <p className="text-xs text-green-50">Matricule</p>
                        <p className="font-mono font-bold">{agent.matricule}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-green-700">
                          {formatCurrency(agent.informations_financieres?.net_a_payer || 0)}
                        </p>
                        <p className="text-xs text-green-600 mt-1">Salaire Net</p>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold text-blue-700">
                          {careerStats?.anciennete || "N/A"}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">Ancienneté</p>
                      </div>

                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center justify-between mb-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                          {financials.rappelsEnCours > 0 && (
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        <p className="text-2xl font-bold text-yellow-700">
                          {financials.rappelsEnCours}
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">Rappels en cours</p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <Mail className="h-5 w-5 text-green-600" />
                          {unreadCount > 0 && (
                            <Badge className="bg-red-500 text-white border-0 h-5 px-2 text-xs">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-blue-700">
                          {messages.length}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">Messages</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Career Timeline Preview */}
                {careerStats && (
                  <Card className="shadow-2xl border-green-100">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                      <CardTitle className="text-green-700 flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Progression de Carrière
                      </CardTitle>
                      <CardDescription>
                        Suivi de votre parcours professionnel
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      {/* Timeline Bar */}
                      <div className="relative">
                        <div className="h-2 bg-gradient-to-r from-green-200 via-blue-200 to-yellow-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-600 to-blue-600 transition-all duration-1000"
                            style={{
                              width: careerStats.anneesJusquaRetraite 
                                ? `${Math.min(100, ((40 - careerStats.anneesJusquaRetraite) / 40) * 100)}%`
                                : "0%"
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Recrutement</p>
                          <p className="font-semibold text-green-700">
                            {formatDate(agent.date_recrutement)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Aujourd'hui</p>
                          <p className="font-semibold text-blue-700">
                            {careerStats.anciennete}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Retraite prévue</p>
                          <p className="font-semibold text-yellow-700">
                            {careerStats.anneesJusquaRetraite 
                              ? `Dans ${careerStats.anneesJusquaRetraite} ans`
                              : "Non renseigné"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Alerts Section */}
                {(unreadCount > 0 || financials.rappelsEnCours > 0) && (
                  <Card className="shadow-2xl border-yellow-100">
                    <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                      <CardTitle className="text-yellow-700 flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notifications & Alertes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                      {unreadCount > 0 && (
                        <Alert className="border-green-200 bg-green-50">
                          <Mail className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-700">
                            Vous avez <strong>{unreadCount}</strong> nouveau{unreadCount > 1 ? "x" : ""} message{unreadCount > 1 ? "s" : ""} de la DCRH.
                          </AlertDescription>
                        </Alert>
                      )}
                      {financials.rappelsEnCours > 0 && (
                        <Alert className="border-blue-200 bg-blue-50">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-700">
                            <strong>{financials.rappelsEnCours}</strong> rappel{financials.rappelsEnCours > 1 ? "s" : ""} de solde en cours de traitement.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Profile Section */}
            {activeSection === "profile" && (
              <div className="space-y-6">
                <Card className="shadow-2xl border-green-100">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                    <CardTitle className="text-green-700 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informations Personnelles
                    </CardTitle>
                    <CardDescription>
                      Détails de votre identité et contact
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-gray-500">Matricule</label>
                          <p className="font-semibold text-gray-800 font-mono">{agent.matricule}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Nom complet</label>
                          <p className="font-semibold text-gray-800">{agent.nom} {agent.prenoms}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Email professionnel</label>
                          <p className="font-semibold text-gray-800">{agent.email}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Téléphone</label>
                          <p className="font-semibold text-gray-800">{agent.telephone || "Non renseigné"}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-gray-500">Date de naissance</label>
                          <p className="font-semibold text-gray-800">{formatDate(agent.date_naissance)}</p>
                          {careerStats?.age && (
                            <p className="text-xs text-green-600 mt-1">{careerStats.age} ans</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Lieu de naissance</label>
                          <p className="font-semibold text-gray-800">{agent.lieu_naissance || "Non renseigné"}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Situation matrimoniale</label>
                          <p className="font-semibold text-gray-800 capitalize">{agent.situation_matrimoniale || "Non renseigné"}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Nombre d'enfants</label>
                          <p className="font-semibold text-gray-800">{agent.nombre_enfants ?? "Non renseigné"}</p>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6 bg-green-100" />

                    <div>
                      <label className="text-sm text-gray-500">Adresse complète</label>
                      <p className="font-semibold text-gray-800 mt-1">{agent.adresse_actuelle || "Non renseignée"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Career Section */}
            {activeSection === "career" && (
              <div className="space-y-6">
                {/* Current Position */}
                <Card className="shadow-2xl border-green-100">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                    <CardTitle className="text-green-700 flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Situation Administrative Actuelle
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-gray-500">Ministère de tutelle</label>
                          <p className="font-semibold text-gray-800">{agent.ministere?.nom || "Non renseigné"}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Corps</label>
                          <p className="font-semibold text-gray-800">{agent.corps?.nom || "Non renseigné"}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-gray-500">Grade</label>
                          <p className="font-semibold text-gray-800">{agent.grade?.nom || "Non renseigné"}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Lieu d'affectation actuel</label>
                          <p className="font-semibold text-gray-800 flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-green-600" />
                            {agent.lieu_affectation_actuel || "Non renseigné"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-gray-500">Établissement</label>
                          <p className="font-semibold text-gray-800">{agent.etablissement_affectation || "Non renseigné"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Career Timeline */}
                <Card className="shadow-2xl border-green-100">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                    <CardTitle className="text-green-700 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Timeline de Carrière
                    </CardTitle>
                    <CardDescription>
                      Dates clés de votre parcours professionnel
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {[
                        { date: agent.date_recrutement, label: "Date de recrutement", icon: Briefcase, color: "green" },
                        { date: agent.date_prise_service, label: "Date de prise de service", icon: Clock, color: "blue" },
                        { date: agent.date_integration, label: "Date d'intégration", icon: CheckCircle2, color: "green" },
                        { date: agent.date_titularisation, label: "Date de titularisation", icon: Shield, color: "blue" },
                        { date: agent.date_reprise_service, label: "Date de reprise de service", icon: Clock, color: "green" },
                        { date: agent.date_reclassement, label: "Date de reclassement", icon: TrendingUp, color: "blue" },
                        { date: agent.date_mise_en_retraite, label: "Date de mise en retraite", icon: Calendar, color: "yellow" }
                      ].map((item, index) => {
                        const Icon = item.icon;
                        const hasDate = item.date;
                        
                        return (
                          <div key={index} className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              hasDate
                                ? item.color === "green"
                                  ? "bg-gradient-to-br from-green-100 to-green-200 border border-green-300"
                                  : item.color === "blue"
                                  ? "bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300"
                                  : "bg-gradient-to-br from-yellow-100 to-yellow-200 border border-yellow-300"
                                : "bg-gray-100 border border-gray-300"
                            }`}>
                              <Icon className={`h-5 w-5 ${
                                hasDate
                                  ? item.color === "green"
                                    ? "text-green-600"
                                    : item.color === "blue"
                                    ? "text-blue-600"
                                    : "text-yellow-600"
                                  : "text-gray-400"
                              }`} />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{item.label}</p>
                              <p className={`text-sm ${hasDate ? "text-gray-600 font-semibold" : "text-gray-400"}`}>
                                {formatDate(item.date)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Career Stats */}
                {careerStats && (
                  <Card className="shadow-2xl border-green-100">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                      <CardTitle className="text-green-700">Statistiques de Carrière</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                          <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <p className="text-3xl font-bold text-green-700">{careerStats.anciennete}</p>
                          <p className="text-sm text-green-600 mt-1">Ancienneté totale</p>
                        </div>
                        
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                          <User className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-3xl font-bold text-blue-700">{careerStats.age || "N/A"} ans</p>
                          <p className="text-sm text-blue-600 mt-1">Âge actuel</p>
                        </div>
                        
                        <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                          <Calendar className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                          <p className="text-3xl font-bold text-yellow-700">
                            {careerStats.anneesJusquaRetraite || "N/A"} ans
                          </p>
                          <p className="text-sm text-yellow-600 mt-1">Avant la retraite</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Finances Section */}
            {activeSection === "finances" && (
              <div className="space-y-6">
                {/* Salary Details */}
                <Card className="shadow-2xl border-green-100">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                    <CardTitle className="text-green-700 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Rémunération Mensuelle
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="text-sm text-gray-500">Salaire de base</label>
                          <p className="font-bold text-gray-800">{formatCurrency(agent.informations_financieres?.salaire_base || 0)}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <label className="text-sm text-gray-500">Indemnité de logement</label>
                          <p className="font-bold text-gray-800">{formatCurrency(agent.informations_financieres?.indemnite_logement || 0)}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <label className="text-sm text-gray-500">Indemnité de transport</label>
                          <p className="font-bold text-gray-800">{formatCurrency(agent.informations_financieres?.indemnite_transport || 0)}</p>
                        </div>
                        <Separator className="bg-green-100" />
                        <div className="flex justify-between items-center">
                          <label className="text-sm text-gray-700 font-semibold">Salaire brut</label>
                          <p className="font-bold text-green-700">{formatCurrency(agent.informations_financieres?.total_brut || 0)}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="text-sm text-gray-500">Retenues diverses</label>
                          <p className="font-bold text-red-600">-{formatCurrency(agent.informations_financieres?.total_retenues || 0)}</p>
                        </div>
                        <Separator className="bg-green-100" />
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                          <label className="text-sm text-gray-700 font-semibold">Salaire net à percevoir</label>
                          <p className="text-3xl font-bold text-green-700 mt-2">{formatCurrency(agent.informations_financieres?.net_a_payer || 0)}</p>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6 bg-green-100" />

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-green-600" />
                        Coordonnées bancaires
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-500">Nom de la banque</label>
                          <p className="font-semibold text-gray-800">{agent.informations_financieres?.banque || "Non renseigné"}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Numéro de compte</label>
                          <p className="font-semibold text-gray-800 font-mono">{agent.informations_financieres?.numero_compte || "Non renseigné"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Rappels Summary */}
                <Card className="shadow-2xl border-green-100">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                    <CardTitle className="text-green-700 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Rappels de Solde
                    </CardTitle>
                    <CardDescription>
                      Suivi de vos arriérés de salaire
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-600 mb-1">Total Rappels</p>
                        <p className="text-2xl font-bold text-blue-700">{formatCurrency(financials.totalRappels)}</p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                        <p className="text-sm text-green-600 mb-1">Déjà perçu</p>
                        <p className="text-2xl font-bold text-green-700">{formatCurrency(financials.totalPaye)}</p>
                        {financials.totalRappels > 0 && (
                          <p className="text-xs text-green-600 mt-1">
                            {((financials.totalPaye / financials.totalRappels) * 100).toFixed(1)}%
                          </p>
                        )}
                      </div>
                      
                      <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-600 mb-1">Reste à payer</p>
                        <p className="text-2xl font-bold text-yellow-700">{formatCurrency(financials.totalRestant)}</p>
                        <p className="text-xs text-yellow-600 mt-1">
                          {financials.rappelsEnCours} en cours
                        </p>
                      </div>
                    </div>

                    {rappels.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <DollarSign className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>Aucun rappel de solde enregistré</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {rappels.map((rappel) => (
                          <div
                            key={rappel.id}
                            className="border border-green-100 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-800">{rappel.type_rappel}</h4>
                                <p className="text-sm text-gray-500">{rappel.motif || "Aucune description"}</p>
                              </div>
                              <Badge className={
                                rappel.statut === "paye"
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : rappel.statut === "en_cours"
                                  ? "bg-blue-100 text-blue-700 border-blue-200"
                                  : "bg-yellow-100 text-yellow-700 border-yellow-200"
                              }>
                                {rappel.statut === "paye" ? "Payé" : rappel.statut === "en_cours" ? "En cours" : "En attente"}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Période</p>
                                <p className="font-semibold text-gray-800">{rappel.periode}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Montant total</p>
                                <p className="font-semibold text-gray-800">{formatCurrency(rappel.montant_total)}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Déjà payé</p>
                                <p className="font-semibold text-green-600">{formatCurrency(rappel.montant_paye || 0)}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Restant</p>
                                <p className="font-semibold text-yellow-600">{formatCurrency(rappel.montant_restant || 0)}</p>
                              </div>
                            </div>

                            <Separator className="my-3 bg-gray-100" />

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Créé le {formatDate(rappel.created_at)}</span>
                              {rappel.date_paiement_effectif && (
                                <span>Payé le {formatDate(rappel.date_paiement_effectif)}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Documents Section */}
            {activeSection === "documents" && (
              <Card className="shadow-2xl border-green-100">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                  <CardTitle className="text-green-700 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Gestion des Documents
                  </CardTitle>
                  <CardDescription>
                    Vos documents administratifs et justificatifs
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Section en développement</p>
                    <p className="text-sm">La gestion documentaire sera bientôt disponible</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Messages Section */}
            {activeSection === "messages" && (
              <Card className="shadow-2xl border-green-100">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                  <CardTitle className="text-green-700 flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Messagerie DCRH
                    {unreadCount > 0 && (
                      <Badge className="bg-red-500 text-white border-0 ml-2">
                        {unreadCount} non lu{unreadCount > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Messages et alertes de la Direction Centrale des Ressources Humaines
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Mail className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">Aucun message</p>
                      <p className="text-sm">Vous n'avez pas encore reçu de messages</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`border rounded-lg p-4 transition-all ${
                            message.lu
                              ? "border-gray-200 bg-white"
                              : "border-green-300 bg-gradient-to-r from-green-50 to-blue-50 shadow-md"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                                <Mail className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800">{message.sujet}</h4>
                                <p className="text-xs text-gray-500">
                                  De: DCRH - {formatDate(message.date_envoi)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge className={
                                message.priorite === "haute"
                                  ? "bg-red-100 text-red-700 border-red-200"
                                  : message.priorite === "moyenne"
                                  ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                  : "bg-blue-100 text-blue-700 border-blue-200"
                              }>
                                {message.priorite === "haute" ? "Haute" : message.priorite === "moyenne" ? "Moyenne" : "Basse"}
                              </Badge>
                              
                              {!message.lu && (
                                <Button
                                  size="sm"
                                  onClick={() => handleMarkAsRead(message.id)}
                                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Marquer comme lu
                                </Button>
                              )}
                            </div>
                          </div>

                          <p className="text-gray-700 leading-relaxed">{message.contenu}</p>

                          {message.lu && message.date_lecture && (
                            <p className="text-xs text-gray-400 mt-3">
                              Lu le {formatDate(message.date_lecture)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Footer */}
          <footer className="border-t border-green-100 bg-white py-4 px-8 mt-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-green-600" />
                <span>© 2026 République Gabonaise - USSALA</span>
              </div>
              <span>Plateforme de Gestion Administrative et Statutaire</span>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}