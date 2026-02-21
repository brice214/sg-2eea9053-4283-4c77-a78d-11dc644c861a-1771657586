import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/authService";
import { LogOut, Users, FileText, DollarSign, Building2, ArrowRight } from "lucide-react";
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
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              
              {/* Module Gestion RH */}
              <Link href="/dashboard/rh">
                <Card className="group relative overflow-hidden border-2 border-emerald-200 hover:border-emerald-400 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-100 cursor-pointer bg-gradient-to-br from-white to-emerald-50/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                        <Users className="h-7 w-7" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">
                      Gestion RH
                    </CardTitle>
                    <CardDescription className="text-base text-slate-600 mt-2">
                      Création et gestion des dossiers administratifs des agents publics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <ul className="space-y-2.5 text-sm text-slate-700">
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Création de dossiers
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Validation administrative
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Gestion des pièces
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </Link>

              {/* Module Situations Administratives */}
              <Card className="group relative overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-100 bg-gradient-to-br from-white to-blue-50/50 opacity-60">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
                <CardHeader className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 rounded-xl bg-blue-100 text-blue-700">
                      <FileText className="h-7 w-7" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    Situations Admin.
                  </CardTitle>
                  <CardDescription className="text-base text-slate-600 mt-2">
                    Gestion des situations administratives des agents
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <ul className="space-y-2.5 text-sm text-slate-700">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      Mutations
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      Promotions
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      Congés & Absences
                    </li>
                  </ul>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      Prochainement
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Module Situations Financières */}
              <Card className="group relative overflow-hidden border-2 border-amber-200 hover:border-amber-400 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-100 bg-gradient-to-br from-white to-amber-50/50 opacity-60">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
                <CardHeader className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 rounded-xl bg-amber-100 text-amber-700">
                      <DollarSign className="h-7 w-7" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    Situations Fin.
                  </CardTitle>
                  <CardDescription className="text-base text-slate-600 mt-2">
                    Gestion financière et des soldes des agents
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <ul className="space-y-2.5 text-sm text-slate-700">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Salaires
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Primes & Indemnités
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Historique de paie
                    </li>
                  </ul>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                      Prochainement
                    </span>
                  </div>
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