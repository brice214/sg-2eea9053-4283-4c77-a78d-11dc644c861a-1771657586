import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { authService } from "@/services/authService";
import { agentDashboardService, type MessageWithSender, type RappelFinancier, type AgentCompletProfile } from "@/services/agentDashboardService";
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
  Home,
  Wallet,
  MessageSquare,
  Bell,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  Award,
  CalendarDays,
  MapPinned,
  School,
  Landmark,
  Timer,
  Activity,
  BarChart3,
  Zap,
  Star
} from "lucide-react";

type MenuSection = "dashboard" | "profil" | "carriere" | "finances" | "documents" | "messages";

export default function AgentDashboard() {
  const router = useRouter();
  const [agent, setAgent] = useState<AgentCompletProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<MenuSection>("dashboard");
  const [rappelsData, setRappelsData] = useState<RappelFinancier | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
      const { data, error } = await agentDashboardService.getAgentCompletProfile(userId);
      
      if (error || !data) {
        console.error("❌ Erreur chargement agent:", error);
        setLoading(false);
        return;
      }

      setAgent(data);

      const { data: rappels } = await agentDashboardService.getRappelsFinanciers(data.id);
      setRappelsData(rappels);

      const { data: msgs } = await agentDashboardService.getMessages(data.id);
      setMessages(msgs || []);

      const count = await agentDashboardService.countUnreadMessages(data.id);
      setUnreadCount(count);
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

  const handleMarkAsRead = async (messageId: string) => {
    await agentDashboardService.markMessageAsRead(messageId);
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, lu: true } : m));
    setUnreadCount(prev => Math.max(0, prev - 1));
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

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "Non renseigné";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
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

  const getRappelLabel = (type: string) => {
    const labels: Record<string, string> = {
      promotion: "Promotion",
      regularisation: "Régularisation",
      avancement: "Avancement",
      indemnite: "Indemnité",
      autre: "Autre rappel"
    };
    return labels[type] || type;
  };

  const getStatutRappelColor = (statut: string) => {
    switch (statut) {
      case "paye": return "bg-green-100 text-green-800 border-green-200";
      case "en_cours": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "en_attente": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatutRappelLabel = (statut: string) => {
    switch (statut) {
      case "paye": return "Payé";
      case "en_cours": return "En cours";
      case "en_attente": return "En attente";
      default: return statut;
    }
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case "haute": return "text-red-600";
      case "moyenne": return "text-yellow-600";
      case "basse": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  const menuItems = [
    { id: "dashboard" as MenuSection, label: "Vue d'ensemble", icon: BarChart3 },
    { id: "profil" as MenuSection, label: "Profil Personnel", icon: User },
    { id: "carriere" as MenuSection, label: "Carrière & Parcours", icon: Target },
    { id: "finances" as MenuSection, label: "Finances & Rappels", icon: Wallet },
    { id: "documents" as MenuSection, label: "Documents", icon: FileText },
    { id: "messages" as MenuSection, label: "Messagerie", icon: MessageSquare, badge: unreadCount }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-purple-500 mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-4 border-purple-300 opacity-20 mx-auto"></div>
          </div>
          <p className="text-white text-lg font-medium">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-red-400">Profil non trouvé</CardTitle>
            <CardDescription className="text-gray-300">Impossible de charger vos informations</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/auth/login")} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = agentDashboardService.calculateCareerStats(agent);

  return (
    <>
      <SEO 
        title={`${agent.prenoms} ${agent.nom} - Tableau de bord Agent`}
        description="Tableau de bord personnel de l'agent public"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header Premium */}
        <header className="bg-black/30 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                    <Zap className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                    USSALA Pro
                  </h1>
                  <p className="text-xs text-gray-400">Votre espace intelligent</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                {/* Notifications */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="relative text-white hover:bg-white/10"
                  onClick={() => setActiveSection("messages")}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Button>

                <Separator orientation="vertical" className="h-8 bg-white/20" />

                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-white">{agent.prenoms} {agent.nom}</p>
                  <p className="text-xs text-gray-400">{agent.matricule}</p>
                </div>
                <Avatar className="h-11 w-11 border-2 border-purple-400/50 ring-2 ring-purple-500/30">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-lg">
                    {getInitials(agent.nom, agent.prenoms)}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Layout principal */}
        <div className="flex">
          {/* Menu latéral premium */}
          <aside className="w-72 bg-black/20 backdrop-blur-xl border-r border-white/10 min-h-[calc(100vh-81px)] sticky top-[81px]">
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50 scale-105"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-all ${isActive ? "bg-white/20" : "bg-white/5 group-hover:bg-white/10"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium flex-1 text-left">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge className="bg-red-500 text-white border-0 h-6 min-w-6 px-2 text-xs font-bold animate-pulse">
                        {item.badge}
                      </Badge>
                    )}
                    {isActive && <ChevronRight className="h-5 w-5" />}
                  </button>
                );
              })}
            </nav>

            {/* Stats rapides premium */}
            <div className="p-4 mt-6 border-t border-white/10">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-4 flex items-center gap-2">
                <Activity className="h-3 w-3" />
                Statistiques Rapides
              </h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-3 border border-blue-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-blue-300">Ancienneté</span>
                    <Clock className="h-3 w-3 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.anciennete} <span className="text-sm text-gray-400">ans</span></p>
                </div>
                
                {stats.anneesJusquaRetraite !== null && (
                  <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg p-3 border border-orange-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-orange-300">Retraite dans</span>
                      <Timer className="h-3 w-3 text-orange-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.anneesJusquaRetraite} <span className="text-sm text-gray-400">ans</span></p>
                  </div>
                )}

                {rappelsData && rappelsData.solde_restant > 0 && (
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-3 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-purple-300">Rappels à percevoir</span>
                      <Wallet className="h-3 w-3 text-purple-400" />
                    </div>
                    <p className="text-lg font-bold text-white">{formatCurrency(rappelsData.solde_restant)}</p>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Contenu principal premium */}
          <main className="flex-1 p-6">
            <ScrollArea className="h-[calc(100vh-105px)]">
              {activeSection === "dashboard" && (
                <div className="space-y-6">
                  {/* Hero Section */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 p-8 shadow-2xl">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-4xl font-bold text-white mb-2">
                            Bienvenue, {agent.prenoms} ! 👋
                          </h2>
                          <p className="text-white/80 text-lg mb-4">
                            {agent.ministere?.nom}
                          </p>
                          <div className="flex items-center gap-4">
                            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm px-4 py-1.5">
                              {agent.grade?.nom || "Grade non défini"}
                            </Badge>
                            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm px-4 py-1.5">
                              {agent.corps?.nom || "Corps non défini"}
                            </Badge>
                          </div>
                        </div>
                        <div className="hidden lg:block">
                          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                            <Award className="h-12 w-12 text-white mb-2" />
                            <p className="text-white text-xs">Statut actif</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Widgets Analytics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <DollarSign className="h-5 w-5 text-blue-400" />
                          </div>
                          <TrendingUp className="h-4 w-4 text-blue-400" />
                        </div>
                        <CardDescription className="text-xs text-blue-300 mt-2">Salaire Net Mensuel</CardDescription>
                        <CardTitle className="text-2xl font-bold text-white">
                          {agent.informations_financieres ? formatCurrency(agent.informations_financieres.net_a_payer) : "N/A"}
                        </CardTitle>
                      </CardHeader>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Clock className="h-5 w-5 text-purple-400" />
                          </div>
                          <Activity className="h-4 w-4 text-purple-400" />
                        </div>
                        <CardDescription className="text-xs text-purple-300 mt-2">Ancienneté</CardDescription>
                        <CardTitle className="text-2xl font-bold text-white">
                          {stats.anciennete} ans
                        </CardTitle>
                      </CardHeader>
                    </Card>

                    {rappelsData && (
                      <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                              <Wallet className="h-5 w-5 text-orange-400" />
                            </div>
                            <AlertCircle className="h-4 w-4 text-orange-400" />
                          </div>
                          <CardDescription className="text-xs text-orange-300 mt-2">Rappels à percevoir</CardDescription>
                          <CardTitle className="text-2xl font-bold text-white">
                            {formatCurrency(rappelsData.solde_restant)}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    )}

                    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="p-2 bg-green-500/20 rounded-lg">
                            <MessageSquare className="h-5 w-5 text-green-400" />
                          </div>
                          <Bell className="h-4 w-4 text-green-400" />
                        </div>
                        <CardDescription className="text-xs text-green-300 mt-2">Messages</CardDescription>
                        <CardTitle className="text-2xl font-bold text-white">
                          {messages.length} <span className="text-sm text-gray-400">({unreadCount} non lus)</span>
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </div>

                  {/* Timeline de carrière Preview */}
                  <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Target className="h-6 w-6 text-purple-400" />
                        Progression de Carrière
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Votre parcours professionnel en un coup d'œil
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress bar */}
                      {stats.anneesJusquaRetraite !== null && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Progression vers la retraite</span>
                            <span className="text-white font-semibold">
                              {Math.round((stats.anciennete / (stats.anciennete + stats.anneesJusquaRetraite)) * 100)}%
                            </span>
                          </div>
                          <Progress 
                            value={(stats.anciennete / (stats.anciennete + stats.anneesJusquaRetraite)) * 100} 
                            className="h-3 bg-white/10"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        {agent.date_recrutement && (
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                              <CalendarDays className="h-4 w-4 text-blue-400" />
                              <p className="text-xs text-gray-400">Recrutement</p>
                            </div>
                            <p className="text-white font-semibold">{formatDate(agent.date_recrutement)}</p>
                          </div>
                        )}
                        {agent.date_integration && (
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                              <School className="h-4 w-4 text-purple-400" />
                              <p className="text-xs text-gray-400">Intégration</p>
                            </div>
                            <p className="text-white font-semibold">{formatDate(agent.date_integration)}</p>
                          </div>
                        )}
                        {agent.date_titularisation && (
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                              <Award className="h-4 w-4 text-green-400" />
                              <p className="text-xs text-gray-400">Titularisation</p>
                            </div>
                            <p className="text-white font-semibold">{formatDate(agent.date_titularisation)}</p>
                          </div>
                        )}
                      </div>

                      <Button 
                        variant="outline" 
                        className="w-full border-white/20 text-white hover:bg-white/10"
                        onClick={() => setActiveSection("carriere")}
                      >
                        Voir la timeline complète
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Alertes et Notifications */}
                  {(unreadCount > 0 || (rappelsData && rappelsData.solde_restant > 0)) && (
                    <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Bell className="h-5 w-5 text-yellow-400" />
                          Notifications Importantes
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {unreadCount > 0 && (
                          <div className="flex items-center gap-3 p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                            <MessageSquare className="h-5 w-5 text-purple-400" />
                            <div className="flex-1">
                              <p className="text-white font-medium text-sm">Nouveaux messages</p>
                              <p className="text-gray-400 text-xs">Vous avez {unreadCount} message{unreadCount > 1 ? "s" : ""} non lu{unreadCount > 1 ? "s" : ""}</p>
                            </div>
                            <Button size="sm" variant="outline" className="border-purple-400/50 text-purple-400 hover:bg-purple-500/20" onClick={() => setActiveSection("messages")}>
                              Voir
                            </Button>
                          </div>
                        )}
                        {rappelsData && rappelsData.solde_restant > 0 && (
                          <div className="flex items-center gap-3 p-3 bg-orange-500/20 rounded-lg border border-orange-500/30">
                            <Wallet className="h-5 w-5 text-orange-400" />
                            <div className="flex-1">
                              <p className="text-white font-medium text-sm">Rappels de solde en attente</p>
                              <p className="text-gray-400 text-xs">{formatCurrency(rappelsData.solde_restant)} à percevoir</p>
                            </div>
                            <Button size="sm" variant="outline" className="border-orange-400/50 text-orange-400 hover:bg-orange-500/20" onClick={() => setActiveSection("finances")}>
                              Détails
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {activeSection === "profil" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">Profil Personnel</h2>
                      <p className="text-gray-400">Informations personnelles et familiales</p>
                    </div>
                  </div>

                  {/* Informations personnelles */}
                  <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <User className="h-5 w-5 text-blue-400" />
                        Identité
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <p className="text-xs text-gray-400 mb-1">Matricule</p>
                          <p className="font-mono font-bold text-white text-lg">{agent.matricule}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <p className="text-xs text-gray-400 mb-1">Nom complet</p>
                          <p className="font-semibold text-white">{agent.prenoms} {agent.nom}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            Email
                          </p>
                          <p className="text-white">{agent.email}</p>
                        </div>
                        {agent.telephone && (
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              Téléphone
                            </p>
                            <p className="text-white font-medium">{agent.telephone}</p>
                          </div>
                        )}
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Date de naissance
                          </p>
                          <p className="text-white font-medium">{formatDate(agent.date_naissance)}</p>
                          {stats.age && (
                            <p className="text-xs text-gray-500 mt-1">{stats.age} ans</p>
                          )}
                        </div>
                        {agent.lieu_naissance && (
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Lieu de naissance
                            </p>
                            <p className="text-white font-medium">{agent.lieu_naissance}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Situation familiale */}
                  <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Heart className="h-5 w-5 text-pink-400" />
                        Situation Familiale
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            Situation matrimoniale
                          </p>
                          <p className="text-white font-semibold text-lg">
                            {getSituationMatrimonialeLabel(agent.situation_matrimoniale)}
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Nombre d'enfants
                          </p>
                          <p className="text-white font-bold text-2xl">{agent.nombre_enfants || 0}</p>
                        </div>
                      </div>
                      {agent.adresse_actuelle && (
                        <div className="mt-4 bg-white/5 rounded-lg p-4 border border-white/10">
                          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Adresse actuelle
                          </p>
                          <p className="text-white font-medium">{agent.adresse_actuelle}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeSection === "carriere" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">Carrière & Parcours</h2>
                      <p className="text-gray-400">Votre historique professionnel complet</p>
                    </div>
                  </div>

                  {/* Situation administrative actuelle */}
                  <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Building2 className="h-5 w-5 text-purple-400" />
                        Situation Administrative Actuelle
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                          <p className="text-xs text-purple-300 mb-1 flex items-center gap-1">
                            <Landmark className="h-3 w-3" />
                            Ministère de tutelle
                          </p>
                          <p className="text-white font-bold text-lg">{agent.ministere?.nom}</p>
                          <Badge className="mt-2 bg-purple-500/30 text-purple-200 border-purple-400/50">
                            {agent.ministere?.sigle}
                          </Badge>
                        </div>
                        {agent.corps && (
                          <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                            <p className="text-xs text-purple-300 mb-1 flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" />
                              Corps
                            </p>
                            <p className="text-white font-semibold text-lg">{agent.corps.nom}</p>
                            {agent.corps.code && (
                              <p className="text-xs text-gray-400 mt-1 font-mono">{agent.corps.code}</p>
                            )}
                          </div>
                        )}
                        {agent.grade && (
                          <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                            <p className="text-xs text-purple-300 mb-1 flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              Grade
                            </p>
                            <p className="text-white font-semibold text-lg">{agent.grade.nom}</p>
                            {agent.grade.code && (
                              <p className="text-xs text-gray-400 mt-1 font-mono">{agent.grade.code}</p>
                            )}
                          </div>
                        )}
                        {agent.lieu_affectation_actuel && (
                          <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                            <p className="text-xs text-purple-300 mb-1 flex items-center gap-1">
                              <MapPinned className="h-3 w-3" />
                              Lieu d'affectation actuel
                            </p>
                            <p className="text-white font-semibold text-lg">{agent.lieu_affectation_actuel}</p>
                          </div>
                        )}
                      </div>

                      {agent.etablissement_affectation && (
                        <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                          <p className="text-xs text-purple-300 mb-1 flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            Établissement / Direction provinciale
                          </p>
                          <p className="text-white font-semibold">{agent.etablissement_affectation}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Timeline de carrière complète */}
                  <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <CalendarDays className="h-5 w-5 text-blue-400" />
                        Timeline de Carrière Complète
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Historique chronologique de votre parcours professionnel
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Création d'une timeline visuelle */}
                        {[
                          { date: agent.date_recrutement, label: "Date de recrutement", icon: Briefcase, color: "blue" },
                          { date: agent.date_prise_service, label: "Date de prise de service", icon: CalendarDays, color: "green" },
                          { date: agent.date_integration, label: "Date d'intégration", icon: School, color: "purple" },
                          { date: agent.date_titularisation, label: "Date de titularisation", icon: Award, color: "emerald" },
                          { date: agent.date_reprise_service, label: "Date de reprise de service", icon: CalendarDays, color: "cyan" },
                          { date: agent.date_reclassement, label: "Date de reclassement", icon: TrendingUp, color: "orange" },
                          { date: agent.date_mise_retraite, label: "Date de mise en retraite", icon: Timer, color: "red" },
                        ].filter(item => item.date).map((item, index) => {
                          const Icon = item.icon;
                          return (
                            <div key={index} className="flex items-start gap-4">
                              <div className={`p-3 bg-${item.color}-500/20 rounded-lg border border-${item.color}-500/30 flex-shrink-0`}>
                                <Icon className={`h-5 w-5 text-${item.color}-400`} />
                              </div>
                              <div className="flex-1 bg-white/5 rounded-lg p-4 border border-white/10">
                                <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                                <p className="text-white font-bold text-lg">{formatDate(item.date)}</p>
                              </div>
                            </div>
                          );
                        })}

                        {/* Si aucune date n'est disponible */}
                        {![agent.date_recrutement, agent.date_prise_service, agent.date_integration, agent.date_titularisation, agent.date_reprise_service, agent.date_reclassement, agent.date_mise_retraite].some(d => d) && (
                          <div className="text-center py-12">
                            <CalendarDays className="h-16 w-16 mx-auto mb-4 text-gray-600 opacity-50" />
                            <p className="text-gray-400">Aucune date de carrière enregistrée</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Statistiques de carrière */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg w-fit">
                          <Clock className="h-5 w-5 text-blue-400" />
                        </div>
                        <CardDescription className="text-xs text-blue-300 mt-2">Ancienneté totale</CardDescription>
                        <CardTitle className="text-3xl font-bold text-white">
                          {stats.anciennete} ans
                        </CardTitle>
                      </CardHeader>
                    </Card>

                    {stats.age && (
                      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                          <div className="p-2 bg-purple-500/20 rounded-lg w-fit">
                            <User className="h-5 w-5 text-purple-400" />
                          </div>
                          <CardDescription className="text-xs text-purple-300 mt-2">Âge actuel</CardDescription>
                          <CardTitle className="text-3xl font-bold text-white">
                            {stats.age} ans
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    )}

                    {stats.anneesJusquaRetraite !== null && (
                      <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                          <div className="p-2 bg-orange-500/20 rounded-lg w-fit">
                            <Timer className="h-5 w-5 text-orange-400" />
                          </div>
                          <CardDescription className="text-xs text-orange-300 mt-2">Années avant retraite</CardDescription>
                          <CardTitle className="text-3xl font-bold text-white">
                            {stats.anneesJusquaRetraite} ans
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {activeSection === "finances" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                      <Wallet className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">Finances & Rappels</h2>
                      <p className="text-gray-400">Situation financière et rappels de solde</p>
                    </div>
                  </div>

                  {/* Rémunération mensuelle */}
                  {agent.informations_financieres && (
                    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <DollarSign className="h-5 w-5 text-green-400" />
                          Rémunération Mensuelle
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                            <p className="text-xs text-green-300 mb-1">Salaire de base</p>
                            <p className="text-2xl font-bold text-white">
                              {formatCurrency(agent.informations_financieres.salaire_base)}
                            </p>
                          </div>
                          <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                            <p className="text-xs text-green-300 mb-1">Indemnité logement</p>
                            <p className="text-2xl font-bold text-white">
                              {formatCurrency(agent.informations_financieres.indemnite_logement)}
                            </p>
                          </div>
                          <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                            <p className="text-xs text-green-300 mb-1">Indemnité transport</p>
                            <p className="text-2xl font-bold text-white">
                              {formatCurrency(agent.informations_financieres.indemnite_transport)}
                            </p>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 shadow-lg">
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-white/80">Net à payer mensuel</p>
                            <Badge className="bg-white/20 text-white border-0">
                              Après retenues
                            </Badge>
                          </div>
                          <p className="text-5xl font-bold text-white mb-2">
                            {formatCurrency(agent.informations_financieres.net_a_payer)}
                          </p>
                          <div className="flex items-center justify-between text-sm text-white/70">
                            <span>Brut: {formatCurrency(agent.informations_financieres.total_brut)}</span>
                            <span>Retenues: {formatCurrency(agent.informations_financieres.total_retenues)}</span>
                          </div>
                        </div>

                        {(agent.informations_financieres.banque || agent.informations_financieres.numero_compte) && (
                          <>
                            <Separator className="bg-white/10" />
                            <div>
                              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Coordonnées bancaires
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {agent.informations_financieres.banque && (
                                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                    <p className="text-xs text-gray-400 mb-1">Banque</p>
                                    <p className="font-semibold text-white">
                                      {agent.informations_financieres.banque}
                                    </p>
                                  </div>
                                )}
                                {agent.informations_financieres.numero_compte && (
                                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                    <p className="text-xs text-gray-400 mb-1">Numéro de compte</p>
                                    <p className="font-mono text-sm font-semibold text-white">
                                      {agent.informations_financieres.numero_compte}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Rappels de solde */}
                  {rappelsData && (
                    <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Wallet className="h-5 w-5 text-yellow-400" />
                          Rappels de Solde
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Historique de vos rappels et arriérés de salaire
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Résumé des rappels */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-4 border border-blue-500/30">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="h-5 w-5 text-blue-400" />
                              <p className="text-xs text-blue-300">Total rappels</p>
                            </div>
                            <p className="text-3xl font-bold text-white">
                              {formatCurrency(rappelsData.total_rappel)}
                            </p>
                          </div>

                          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-4 border border-green-500/30">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle2 className="h-5 w-5 text-green-400" />
                              <p className="text-xs text-green-300">Déjà perçu</p>
                            </div>
                            <p className="text-3xl font-bold text-white">
                              {formatCurrency(rappelsData.total_percu)}
                            </p>
                            <p className="text-xs text-green-400 mt-1">
                              {rappelsData.total_rappel > 0 
                                ? `${Math.round((rappelsData.total_percu / rappelsData.total_rappel) * 100)}% perçu`
                                : "0% perçu"}
                            </p>
                          </div>

                          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-500/30">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-5 w-5 text-yellow-400" />
                              <p className="text-xs text-yellow-300">Reste à payer</p>
                            </div>
                            <p className="text-3xl font-bold text-white">
                              {formatCurrency(rappelsData.solde_restant)}
                            </p>
                            <p className="text-xs text-yellow-400 mt-1">
                              {rappelsData.rappels.filter(r => r.statut !== "paye").length} en cours
                            </p>
                          </div>
                        </div>

                        {/* Liste des rappels */}
                        {rappelsData.rappels.length > 0 ? (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-white flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Détail des rappels
                            </h4>
                            {rappelsData.rappels.map((rappel) => (
                              <div key={rappel.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-purple-500/50 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h5 className="font-bold text-white text-lg">{getRappelLabel(rappel.type_rappel)}</h5>
                                      <Badge className={getStatutRappelColor(rappel.statut || "EN_ATTENTE")}>
                                        {getStatutRappelLabel(rappel.statut || "EN_ATTENTE")}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-400">{rappel.motif || "Aucun motif spécifié"}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-2xl font-bold text-white">
                                      {formatCurrency(Number(rappel.montant_total))}
                                    </p>
                                    <p className="text-xs text-gray-500">Montant total</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                    <p className="text-xs text-gray-400 mb-1">Période</p>
                                    <p className="font-medium text-white text-sm">
                                      {new Date(rappel.periode_debut).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                                      {" - "}
                                      {new Date(rappel.periode_fin).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                                    </p>
                                  </div>
                                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                    <p className="text-xs text-gray-400 mb-1">Perçu</p>
                                    <p className="font-bold text-green-400">
                                      {formatCurrency(Number(rappel.montant_paye || 0))}
                                    </p>
                                  </div>
                                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                    <p className="text-xs text-gray-400 mb-1">Reste</p>
                                    <p className="font-bold text-yellow-400">
                                      {formatCurrency(Number(rappel.montant_restant))}
                                    </p>
                                  </div>
                                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                    <p className="text-xs text-gray-400 mb-1">Créé le</p>
                                    <p className="font-medium text-white text-sm">
                                      {formatDate(rappel.created_at || undefined)}
                                    </p>
                                  </div>
                                </div>

                                {rappel.date_paiement_effectif && (
                                  <div className="mt-3 pt-3 border-t border-white/10">
                                    <p className="text-xs text-green-400 flex items-center gap-1">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Payé le {formatDate(rappel.date_paiement_effectif)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <Wallet className="h-16 w-16 mx-auto mb-4 text-gray-600 opacity-50" />
                            <p className="text-gray-400 text-lg">Aucun rappel de solde enregistré</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {activeSection === "documents" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">Documents</h2>
                      <p className="text-gray-400">Gestion de vos documents administratifs</p>
                    </div>
                  </div>

                  <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <FileText className="h-5 w-5 text-blue-400" />
                        Documents administratifs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-16">
                        <div className="relative inline-block mb-6">
                          <FileText className="h-24 w-24 text-gray-600 opacity-30" />
                          <div className="absolute -top-2 -right-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-2">
                            <Star className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <p className="text-xl font-semibold text-white mb-2">Fonctionnalité en cours de développement</p>
                        <p className="text-gray-400">La gestion des documents sera bientôt disponible</p>
                        <Button className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" disabled>
                          Bientôt disponible
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeSection === "messages" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                      <MessageSquare className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">Messagerie</h2>
                      <p className="text-gray-400">Alertes et notifications de la DCRH</p>
                    </div>
                  </div>

                  <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Bell className="h-5 w-5 text-purple-400" />
                          Messages reçus
                        </CardTitle>
                        {unreadCount > 0 && (
                          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 px-3 py-1 animate-pulse">
                            {unreadCount} non lu{unreadCount > 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {messages.length > 0 ? (
                        <div className="space-y-3">
                          {messages.map((message) => (
                            <div 
                              key={message.id} 
                              className={`border rounded-xl p-5 transition-all ${
                                !message.lu 
                                  ? "border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-pink-500/10 shadow-lg shadow-purple-500/20" 
                                  : "border-white/10 bg-white/5"
                              }`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h5 className="font-bold text-white text-lg">{message.sujet}</h5>
                                    {!message.lu && (
                                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs border-0 animate-pulse">
                                        Nouveau
                                      </Badge>
                                    )}
                                    <Badge variant="outline" className={`${getPrioriteColor(message.priorite || "normale")} border-current`}>
                                      {message.priorite === "haute" && "🔥 Priorité haute"}
                                      {message.priorite === "moyenne" && "⚠️ Priorité moyenne"}
                                      {message.priorite === "basse" && "ℹ️ Priorité basse"}
                                    </Badge>
                                  </div>
                                  {message.expediteur && (
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      De: {message.expediteur.prenoms} {message.expediteur.nom} (DCRH)
                                    </p>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 whitespace-nowrap ml-4">
                                  {formatDateTime(message.created_at || undefined)}
                                </p>
                              </div>

                              <div className="bg-white/5 rounded-lg p-4 mb-3 border border-white/10">
                                <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                                  {message.contenu}
                                </p>
                              </div>

                              {!message.lu && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleMarkAsRead(message.id)}
                                  className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300"
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Marquer comme lu
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16">
                          <div className="relative inline-block mb-6">
                            <MessageSquare className="h-24 w-24 text-gray-600 opacity-30" />
                            <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-2">
                              <Bell className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <p className="text-xl font-semibold text-white mb-2">Aucun message</p>
                          <p className="text-gray-400">Vous n'avez pas encore reçu de message de la DCRH</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </ScrollArea>
          </main>
        </div>

        {/* Footer Premium */}
        <footer className="bg-black/30 backdrop-blur-xl border-t border-white/10">
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400">
                © 2026 USSALA - République Gabonaise
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-400">Connexion sécurisée</span>
                </div>
                <Separator orientation="vertical" className="h-4 bg-white/20" />
                <span className="text-xs text-gray-400">Powered by USSALA Pro</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}