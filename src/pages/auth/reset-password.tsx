import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authService } from "@/services/authService";
import { Shield, Mail, ArrowLeft, AlertCircle, Loader2, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    if (!email) {
      setError("Veuillez entrer votre adresse email");
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format d'email invalide");
      setIsLoading(false);
      return;
    }

    try {
      const { error: resetError } = await authService.resetPassword(email);

      if (resetError) {
        setError(resetError.message || "Erreur lors de l'envoi de l'email de réinitialisation");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
    } catch (err) {
      setError("Une erreur inattendue s'est produite. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Réinitialisation du mot de passe - USSALA Gabon"
        description="Réinitialisez votre mot de passe pour accéder à la plateforme USSALA"
      />
      
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
        <Card className="w-full max-w-md shadow-2xl border-green-100">
          <CardHeader className="space-y-3 text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center mb-2">
              <Shield className="h-8 w-8 text-white" />
            </div>
            
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent">
              Réinitialisation du mot de passe
            </CardTitle>
            
            <CardDescription className="text-sm leading-relaxed">
              Entrez votre adresse email professionnelle pour recevoir<br />
              un lien de réinitialisation
            </CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
                  Veuillez vérifier votre boîte de réception.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Adresse email professionnelle
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre.email@administration.ga"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer le lien de réinitialisation"
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link 
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 border-t pt-6">
            <div className="text-xs text-center text-gray-500 space-y-1">
              <p className="flex items-center justify-center gap-1">
                <Shield className="h-3 w-3" />
                Connexion sécurisée SSL/TLS
              </p>
              <p>© 2026 République Gabonaise - USSALA</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}