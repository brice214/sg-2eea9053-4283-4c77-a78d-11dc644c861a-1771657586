import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { authService } from "@/services/authService";
import { agentService } from "@/services/agentService";
import { agentDashboardService, type MessageWithSender, type RappelFinancier } from "@/services/agentDashboardService";
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
  Clock
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
    numero_compte?: string;
    banque?: string;
  };
}

type MenuSection = "dashboard" | "finances" | "documents" | "messages";

export default function AgentDashboard() {
  const router = useRouter();
  const [agent, setAgent] = useState<AgentProfile | null>(null);
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
      const { data, error } = await agentService.getAgentByUserId(userId);
      
      if (error || !data) {
        console.error("❌ Erreur chargement agent:", error);
        setLoading(false);
        return;
      }

      setAgent(data);

      // Charger les rappels financiers
      const { data: rappels } = await agentDashboardService.getRappelsFinanciers(data.id);
      setRappelsData(rappels);

      // Charger les messages
      const { data: msgs } = await agentDashboardService.getMessages(data.id);
      setMessages(msgs || []);

      // Compter les non lus
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
    { id: "dashboard" as MenuSection, label: "Tableau de bord", icon: Home },
    { id: "finances" as MenuSection, label: "Finances & Rappels", icon: Wallet },
    { id: "documents" as MenuSection, label: "Documents", icon: FileText },
    { id: "messages" as MenuSection, label: "Messagerie", icon: MessageSquare, badge: unreadCount }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Profil non trouvé</CardTitle>
            <CardDescription>Impossible de charger vos informations</CardDescription>
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
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {/* Header fixe */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      USSALA
                    </h1>
                    <p className="text-xs text-gray-500">Mon Espace Agent</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{agent.prenoms} {agent.nom}</p>
                  <p className="text-xs text-gray-500">{agent.matricule}</p>
                </div>
                <Avatar className="h-10 w-10 border-2 border-emerald-200">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-semibold">
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

        {/* Layout principal */}
        <div className="flex">
          {/* Menu latéral gauche */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] sticky top-[73px]">
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium flex-1 text-left">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge className="bg-red-500 text-white border-0 h-5 min-w-5 px-1.5 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {isActive && <ChevronRight className="h-4 w-4" />}
                  </button>
                );
              })}
            </nav>

            {/* Stats rapides */}
            <div className="p-4 mt-6 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Statistiques</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ancienneté</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {agent.date_recrutement 
                      ? Math.floor((new Date().getTime() - new Date(agent.date_recrutement).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
                      : 0} ans
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Messages</span>
                  <span className="text-sm font-bold text-blue-600">{messages.length}</span>
                </div>
                {rappelsData && rappelsData.solde_restant > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rappels en cours</span>
                    <span className="text-sm font-bold text-yellow-600">{rappelsData.rappels.filter(r => r.statut !== "paye").length}</span>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Contenu principal */}
          <main className="flex-1 p-6">
            <ScrollArea className="h-[calc(100vh-97px)]">
              {activeSection === "dashboard" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Bienvenue, {agent.prenoms} !
                    </h2>
                    <p className="text-gray-600">
                      {agent.ministere?.nom}
                    </p>
                  </div>

                  {/* Vue d'ensemble financière */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-l-4 border-l-emerald-500">
                      <CardHeader className="pb-3">
                        <CardDescription className="text-xs">Salaire mensuel net</CardDescription>
                        <CardTitle className="text-2xl font-bold text-emerald-600">
                          {agent.informations_financieres ? formatCurrency(agent.informations_financieres.net_a_payer) : "N/A"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <TrendingUp className="h-3 w-3" />
                          <span>Paiement régulier</span>
                        </div>
                      </CardContent>
                    </Card>

                    {rappelsData && (
                      <>
                        <Card className="border-l-4 border-l-blue-500">
                          <CardHeader className="pb-3">
                            <CardDescription className="text-xs">Total rappels</CardDescription>
                            <CardTitle className="text-2xl font-bold text-blue-600">
                              {formatCurrency(rappelsData.total_rappel)}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{rappelsData.rappels.length} rappel(s)</span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-yellow-500">
                          <CardHeader className="pb-3">
                            <CardDescription className="text-xs">Solde à percevoir</CardDescription>
                            <CardTitle className="text-2xl font-bold text-yellow-600">
                              {formatCurrency(rappelsData.solde_restant)}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {rappelsData.solde_restant > 0 ? (
                                <>
                                  <AlertCircle className="h-3 w-3" />
                                  <span>En attente</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>À jour</span>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    )}
                  </div>

                  {/* Informations personnelles */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-emerald-600" />
                        Informations Personnelles
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Matricule</p>
                          <p className="font-semibold text-gray-900">{agent.matricule}</p>
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
                        {agent.adresse_actuelle && (
                          <div className="space-y-1 md:col-span-2">
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Adresse actuelle
                            </p>
                            <p className="font-medium text-gray-700">{agent.adresse_actuelle}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Informations professionnelles */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-teal-600" />
                        Informations Professionnelles
                      </CardTitle>
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
                </div>
              )}

              {activeSection === "finances" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Finances & Rappels
                    </h2>
                    <p className="text-gray-600">
                      Consultez votre situation financière et les rappels de solde
                    </p>
                  </div>

                  {/* Résumé financier */}
                  {agent.informations_financieres && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-emerald-600" />
                          Rémunération Mensuelle
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <p className="text-sm text-blue-600 mb-1">Salaire de base</p>
                            <p className="text-2xl font-bold text-blue-900">
                              {formatCurrency(agent.informations_financieres.salaire_base)}
                            </p>
                          </div>
                          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                            <p className="text-sm text-emerald-600 mb-1">Indemnité logement</p>
                            <p className="text-2xl font-bold text-emerald-900">
                              {formatCurrency(agent.informations_financieres.indemnite_logement)}
                            </p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                            <p className="text-sm text-purple-600 mb-1">Indemnité transport</p>
                            <p className="text-2xl font-bold text-purple-900">
                              {formatCurrency(agent.informations_financieres.indemnite_transport)}
                            </p>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg p-6 text-white">
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-sm opacity-90">Net à payer mensuel</p>
                            <Badge className="bg-white/20 text-white border-0">
                              Après retenues
                            </Badge>
                          </div>
                          <p className="text-4xl font-bold mb-2">
                            {formatCurrency(agent.informations_financieres.net_a_payer)}
                          </p>
                          <p className="text-xs opacity-75">
                            Total brut: {formatCurrency(agent.informations_financieres.total_brut)} · 
                            Retenues: {formatCurrency(agent.informations_financieres.total_retenues)}
                          </p>
                        </div>

                        {(agent.informations_financieres.banque || agent.informations_financieres.numero_compte) && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Coordonnées bancaires
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {agent.informations_financieres.banque && (
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">Banque</p>
                                    <p className="font-semibold text-gray-900">
                                      {agent.informations_financieres.banque}
                                    </p>
                                  </div>
                                )}
                                {agent.informations_financieres.numero_compte && (
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">Numéro de compte</p>
                                    <p className="font-mono text-sm font-semibold text-gray-900">
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
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Wallet className="h-5 w-5 text-yellow-600" />
                          Rappels de Solde
                        </CardTitle>
                        <CardDescription>
                          Historique de vos rappels et arriérés de salaire
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Résumé des rappels */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="h-4 w-4 text-blue-600" />
                              <p className="text-sm text-blue-600">Total rappels</p>
                            </div>
                            <p className="text-2xl font-bold text-blue-900">
                              {formatCurrency(rappelsData.total_rappel)}
                            </p>
                          </div>

                          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              <p className="text-sm text-emerald-600">Déjà perçu</p>
                            </div>
                            <p className="text-2xl font-bold text-emerald-900">
                              {formatCurrency(rappelsData.total_percu)}
                            </p>
                            <p className="text-xs text-emerald-700 mt-1">
                              {rappelsData.total_rappel > 0 
                                ? `${Math.round((rappelsData.total_percu / rappelsData.total_rappel) * 100)}% perçu`
                                : "0% perçu"}
                            </p>
                          </div>

                          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-4 w-4 text-yellow-600" />
                              <p className="text-sm text-yellow-600">Reste à payer</p>
                            </div>
                            <p className="text-2xl font-bold text-yellow-900">
                              {formatCurrency(rappelsData.solde_restant)}
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                              {rappelsData.rappels.filter(r => r.statut !== "paye").length} en cours
                            </p>
                          </div>
                        </div>

                        {/* Liste des rappels */}
                        {rappelsData.rappels.length > 0 ? (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900">Détail des rappels</h4>
                            {rappelsData.rappels.map((rappel) => (
                              <div key={rappel.id} className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h5 className="font-semibold text-gray-900">{rappel.libelle}</h5>
                                      <Badge className={getStatutRappelColor(rappel.statut)}>
                                        {getStatutRappelLabel(rappel.statut)}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600">{rappel.description || "Aucune description"}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900">
                                      {formatCurrency(rappel.montant_total)}
                                    </p>
                                    <p className="text-xs text-gray-500">Montant total</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                  <div>
                                    <p className="text-gray-500 text-xs mb-1">Période</p>
                                    <p className="font-medium text-gray-900">
                                      {new Date(rappel.periode_debut).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                                      {" - "}
                                      {new Date(rappel.periode_fin).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-xs mb-1">Perçu</p>
                                    <p className="font-medium text-emerald-600">
                                      {formatCurrency(rappel.montant_percu)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-xs mb-1">Reste</p>
                                    <p className="font-medium text-yellow-600">
                                      {formatCurrency(rappel.solde_restant)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-xs mb-1">Créé le</p>
                                    <p className="font-medium text-gray-700">
                                      {formatDate(rappel.date_creation)}
                                    </p>
                                  </div>
                                </div>

                                {rappel.date_paiement && (
                                  <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-500">
                                      <CheckCircle2 className="h-3 w-3 inline mr-1" />
                                      Payé le {formatDate(rappel.date_paiement)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>Aucun rappel de solde enregistré</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {activeSection === "documents" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Documents
                    </h2>
                    <p className="text-gray-600">
                      Gérez vos documents administratifs
                    </p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Documents administratifs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 text-gray-500">
                        <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">Fonctionnalité en cours de développement</p>
                        <p className="text-sm">La gestion des documents sera bientôt disponible</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeSection === "messages" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Messagerie
                    </h2>
                    <p className="text-gray-600">
                      Alertes et notifications de la DCRH
                    </p>
                  </div>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="h-5 w-5 text-purple-600" />
                          Messages reçus
                        </CardTitle>
                        {unreadCount > 0 && (
                          <Badge className="bg-red-500 text-white">
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
                              className={`border rounded-lg p-4 transition-all ${
                                !message.lu 
                                  ? "border-purple-200 bg-purple-50" 
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-semibold text-gray-900">{message.objet}</h5>
                                    {!message.lu && (
                                      <Badge className="bg-purple-500 text-white text-xs">
                                        Nouveau
                                      </Badge>
                                    )}
                                    <Badge variant="outline" className={getPrioriteColor(message.priorite)}>
                                      {message.priorite === "haute" && "Priorité haute"}
                                      {message.priorite === "moyenne" && "Priorité moyenne"}
                                      {message.priorite === "basse" && "Priorité basse"}
                                    </Badge>
                                  </div>
                                  {message.expediteur && (
                                    <p className="text-xs text-gray-500">
                                      De: {message.expediteur.prenoms} {message.expediteur.nom} (DCRH)
                                    </p>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 whitespace-nowrap ml-4">
                                  {formatDateTime(message.date_envoi)}
                                </p>
                              </div>

                              <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">
                                {message.contenu}
                              </p>

                              {!message.lu && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleMarkAsRead(message.id)}
                                  className="text-purple-600 border-purple-300 hover:bg-purple-50"
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Marquer comme lu
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">Aucun message</p>
                          <p className="text-sm">Vous n'avez pas encore reçu de message de la DCRH</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </ScrollArea>
          </main>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200">
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500">
                © 2026 USSALA - République Gabonaise
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Connexion sécurisée</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}