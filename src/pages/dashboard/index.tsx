import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/authService";
import { Shield, LogOut, Loader2, Users, FileText, BarChart3, Settings } from "lucide-react";
import type { AuthUser } from "@/services/authService";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        router.push("/auth/login");
        return;
      }
      setUser(currentUser);
    } catch (err) {
      console.error("Error checking authentication:", err);
      router.push("/auth/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      router.push("/auth/login");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Tableau de bord - USSALA Gabon"
        description="Tableau de bord de la plateforme USSALA"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
        <header className="bg-white border-b border-green-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent">
                    USSALA
                  </h1>
                  <p className="text-xs text-gray-500">
                    Gestion Administrative des Agents Publics
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-700">{user?.email}</p>
                  <p className="text-xs text-gray-500">Agent connecté</p>
                </div>
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="border-green-200 hover:bg-green-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bienvenue sur USSALA
            </h2>
            <p className="text-gray-600">
              Plateforme de Gestion Administrative et Statutaire des Agents Publics du Gabon
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-green-100 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Gestion des Agents</CardTitle>
                <CardDescription>Module à venir</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-blue-100 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Situations Admin.</CardTitle>
                <CardDescription>Module à venir</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-yellow-100 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-2">
                  <BarChart3 className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle className="text-lg">Situations Financières</CardTitle>
                <CardDescription>Module à venir</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-gray-100 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                  <Settings className="h-6 w-6 text-gray-600" />
                </div>
                <CardTitle className="text-lg">Paramètres</CardTitle>
                <CardDescription>Module à venir</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card className="border-green-100">
            <CardHeader>
              <CardTitle>Informations système</CardTitle>
              <CardDescription>État de votre connexion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Utilisateur</span>
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">ID Utilisateur</span>
                <span className="text-sm font-mono text-gray-500">{user?.id.substring(0, 20)}...</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Statut</span>
                <span className="inline-flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="font-medium text-green-700">Connecté</span>
                </span>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}