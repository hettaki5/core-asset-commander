import React, { useState, useEffect } from "react";
import { useUserProfile } from "../hooks/useUserProfile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Skeleton } from "../components/ui/skeleton";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Settings,
  Save,
  Phone,
  Building,
  MapPin,
  Loader2,
} from "lucide-react";

export const Profile: React.FC = () => {
  const { profile, loading, error, updateProfile, refreshProfile, isAdmin } =
    useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const success = await updateProfile({
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
      });

      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes("admin")) {
      return { label: "Administrateur", variant: "destructive" as const };
    }
    if (roles.includes("ingenieurpr")) {
      return { label: "Ingénieur", variant: "default" as const };
    }
    if (roles.includes("validateur")) {
      return { label: "Validateur", variant: "secondary" as const };
    }
    if (roles.includes("observateur")) {
      return { label: "Observateur", variant: "outline" as const };
    }
    return {
      label: roles.join(", "),
      variant: "outline" as const,
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold">Erreur de chargement</h3>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={refreshProfile} variant="outline">
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) return null;

  const roleBadge = getRoleBadge(profile.roles);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mon Profil</h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles
          </p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
          disabled={isSaving}
        >
          <Settings className="h-4 w-4 mr-2" />
          {isEditing ? "Annuler" : "Modifier"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
              <CardDescription>Vos informations de base</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-xl">
                    {profile.firstName?.charAt(0) || "U"}
                    {profile.lastName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {profile.firstName} {profile.lastName}
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    @{profile.username}
                  </p>
                  <Badge variant={roleBadge.variant}>{roleBadge.label}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>

                {profile.phone && (
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <Input
                      value={profile.phone}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                )}
                {profile.department && (
                  <div className="space-y-2">
                    <Label>Département</Label>
                    <Input
                      value={profile.department}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                )}
                {profile.position && (
                  <div className="space-y-2">
                    <Label>Poste</Label>
                    <Input
                      value={profile.position}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isSaving ? "Sauvegarde..." : "Sauvegarder"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    Annuler
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Mon Compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>@{profile.username}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.department && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.department}</span>
                  </div>
                )}
                {profile.position && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.position}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Créé le {formatDate(profile.createdAt)}</span>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Statut:</span>
                  <Badge variant={profile.enabled ? "default" : "destructive"}>
                    {profile.enabled ? "Actif" : "Inactif"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Email vérifié:</span>
                  <Badge
                    variant={profile.emailVerified ? "default" : "secondary"}
                  >
                    {profile.emailVerified ? "Oui" : "Non"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Connexions:</span>
                  <span className="text-muted-foreground">
                    {profile.loginCount}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
