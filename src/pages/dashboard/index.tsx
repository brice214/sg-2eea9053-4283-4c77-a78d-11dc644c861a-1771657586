import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { authService } from "@/services/authService";
import { Building2, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { profile: userProfile, error } = await authService.getUserProfile();
        
        if (error || !userProfile) {
          console.error("Erreur chargement profil:", error);
          router.push("/auth/login");
          return;
        }

        setProfile(userProfile);

        // Redirection basée sur le rôle - PRIORITÉ ABSOLUE
        if (userProfile.role === "admin_ministere") {
          router.push("/dashboard/admin");
          return;
        }
        
        if (userProfile.role === "rh_central") {
          router.push("/dashboard/dcrh");
          return;
        }
        
        if (userProfile.role === "rh_ministere") {
          router.push("/dashboard/rh");
          return;
        }

        // Si aucun rôle spécifique, rester sur cette page
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
        router.push("/auth/login");
      }
    };

    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    await authService.signOut();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">USSALA</h1>
                <p className="text-sm text-gray-600">Plateforme de Gestion Administrative et Statutaire des Agents Publics</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                  <p className="text-xs text-gray-500">{profile?.email}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Bienvenue sur USSALA</h2>
            <p className="text-gray-600">Sélectionnez un module pour commencer la gestion des carrières</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Situations Administratives */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-500">
              <CardHeader className="bg-gradient-to-br from-yellow-50 to-green-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FileText className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                    Bientôt
                  </div>
                </div>
                <CardTitle className="text-xl">Situations Administratives</CardTitle>
                <CardDescription>Mutations, promotions, congés, sanctions</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">
                  Gérer les mouvements et actes administratifs
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Ministry Info */}
          {profile?.ministere && (
            <Card className="max-w-4xl mx-auto mt-8 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">Votre ministère</CardTitle>
                    <CardDescription className="text-base font-medium text-gray-900">
                      {profile.ministere.nom_complet}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">© 2026 USSALA - République Gabonaise</p>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Connexion sécurisée (SSL/TLS)
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}