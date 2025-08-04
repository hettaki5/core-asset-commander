// src/components/layout/Header.tsx - VERSION CORRIGÉE
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppData } from "@/contexts/AppDataContext";
import { useNavigate } from "react-router-dom";

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { messages } = useAppData();
  const navigate = useNavigate();

  if (!user) return null;

  const unreadMessages = messages.filter(
    (m) => m.toUserId === user.id && !m.isRead
  ).length;

  // Helper pour obtenir le label du rôle principal
  const getRoleLabel = () => {
    if (user.roles.includes("admin")) return "Admin";
    if (user.roles.includes("ingenieurpr")) return "Ingénieur";
    if (user.roles.includes("validateur")) return "Validateur";
    if (user.roles.includes("observateur")) return "Observateur";
    return user.roles[0] || "Utilisateur";
  };

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-xl font-semibold">PLMLAB Platform</h1>
          <p className="text-sm text-muted-foreground">
            Product Lifecycle Management
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadMessages > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
              {unreadMessages}
            </span>
          )}
        </Button>

        {/* Menu utilisateur */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-medium text-primary-foreground">
                  {user.firstName?.charAt(0) || "U"}
                  {user.lastName?.charAt(0) || ""}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getRoleLabel()}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="mr-2 h-4 w-4" />
              Mon Profil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
