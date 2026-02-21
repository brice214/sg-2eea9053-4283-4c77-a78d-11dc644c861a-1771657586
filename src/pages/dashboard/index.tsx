import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/authService";
import { LogOut, Users, FileText, DollarSign, Building2, ArrowRight, FileCheck } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
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
    await loadUserProfile();
  };

  const loadUserProfile = async () => {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-lg text-slate-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Tableau de bord - USSALA"
        description="Plateforme de Gestion Administrative et Statutaire des Agents Publics"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header élégant */}
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">
                  USSALA
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Plateforme de Gestion Administrative et Statutaire des Agents Publics
                </p>
              </div>
              <div className="flex items-center gap-4">
                {userProfile && (
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-900">{userProfile.full_name}</p>
                    <p className="text-xs text-slate-500">{userProfile.email}</p>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="border-slate-300 hover:bg-slate-100"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12">
          {/* Section d'accueil */}
          <div className="max-w-4xl mx-auto mb-16 text-center">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Bienvenue sur USSALA
            </h2>
            <p className="text-lg text-slate-600">
              Sélectionnez un module pour commencer la gestion des carrières
            </p>
          </div>

          {/* Grille de modules - Design moderne */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Module Gestion RH */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200 hover:border-green-400">
                <Link href="/dashboard/rh">
                  <CardHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Gestion RH</CardTitle>
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <CardDescription>
                      Gestion des dossiers administratifs des agents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Créer et gérer les dossiers des agents publics de votre ministère
                    </p>
                  </CardContent>
                </Link>
              </Card>

              {/* Module DCRH */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200 hover:border-blue-400">
                <Link href="/dashboard/dcrh">
                  <CardHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">DCRH</CardTitle>
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <FileCheck className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <CardDescription>
                      Validation centrale des dossiers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Valider ou rejeter les dossiers administratifs soumis
                    </p>
                  </CardContent>
                </Link>
              </Card>

              {/* Module Situations Administratives */}
              <Card className="hover:shadow-lg transition-shadow opacity-50 cursor-not-allowed border-yellow-200">
                <CardHeader className="space-y-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      Situations Administratives
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Bientôt</span>
                    </CardTitle>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <FileText className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                  <CardDescription>
                    Mutations, promotions, congés, sanctions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Gérer les mouvements et actes administratifs
                  </p>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Informations supplémentaires */}
          {userProfile?.ministeres && (
            <div className="max-w-6xl mx-auto mt-12">
              <Card className="border-slate-200 bg-white/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100">
                      <Building2 className="h-5 w-5 text-slate-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Votre ministère</CardTitle>
                      <CardDescription className="mt-1">
                        {userProfile.ministeres.nom}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-sm mt-16">
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-600">
                © 2026 USSALA - République Gabonaise
              </p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-sm text-slate-600">
                  Connexion sécurisée (SSL/TLS)
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}