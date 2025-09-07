// src/components/calendar/ParticipantsSelector.tsx
import React, { useState, useEffect } from "react";
import { useUserSearch } from "@/hooks/useMeetings";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, X, Search, AlertCircle, Loader2 } from "lucide-react";
import { UserInfo } from "@/services/eventService";

interface ParticipantsSelectorProps {
  selectedParticipants: UserInfo[];
  onParticipantsChange: (participants: UserInfo[]) => void;
  disabled?: boolean;
  placeholder?: string;
  maxParticipants?: number;
}

export const ParticipantsSelector: React.FC<ParticipantsSelectorProps> = ({
  selectedParticipants,
  onParticipantsChange,
  disabled = false,
  placeholder = "Ajouter des participants",
  maxParticipants = 50,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Utiliser le hook corrigé
  const { users, loading, error, searchUsers, clearUsers } = useUserSearch();

  // NOUVEAU : Charger tous les utilisateurs quand on ouvre le popover
  useEffect(() => {
    if (open && users.length === 0 && !searchQuery.trim()) {
      // Charger tous les utilisateurs avec une recherche générique
      searchUsers("@"); // Rechercher avec @ car tous les emails contiennent @
    }
  }, [open, users.length, searchQuery, searchUsers]);

  // Debounce de la recherche
  useEffect(() => {
    if (!open) return; // Ne pas chercher si le popover est fermé

    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() && searchQuery.trim().length >= 2) {
        searchUsers(searchQuery);
      } else if (searchQuery.trim().length === 0) {
        // Si la recherche est vide, charger tous les utilisateurs
        searchUsers("@");
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchUsers, open]);

  // Nettoyer quand on ferme le popover
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      clearUsers();
    }
  }, [open, clearUsers]);

  // Ajouter un participant
  const addParticipant = (user: UserInfo) => {
    // Vérifier si déjà sélectionné
    const isAlreadySelected = selectedParticipants.some(
      (participant) => participant.id === user.id
    );

    if (isAlreadySelected) {
      console.log("Participant déjà sélectionné:", user.displayName);
      return;
    }

    // Vérifier la limite
    if (selectedParticipants.length >= maxParticipants) {
      console.warn(`Limite de ${maxParticipants} participants atteinte`);
      return;
    }

    // Ajouter le participant
    onParticipantsChange([...selectedParticipants, user]);

    // NE PAS fermer le popover pour permettre d'ajouter plusieurs participants
    // setOpen(false);  // SUPPRIMÉ

    console.log("Participant ajouté:", user.displayName);
  };

  // Retirer un participant
  const removeParticipant = (userId: string) => {
    const updatedParticipants = selectedParticipants.filter(
      (participant) => participant.id !== userId
    );
    onParticipantsChange(updatedParticipants);

    const removedUser = selectedParticipants.find((p) => p.id === userId);
    console.log("Participant retiré:", removedUser?.displayName);
  };

  // Filtrer les utilisateurs déjà sélectionnés
  const availableUsers = users.filter(
    (user) =>
      !selectedParticipants.some((participant) => participant.id === user.id)
  );

  return (
    <div className="space-y-3">
      {/* Bouton pour ouvrir la recherche */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start"
            disabled={
              disabled || selectedParticipants.length >= maxParticipants
            }
          >
            <Users className="mr-2 h-4 w-4" />
            {placeholder}
            {selectedParticipants.length >= maxParticipants ? (
              <span className="ml-auto text-xs text-muted-foreground">
                Limite atteinte ({maxParticipants})
              </span>
            ) : (
              <Search className="ml-auto h-4 w-4" />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Rechercher un utilisateur ou voir tous..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />

            <CommandList>
              {/* État de chargement */}
              {loading && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                  Chargement des utilisateurs...
                </div>
              )}

              {/* Erreur */}
              {error && !loading && (
                <div className="p-4 text-center text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 mx-auto mb-2" />
                  <div>Erreur: {error}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setSearchQuery("");
                      searchUsers("@"); // Recharger tous les utilisateurs
                    }}
                  >
                    Réessayer
                  </Button>
                </div>
              )}

              {/* Aucun résultat après recherche spécifique */}
              {!loading &&
                !error &&
                searchQuery.trim() &&
                searchQuery !== "@" &&
                availableUsers.length === 0 &&
                users.length > 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Aucun utilisateur trouvé pour "{searchQuery}".
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 block mx-auto"
                      onClick={() => setSearchQuery("")}
                    >
                      Voir tous les utilisateurs
                    </Button>
                  </div>
                )}

              {!loading &&
                !error &&
                searchQuery.trim() &&
                searchQuery !== "@" &&
                users.length === 0 && (
                  <CommandEmpty>
                    <div className="text-center py-4">
                      <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <div>Aucun utilisateur trouvé</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Essayez un autre terme de recherche
                      </div>
                    </div>
                  </CommandEmpty>
                )}

              {/* Liste des utilisateurs disponibles */}
              {!loading && !error && availableUsers.length > 0 && (
                <CommandGroup>
                  {/* En-tête informatif */}
                  <div className="px-2 py-1 text-xs text-muted-foreground border-b">
                    {searchQuery.trim() && searchQuery !== "@"
                      ? `Résultats pour "${searchQuery}" (${availableUsers.length})`
                      : `Tous les utilisateurs (${availableUsers.length})`}
                  </div>

                  {availableUsers.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.displayName}
                      onSelect={() => addParticipant(user)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center w-full">
                        <div className="flex-1">
                          <div className="font-medium">{user.displayName}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          @{user.username}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Message initial quand rien n'est chargé */}
              {!loading &&
                !error &&
                users.length === 0 &&
                !searchQuery.trim() && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2" />
                    <div>Chargement des utilisateurs...</div>
                  </div>
                )}

              {/* Tous les utilisateurs déjà sélectionnés */}
              {!loading &&
                !error &&
                users.length > 0 &&
                availableUsers.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <div>Tous les utilisateurs sont déjà sélectionnés</div>
                  </div>
                )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Liste des participants sélectionnés */}
      {selectedParticipants.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">
              Participants sélectionnés ({selectedParticipants.length})
            </div>
            {selectedParticipants.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onParticipantsChange([])}
                disabled={disabled}
                className="text-xs h-6 px-2"
              >
                Tout supprimer
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {selectedParticipants.map((participant) => (
              <Badge
                key={participant.id}
                variant="secondary"
                className="flex items-center gap-2 pr-1"
              >
                <span className="truncate max-w-[120px]">
                  {participant.displayName}
                </span>
                <button
                  type="button"
                  onClick={() => removeParticipant(participant.id)}
                  className="text-muted-foreground hover:text-destructive p-1 rounded-full hover:bg-destructive/10"
                  disabled={disabled}
                  title={`Retirer ${participant.displayName}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          {/* Indicateur de limite */}
          {selectedParticipants.length >= maxParticipants * 0.8 && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {selectedParticipants.length >= maxParticipants
                ? `Limite atteinte (${maxParticipants} max)`
                : `${selectedParticipants.length}/${maxParticipants} participants`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
