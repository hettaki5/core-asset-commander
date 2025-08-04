// src/services/passwordService.ts
import type {
  PasswordResetRequest,
  PasswordResetResponse,
  UserStatusResponse,
} from "@/types/auth";

// ✅ TYPES LOCAUX POUR LE SERVICE (évite les conflits)
interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

interface PasswordStrength {
  score: number; // 0-4
  label: string; // 'Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'
  suggestions: string[];
}

class PasswordService {
  private readonly BASE_URL = "/api/auth"; // Proxy Vite

  /**
   * ✅ COMPATIBILITÉ AVEC TON BACKEND
   * Vérifie si un utilisateur doit changer son mot de passe
   * Endpoint: GET /api/auth/check-password-reset/{usernameOrEmail}
   */
  async checkPasswordResetRequired(
    usernameOrEmail: string
  ): Promise<UserStatusResponse> {
    try {
      console.log(
        "🔍 Vérification statut changement mot de passe:",
        usernameOrEmail
      );

      const response = await fetch(
        `${this.BASE_URL}/check-password-reset/${encodeURIComponent(
          usernameOrEmail
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("✅ Statut récupéré:", result);
      return result;
    } catch (error) {
      console.error("❌ Erreur vérification statut:", error);
      return {
        requiresPasswordChange: false,
        userExists: false,
        message: "Erreur lors de la vérification du statut utilisateur",
      };
    }
  }

  /**
   * ✅ COMPATIBILITÉ AVEC TON BACKEND
   * Effectue le changement de mot de passe obligatoire
   * Endpoint: POST /api/auth/force-password-change
   */
  async forcePasswordChange(
    request: PasswordResetRequest
  ): Promise<PasswordResetResponse> {
    try {
      console.log(
        "🔑 Changement de mot de passe obligatoire:",
        request.username
      );

      const response = await fetch(`${this.BASE_URL}/force-password-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();
      console.log("📡 Réponse changement mot de passe:", result);

      if (response.status === 412) {
        // 412 Precondition Failed - Changement requis
        return {
          success: false,
          requiresPasswordChange: true,
          message: result.message || "Changement de mot de passe requis",
        };
      }

      if (!response.ok) {
        return {
          success: false,
          message: result.message || `Erreur ${response.status}`,
        };
      }

      return {
        success: true,
        message: result.message || "Mot de passe modifié avec succès",
      };
    } catch (error) {
      console.error("❌ Erreur changement mot de passe:", error);
      return {
        success: false,
        message: "Erreur lors du changement de mot de passe",
      };
    }
  }

  /**
   * ✅ REGEX CORRIGÉES - Valide un mot de passe selon les critères de sécurité
   */
  validatePassword(password: string): PasswordValidation {
    const errors: string[] = [];

    if (!password) {
      errors.push("Le mot de passe est requis");
      return { isValid: false, errors };
    }

    if (password.length < 8) {
      errors.push("Le mot de passe doit contenir au moins 8 caractères");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins une majuscule");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins une minuscule");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins un chiffre");
    }

    // ✅ REGEX CORRIGÉE : échappement correct des caractères spéciaux
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push(
        "Le mot de passe doit contenir au moins un caractère spécial"
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * ✅ REGEX CORRIGÉES - Évalue la force d'un mot de passe
   */
  calculatePasswordStrength(password: string): PasswordStrength {
    let score = 0;
    const suggestions: string[] = [];

    if (!password) {
      return {
        score: 0,
        label: "Très faible",
        suggestions: ["Veuillez saisir un mot de passe"],
      };
    }

    // Longueur
    if (password.length >= 8) score++;
    else suggestions.push("Utilisez au moins 8 caractères");

    if (password.length >= 12) score++;
    else if (password.length >= 8)
      suggestions.push("Utilisez 12 caractères ou plus pour plus de sécurité");

    // Complexité
    if (/[a-z]/.test(password)) score++;
    else suggestions.push("Ajoutez des lettres minuscules");

    if (/[A-Z]/.test(password)) score++;
    else suggestions.push("Ajoutez des lettres majuscules");

    if (/[0-9]/.test(password)) score++;
    else suggestions.push("Ajoutez des chiffres");

    // ✅ REGEX CORRIGÉE : échappement correct des caractères spéciaux
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;
    else suggestions.push("Ajoutez des caractères spéciaux (!@#$%^&*)");

    // Éviter les mots courants
    const commonPasswords = ["password", "123456", "qwerty", "azerty", "admin"];
    if (
      commonPasswords.some((common) => password.toLowerCase().includes(common))
    ) {
      score = Math.max(0, score - 2);
      suggestions.push("Évitez les mots de passe courants");
    }

    // Normaliser le score (0-4)
    score = Math.min(4, Math.max(0, score - 2));

    const labels = ["Très faible", "Faible", "Moyen", "Fort", "Très fort"];

    return {
      score,
      label: labels[score],
      suggestions: suggestions.slice(0, 3), // Maximum 3 suggestions
    };
  }

  /**
   * ✅ COMPATIBILITÉ AVEC TON BACKEND
   * Test de santé du service
   * Endpoint: GET /api/auth/health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error("❌ Service de changement de mot de passe indisponible");
      return false;
    }
  }
}

export const passwordService = new PasswordService();
