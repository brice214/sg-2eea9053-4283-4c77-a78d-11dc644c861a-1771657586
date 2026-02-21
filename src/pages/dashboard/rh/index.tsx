import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { authService } from "@/services/authService";
import { agentService } from "@/services/agentService";
import { 
  UserPlus, 
  Users, 
  UserCheck, 
  Clock, 
  LogOut, 
  Search,
  Filter,
  FileText,
  Home,
  Building2
} from "lucide-react";

export default function RHDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_agents: 0,
    stagiaires: 0,
    titulaires: 0,
    en_attente_validation: 0
  });
  const [agents, setAgents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const session = await authService.getCurrentSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }
    loadData();
  };

  const loadData = async () => {
    setLoading(true);
    
    // Charger les statistiques
    const statistics = await agentService.getStatistics();
    setStats(statistics);

    // Charger la liste des agents
    const { agents: agentsList } = await agentService.getAgents({
      statut: statusFilter === "all" ? undefined : statusFilter,
      search: searchTerm || undefined
    });
    setAgents(agentsList);

    setLoading(false);
  };

  useEffect(() => {
    if (!loading) {
      loadData();
    }
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleLogout = async () => {
    await authService.signOut();
    router.push("/auth/login");
  };

  const getStatusBadge = (statut: string) => {
    const styles = {
      STAGIAIRE: "bg-yellow-100 text-yellow-800 border-yellow-300",
      TITULAIRE: "bg-green-100 text-green-800 border-green-300",
      EN_ATTENTE_VALIDATION: "bg-orange-100 text-orange-800 border-orange-300",
      DETACHE: "bg-blue-100 text-blue-800 border-blue-300",
      RETRAITE: "bg-gray-100 text-gray-800 border-gray-300"
    };

    return (
      <Badge variant="outline" className={styles[statut as keyof typeof styles] || ""}>
        {statut.replace(/_/g, " ")}
      </Badge>
    );
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
        title="Gestion RH - USSALA"
        description="Tableau de bord de gestion des ressources humaines"
      />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <Home className="h-4 w-4 mr-2" />
                    Accueil
                  </Button>
                </Link>
                <div className="h-6 w-px bg-gray-300" />
                <h1 className="text-2xl font-bold text-gray-900">Gestion RH</h1>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Statistiques */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Agents
                </CardTitle>
                <Users className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.total_agents}
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-gradient-to-br from-white to-yellow-50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Stagiaires
                </CardTitle>
                <Clock className="h-5 w-5 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.stagiaires}
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Titulaires
                </CardTitle>
                <UserCheck className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.titulaires}
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-gradient-to-br from-white to-orange-50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  En attente
                </CardTitle>
                <FileText className="h-5 w-5 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.en_attente_validation}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions principales */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
                <CardDescription>
                  Créer un nouveau dossier administratif ou gérer les agents existants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Link href="/dashboard/rh/create-agent">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Créer un dossier administratif
                    </Button>
                  </Link>
                  <Link href="/dashboard/rh/agents">
                    <Button variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Gérer les agents
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des agents récents */}
          <Card>
            <CardHeader>
              <CardTitle>Agents récents</CardTitle>
              <CardDescription>
                Liste des derniers agents créés dans le système
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filtres */}
              <div className="mb-6 flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Rechercher par nom, prénom ou matricule..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </form>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="STAGIAIRE">Stagiaires</SelectItem>
                    <SelectItem value="TITULAIRE">Titulaires</SelectItem>
                    <SelectItem value="EN_ATTENTE_VALIDATION">En attente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matricule</TableHead>
                      <TableHead>Nom & Prénoms</TableHead>
                      <TableHead>Corps</TableHead>
                      <TableHead>Ministère</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          Aucun agent trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      agents.map((agent) => (
                        <TableRow key={agent.id}>
                          <TableCell className="font-mono text-sm">
                            {agent.matricule}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{agent.nom}</div>
                              <div className="text-sm text-gray-500">{agent.prenoms}</div>
                            </div>
                          </TableCell>
                          <TableCell>{agent.corps?.intitule || "-"}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {agent.ministeres?.nom || "-"}
                          </TableCell>
                          <TableCell>{getStatusBadge(agent.statut)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              Voir détails
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}