import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/authService";
import { LogOut, Users, FileText, DollarSign, Settings, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const session = await authService.getCurrentSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }

    const user = await authService.getCurrentUser();
    if (user) {
      setUserEmail(user.email);
    }

    // Récupérer le profil complet avec les informations du ministère
    const { profile } = await authService.getUserProfile();
    if (profile) {
      setUserProfile(profile);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await authService.signOut();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Tableau de bord - USSALA"
        description="Tableau de bord principal de la plateforme USSALA"
      />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">USSALA</h1>
                <p className="text-sm text-gray-600">
                  Plateforme de Gestion Administrative et Statutaire des Agents Publics
                </p>
                {userProfile?.ministere && (
                  <p className="text-sm font-medium text-green-700 mt-1">
                    {userProfile.ministere.nom} ({userProfile.ministere.sigle})
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{userEmail}</p>
                  <p className="text-xs text-gray-500">Connecté</p>
                  {userProfile?.role && (
                    <p className="text-xs text-blue-600 font-medium mt-1">
                      {userProfile.role === "rh_ministere" && "RH Ministériel"}
                      {userProfile.role === "rh_central" && "DCRH Central"}
                      {userProfile.role === "admin" && "Administrateur"}
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Bienvenue sur USSALA
              </h2>
              <p className="text-lg text-gray-600">
                Sélectionnez un module pour commencer la gestion des carrières
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Module Gestion RH */}
              <Link href="/dashboard/rh">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-green-200 hover:border-green-400 bg-gradient-to-br from-white to-green-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Gestion RH</CardTitle>
                      <Users className="h-8 w-8 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      Création et gestion des dossiers administratifs des agents publics
                    </CardDescription>
                    <ul className="mt-4 space-y-2 text-sm text-gray-600">
                      <li>• Création de dossiers</li>
                      <li>• Validation administrative</li>
                      <li>• Gestion des pièces</li>
                    </ul>
                  </CardContent>
                </Card>
              </Link>

              {/* Module DCRH - Visible uniquement pour rh_central */}
              {userProfile?.role === "rh_central" && (
                <Link href="/dashboard/dcrh">
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-blue-200 hover:border-blue-400 bg-gradient-to-br from-white to-blue-50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">Tableau de bord DCRH</CardTitle>
                        <UserCheck className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        Validation et supervision des dossiers administratifs
                      </CardDescription>
                      <ul className="mt-4 space-y-2 text-sm text-gray-600">
                        <li>• Valider les dossiers</li>
                        <li>• Superviser les agents</li>
                        <li>• Gérer les promotions</li>
                      </ul>
                    </CardContent>
                  </Card>
                </Link>
              )}

              {/* Module Situations administratives (à venir) */}
              <Card className="opacity-50 cursor-not-allowed border-blue-200 bg-gradient-to-br from-white to-blue-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Situations Admin.</CardTitle>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Gestion des situations administratives des agents
                  </CardDescription>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    <li>• Mutations</li>
                    <li>• Promotions</li>
                    <li>• Congés & Absences</li>
                  </ul>
                  <div className="mt-4">
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      Prochainement
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Module Situations financières (à venir) */}
              <Card className="opacity-50 cursor-not-allowed border-yellow-200 bg-gradient-to-br from-white to-yellow-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Situations Fin.</CardTitle>
                    <DollarSign className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Gestion financière et des soldes des agents
                  </CardDescription>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    <li>• Salaires</li>
                    <li>• Primes & Indemnités</li>
                    <li>• Historique de paie</li>
                  </ul>
                  <div className="mt-4">
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Prochainement
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Module Statistiques (à venir) */}
              <Card className="opacity-50 cursor-not-allowed border-purple-200 bg-gradient-to-br from-white to-purple-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Statistiques</CardTitle>
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Tableaux de bord et analyses statistiques
                  </CardDescription>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    <li>• Effectifs</li>
                    <li>• Mouvements</li>
                    <li>• Analyses RH</li>
                  </ul>
                  <div className="mt-4">
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                      Prochainement
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Module Paramètres (à venir) */}
              <Card className="opacity-50 cursor-not-allowed border-gray-200 bg-gradient-to-br from-white to-gray-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Paramètres</CardTitle>
                    <Settings className="h-8 w-8 text-gray-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Configuration et administration système
                  </CardDescription>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    <li>• Utilisateurs</li>
                    <li>• Droits d'accès</li>
                    <li>• Référentiels</li>
                  </ul>
                  <div className="mt-4">
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      Prochainement
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <p>© 2026 USSALA - République Gabonaise</p>
              <p className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                Connexion sécurisée (SSL/TLS)
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}