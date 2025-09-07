// src/hooks/useTickets.ts
import { useState, useEffect, useCallback } from "react";
import { ticketService } from "@/services/ticketService";
import { JiraTicketDto, TicketStats, TicketFilters } from "@/types/tickets";
import { useToast } from "@/hooks/use-toast";

export const useTickets = () => {
  const [tickets, setTickets] = useState<JiraTicketDto[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [filters, setFilters] = useState<TicketFilters>({
    search: "",
    status: "all",
    issueType: "all",
    priority: "all",
    assignee: "all",
  });

  // Récupération des tickets
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [ticketsData, statsData] = await Promise.all([
        ticketService.getAllTickets(),
        ticketService.getTicketStats(),
      ]);

      setTickets(ticketsData);
      setStats(statsData);

      toast({
        title: "Tickets chargés",
        description: `${ticketsData.length} tickets récupérés depuis Jira`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erreur de chargement",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Rafraîchissement des tickets
  const refreshTickets = useCallback(async () => {
    setLoading(true);

    try {
      await ticketService.refreshTickets();
      await fetchTickets();

      toast({
        title: "Tickets rafraîchis",
        description: "Les tickets ont été synchronisés avec Jira",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur de rafraîchissement";
      toast({
        variant: "destructive",
        title: "Erreur de rafraîchissement",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [fetchTickets, toast]);

  // Récupération d'un ticket spécifique
  const getTicket = useCallback(
    async (idOrKey: string) => {
      try {
        return await ticketService.getTicketById(idOrKey);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Ticket non trouvé";
        toast({
          variant: "destructive",
          title: "Ticket introuvable",
          description: errorMessage,
        });
        return null;
      }
    },
    [toast]
  );

  // Filtrage des tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      filters.search === "" ||
      ticket.summary.toLowerCase().includes(filters.search.toLowerCase()) ||
      ticket.key.toLowerCase().includes(filters.search.toLowerCase()) ||
      (ticket.description &&
        ticket.description
          .toLowerCase()
          .includes(filters.search.toLowerCase()));

    const matchesStatus =
      filters.status === "all" || ticket.status === filters.status;

    const matchesType =
      filters.issueType === "all" || ticket.issueType === filters.issueType;

    const matchesPriority =
      filters.priority === "all" || ticket.priority === filters.priority;

    const matchesAssignee =
      filters.assignee === "all" || ticket.assignee === filters.assignee;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesType &&
      matchesPriority &&
      matchesAssignee
    );
  });

  // Chargement initial
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return {
    tickets: filteredTickets,
    allTickets: tickets,
    stats,
    loading,
    error,
    filters,
    setFilters,
    fetchTickets,
    refreshTickets,
    getTicket,
  };
};
