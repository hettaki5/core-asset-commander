// src/components/calendar/SimpleCreateMeetingDialog.tsx
import React, { useState, useMemo } from "react";
import { useMeetings } from "@/hooks/useMeetings";
import { ParticipantsSelector } from "./ParticipantsSelector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Plus,
  Clock,
  MapPin,
  Link,
  AlertCircle,
} from "lucide-react";
import { format, addHours } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { MeetingCreateRequest, UserInfo } from "@/services/eventService";

interface SimpleCreateMeetingDialogProps {
  onMeetingCreated?: () => void;
  defaultDate?: Date;
  trigger?: React.ReactNode;
}

export const SimpleCreateMeetingDialog: React.FC<
  SimpleCreateMeetingDialogProps
> = ({ onMeetingCreated, defaultDate = new Date(), trigger }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createMeeting } = useMeetings();

  // État des participants sélectionnés
  const [selectedParticipants, setSelectedParticipants] = useState<UserInfo[]>(
    []
  );

  // État du formulaire
  const [formData, setFormData] = useState<MeetingCreateRequest>({
    title: "",
    description: "",
    startTime: format(defaultDate, "yyyy-MM-dd'T'09:00"),
    endTime: format(addHours(defaultDate, 1), "yyyy-MM-dd'T'10:00"),
    location: "",
    meetingLink: "",
    priority: "MEDIUM",
    category: "WORK",
    participantUserIds: [],
    reminders: [],
  });

  // État des dates
  const [startDate, setStartDate] = useState<Date>(defaultDate);
  const [endDate, setEndDate] = useState<Date>(addHours(defaultDate, 1));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  // Mettre à jour les timestamps quand les dates changent
  React.useEffect(() => {
    const startDateTime = new Date(startDate);
    const [startHour, startMinute] = startTime.split(":");
    startDateTime.setHours(parseInt(startHour), parseInt(startMinute));

    const endDateTime = new Date(endDate);
    const [endHour, endMinute] = endTime.split(":");
    endDateTime.setHours(parseInt(endHour), parseInt(endMinute));

    setFormData((prev) => ({
      ...prev,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
    }));
  }, [startDate, endDate, startTime, endTime]);

  // Mettre à jour la liste des participants dans formData
  React.useEffect(() => {
    const participantUserIds = selectedParticipants.map((p) => p.id);
    setFormData((prev) => ({
      ...prev,
      participantUserIds,
    }));
  }, [selectedParticipants]);

  // ✅ CORRECTION: Validation mémorisée pour éviter les re-renders infinis
  const isFormValid = useMemo(() => {
    if (!formData.title.trim()) return false;
    if (new Date(formData.startTime) >= new Date(formData.endTime))
      return false;
    return true;
  }, [formData.title, formData.startTime, formData.endTime]);

  // Réinitialiser le formulaire
  const resetForm = () => {
    const defaultStart = defaultDate || new Date();
    const defaultEnd = addHours(defaultStart, 1);

    setFormData({
      title: "",
      description: "",
      startTime: defaultStart.toISOString(),
      endTime: defaultEnd.toISOString(),
      location: "",
      meetingLink: "",
      priority: "MEDIUM",
      category: "WORK",
      participantUserIds: [],
      reminders: [],
    });
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
    setStartTime("09:00");
    setEndTime("10:00");
    setSelectedParticipants([]);
    setError(null);
  };

  // Validation du formulaire - fonction stable
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError("Le titre est requis");
      return false;
    }
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      setError("L'heure de fin doit être après l'heure de début");
      return false;
    }
    setError(null);
    return true;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      console.log("Création du meeting avec les données:", formData);
      await createMeeting(formData);
      resetForm();
      setOpen(false);
      onMeetingCreated?.();
    } catch (error) {
      console.error("Erreur création meeting:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Erreur lors de la création du meeting"
      );
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Nouveau Meeting
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouveau meeting</DialogTitle>
          <DialogDescription>
            Planifiez un meeting et invitez des participants
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Erreur globale */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Titre */}
          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Ex: Réunion équipe PLM"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Détails du meeting, ordre du jour..."
              rows={3}
            />
          </div>

          {/* Type et priorité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Type</Label>
              <Select
                value={formData.category}
                onValueChange={(value: "WORK" | "PERSONAL" | "PROJECT") =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WORK">Travail</SelectItem>
                  <SelectItem value="PERSONAL">Personnel</SelectItem>
                  <SelectItem value="PROJECT">Projet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priorité</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "LOW" | "MEDIUM" | "HIGH" | "URGENT") =>
                  setFormData((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Basse</SelectItem>
                  <SelectItem value="MEDIUM">Moyenne</SelectItem>
                  <SelectItem value="HIGH">Haute</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date et heure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date de début */}
            <div>
              <Label>Date de début *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate
                      ? format(startDate, "PPP", { locale: fr })
                      : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Heure de début */}
            <div>
              <Label htmlFor="startTime">Heure de début *</Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Date de fin */}
            <div>
              <Label>Date de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate
                      ? format(endDate, "PPP", { locale: fr })
                      : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Heure de fin */}
            <div>
              <Label htmlFor="endTime">Heure de fin</Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Lieu et lien */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Lieu</Label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="Salle de réunion, adresse..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="meetingLink">Lien de réunion</Label>
              <div className="flex items-center gap-2">
                <Link className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="meetingLink"
                  type="url"
                  value={formData.meetingLink}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      meetingLink: e.target.value,
                    }))
                  }
                  placeholder="https://meet.google.com/..."
                />
              </div>
            </div>
          </div>

          {/* Participants */}
          <div>
            <Label>Participants</Label>
            <ParticipantsSelector
              selectedParticipants={selectedParticipants}
              onParticipantsChange={setSelectedParticipants}
              disabled={loading}
              placeholder="Rechercher et ajouter des participants"
              maxParticipants={50}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !isFormValid}>
              {loading ? "Création..." : "Créer le Meeting"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
