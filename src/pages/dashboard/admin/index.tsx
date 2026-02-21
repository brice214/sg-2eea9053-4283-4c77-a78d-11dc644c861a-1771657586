import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authService } from "@/services/authService";
import { adminService } from "@/services/adminService";
import { 
  Users, 
  Shield, 
  UserCheck, 
  Search, 
  Lock, 
  Unlock,
  AlertCircle,
  CheckCircle2,
  LogOut
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // États pour la promotion
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [promotionRole, setPromotionRole] = useState<"rh_ministere" | "rh_central">("rh_ministere");
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [promoting, setPromoting] = useState(false);

  // États pour le verrouillage du DCRH
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [lockReason, setLockReason] = useState("");
  const [locking, setLocking] = useState(false);

  // Liste des RH
  const [rhList, setRhList] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const session = await authService.getCurrentSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }

    const { profile, error: profileError } = await authService.getUserProfile();
    if (profileError || !profile) {
      setError("Impossible de récupérer votre profil utilisateur");
      setLoading(false);
      return;
    }

    if (profile.role !== "admin_ministere") {
      setError("Vous n'avez pas les autorisations nécessaires pour accéder à cette page.");
      setLoading(false);
      return;
    }

    setUserProfile(profile);
    await loadDashboardData(profile.ministere_id);
  };

  const loadDashboardData = async (ministere_id: string) => {
    setLoading(true);
    
    const [statsData, rhListData] = await Promise.all([
      adminService.getMinistereStats(ministere_id),
      adminService.getRHList(ministere_id)
    ]);

    setStats(statsData);
    setRhList(rhListData.rh_list);
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Veuillez entrer un terme de recherche");
      return;
    }

    setSearching(true);
    setError(null);
    
    const { agents, error: searchError } = await adminService.searchAgents(
      userProfile.ministere_id,
      searchQuery
    );

    if (searchError) {
      setError(searchError);
      setSearchResults([]);
    } else {
      setSearchResults(agents);
    }

    setSearching(false);
  };

  const handlePromoteClick = async (agent: any, role: "rh_ministere" | "rh_central") => {
    setSelectedAgent(agent);
    setPromotionRole(role);

    // Si c'est une promotion vers DCRH, vérifier s'il y a déjà un DCRH actif
    if (role === "rh_central" && stats.dcrh_actif) {
      setError("Un DCRH est déjà actif. Vous devez d'abord le verrouiller avant de promouvoir un nouvel agent.");
      return;
    }

    setShowPromotionDialog(true);
  };

  const handlePromote = async () => {
    if (!selectedAgent) return;

    setPromoting(true);
    setError(null);
    setSuccess(null);

    if (promotionRole === "rh_ministere") {
      const { success: promoteSuccess, error: promoteError } = await adminService.promoteToRH(
        selectedAgent.id,
        userProfile.ministere_id,
        userProfile.id
      );

      if (promoteError) {
        setError(promoteError);
      } else if (promoteSuccess) {
        setSuccess(`Agent promu avec succès en gestionnaire RH`);
        setShowPromotionDialog(false);
        setSearchResults([]);
        setSearchQuery("");
        await loadDashboardData(userProfile.ministere_id);
      }
    } else {
      const { success: promoteSuccess, error: promoteError } = await adminService.promoteToDCRH(
        selectedAgent.id,
        userProfile.ministere_id,
        userProfile.id
      );

      if (promoteError) {
        setError(promoteError);
      } else if (promoteSuccess) {
        setSuccess(`Agent promu avec succès en DCRH (Direction Centrale des Ressources Humaines)`);
        setShowPromotionDialog(false);
        setSearchResults([]);
        setSearchQuery("");
        await loadDashboardData(userProfile.ministere_id);
      }
    }

    setPromoting(false);
  };

  const handleLockDCRH = async () => {
    if (!lockReason.trim()) {
      setError("Veuillez indiquer la raison du verrouillage");
      return;
    }

    setLocking(true);
    setError(null);

    const { success: lockSuccess, error: lockError } = await adminService.lockCurrentDCRH(
      userProfile.ministere_id,
      userProfile.id,
      lockReason
    );

    if (lockError) {
      setError(lockError);
    } else if (lockSuccess) {
      setSuccess("DCRH verrouillé avec succès. Vous pouvez maintenant promouvoir un nouvel agent.");
      setShowLockDialog(false);
      setLockReason("");
      await loadDashboardData(userProfile.ministere_id);
    }

    setLocking(false);
  };

  const handleRevokeRH = async (profileId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir révoquer ce rôle RH ?")) return;

    const { success: revokeSuccess, error: revokeError } = await adminService.revokeRHRole(profileId);

    if (revokeError) {
      setError(revokeError);
    } else if (revokeSuccess) {
      setSuccess("Rôle RH révoqué avec succès");
      await loadDashboardData(userProfile.ministere_id);
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    router.push("/auth/login");
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
        title="Administration Ministère - USSALA"
        description="Gestion des comptes RH et DCRH du ministère"
      />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Shield className="h-8 w-8 text-green-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Administration Ministère</h1>
                  {userProfile?.ministere && (
                    <p className="text-sm text-gray-600">
                      {userProfile.ministere.nom_complet} ({userProfile.ministere.sigle})
                    </p>
                  )}
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_agents || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gestionnaires RH</CardTitle>
                <UserCheck className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats?.total_rh || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">DCRH</CardTitle>
                <Shield className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats?.total_dcrh || 0}</div>
                {stats?.dcrh_actif && (
                  <p className="text-xs text-gray-600 mt-1">{stats.dcrh_actif.full_name}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Statut DCRH</CardTitle>
                {stats?.dcrh_actif ? (
                  <Lock className="h-4 w-4 text-green-600" />
                ) : (
                  <Unlock className="h-4 w-4 text-orange-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {stats?.dcrh_actif ? "Actif" : "Disponible"}
                </div>
                {stats?.dcrh_actif && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setShowLockDialog(true)}
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    Verrouiller
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recherche d'agents */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Promouvoir un agent existant</CardTitle>
              <CardDescription>
                Recherchez un agent par nom, prénoms, matricule ou email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Nom, prénoms, matricule, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={searching}>
                  <Search className="h-4 w-4 mr-2" />
                  {searching ? "Recherche..." : "Rechercher"}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="font-medium text-sm text-gray-700">
                    Résultats ({searchResults.length})
                  </h3>
                  {searchResults.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {agent.nom} {agent.prenoms}
                        </div>
                        <div className="text-sm text-gray-600">
                          {agent.matricule} • {agent.corps?.nom} • {agent.grade?.nom}
                        </div>
                        <div className="text-sm text-gray-500">{agent.email}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePromoteClick(agent, "rh_ministere")}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          RH
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handlePromoteClick(agent, "rh_central")}
                          disabled={!!stats?.dcrh_actif}
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          DCRH
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Créer un nouveau gestionnaire RH</CardTitle>
                <CardDescription>
                  Créer un nouvel agent et l'attribuer comme gestionnaire RH
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/admin/create-rh">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Créer un gestionnaire RH
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Créer un nouveau DCRH</CardTitle>
                <CardDescription>
                  Créer un nouvel agent et l'attribuer comme DCRH
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/admin/create-dcrh">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!!stats?.dcrh_actif}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {stats?.dcrh_actif ? "DCRH déjà actif" : "Créer un DCRH"}
                  </Button>
                </Link>
                {stats?.dcrh_actif && (
                  <p className="text-xs text-orange-600 mt-2">
                    Verrouiller d'abord le DCRH actuel
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Liste des RH */}
          {rhList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Gestionnaires RH actifs ({rhList.length})</CardTitle>
                <CardDescription>
                  Liste des gestionnaires RH du ministère
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rhList.map((rh) => (
                    <div
                      key={rh.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{rh.full_name}</div>
                        <div className="text-sm text-gray-600">{rh.email}</div>
                        <div className="text-xs text-gray-500">
                          Créé le {new Date(rh.created_at).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleRevokeRH(rh.id)}
                      >
                        Révoquer
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </main>

        {/* Dialog de promotion */}
        <Dialog open={showPromotionDialog} onOpenChange={setShowPromotionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Confirmer la promotion
              </DialogTitle>
              <DialogDescription>
                {promotionRole === "rh_ministere" 
                  ? "Promouvoir cet agent en gestionnaire RH ?" 
                  : "Promouvoir cet agent en DCRH (Direction Centrale des Ressources Humaines) ?"}
              </DialogDescription>
            </DialogHeader>
            {selectedAgent && (
              <div className="py-4">
                <div className="font-medium">{selectedAgent.nom} {selectedAgent.prenoms}</div>
                <div className="text-sm text-gray-600">{selectedAgent.matricule}</div>
                <div className="text-sm text-gray-500 mt-2">
                  {promotionRole === "rh_ministere" 
                    ? "Cette personne pourra créer et gérer les dossiers des agents."
                    : "Cette personne aura un accès central pour valider tous les dossiers du ministère."}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPromotionDialog(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handlePromote} 
                disabled={promoting}
                className={promotionRole === "rh_central" ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {promoting ? "Promotion..." : "Confirmer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de verrouillage du DCRH */}
        <Dialog open={showLockDialog} onOpenChange={setShowLockDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verrouiller le compte DCRH actuel</DialogTitle>
              <DialogDescription>
                Cette action va désactiver le compte DCRH actuel. Vous pourrez ensuite promouvoir un nouvel agent.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {stats?.dcrh_actif && (
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="font-medium">{stats.dcrh_actif.full_name}</div>
                  <div className="text-sm text-gray-600">{stats.dcrh_actif.email}</div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="lockReason">Raison du verrouillage *</Label>
                <Textarea
                  id="lockReason"
                  placeholder="Ex: Changement de personnel, départ à la retraite..."
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLockDialog(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleLockDCRH} 
                disabled={locking}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Lock className="h-4 w-4 mr-2" />
                {locking ? "Verrouillage..." : "Verrouiller"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}