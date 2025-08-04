import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { passwordService } from "@/services/passwordService";
import type { PasswordResetRequest } from "@/types/auth";

export const ChangePasswordForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ AJOUT: Gestion de la visibilité des mots de passe
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const { user, logout } = useAuth();

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères");
      return;
    }

    // ✅ VALIDATION RENFORCÉE
    const validation = passwordService.validatePassword(newPassword);
    if (!validation.isValid) {
      setError(validation.errors[0]); // Afficher la première erreur
      return;
    }

    if (currentPassword === newPassword) {
      setError("Le nouveau mot de passe doit être différent de l'ancien");
      return;
    }

    setIsLoading(true);

    try {
      // ✅ UTILISER LE NOUVEAU SERVICE CONNECTÉ AU BACKEND
      const request: PasswordResetRequest = {
        username: user?.username || user?.email || "",
        currentPassword,
        newPassword,
      };

      const response = await passwordService.forcePasswordChange(request);

      if (response.success) {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // ✅ REDIRECTION APRÈS SUCCÈS
        setTimeout(() => {
          // Rafraîchir la page pour relancer l'auth avec le nouveau mot de passe
          window.location.href = "/";
        }, 2000);
      } else {
        setError(
          response.message || "Erreur lors du changement de mot de passe"
        );
      }
    } catch (error) {
      console.error("Erreur changement mot de passe:", error);
      setError("Erreur technique lors du changement de mot de passe");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ SI SUCCÈS, AFFICHER MESSAGE DE SUCCÈS ET REDIRECTION
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">
                    Mot de passe modifié !
                  </h3>
                  <p className="text-sm text-green-700">
                    Votre mot de passe a été modifié avec succès. Vous allez
                    être redirigé vers l'application...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Changement de mot de passe requis
            </CardTitle>
            <CardDescription>
              Bonjour {user?.firstName}, vous devez changer votre mot de passe
              pour continuer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ✅ ANCIEN MOT DE PASSE AVEC VISIBILITÉ */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Entrez votre mot de passe actuel"
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => togglePasswordVisibility("current")}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* ✅ NOUVEAU MOT DE PASSE AVEC VISIBILITÉ */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Entrez votre nouveau mot de passe"
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => togglePasswordVisibility("new")}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* ✅ CONFIRMATION MOT DE PASSE AVEC VISIBILITÉ */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirmer le nouveau mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmez votre nouveau mot de passe"
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => togglePasswordVisibility("confirm")}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* ✅ AFFICHAGE DES ERREURS */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* ✅ BOUTON DE SOUMISSION */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? "Changement en cours..."
                  : "Changer le mot de passe"}
              </Button>
            </form>

            {/* ✅ CRITÈRES DE MOT DE PASSE MIS À JOUR */}
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Critères requis :</strong>
                <br />
                • Au moins 8 caractères
                <br />
                • Au moins une majuscule et une minuscule
                <br />
                • Au moins un chiffre
                <br />• Au moins un caractère spécial (!@#$%^&*)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
