// src/components/ui/status-badge.tsx - REMPLACE TOUT LE CONTENU
import React from "react";
import { cn } from "@/lib/utils";
import { AssetStatus } from "@/types";

interface StatusBadgeProps {
  status: AssetStatus | string;
  className?: string;
}

const statusConfig = {
  // Anciens statuts (compatibilité avec le code existant)
  draft: {
    label: "Brouillon",
    className: "status-draft",
  },
  submitted: {
    label: "Soumis",
    className: "status-pending",
  },
  pending: {
    label: "En attente",
    className: "status-pending",
  },
  approved: {
    label: "Approuvé",
    className: "status-approved",
  },
  rejected: {
    label: "Rejeté",
    className: "status-rejected",
  },
  open: {
    label: "Ouvert",
    className: "status-pending",
  },
  in_progress: {
    label: "En cours",
    className: "bg-blue-100 text-blue-800",
  },
  resolved: {
    label: "Résolu",
    className: "status-approved",
  },
  closed: {
    label: "Fermé",
    className: "bg-gray-100 text-gray-800",
  },

  // Nouveaux statuts backend (enums Java)
  DRAFT: {
    label: "Brouillon",
    className: "status-draft",
  },
  SUBMITTED: {
    label: "Soumis",
    className: "status-pending",
  },
  PENDING_VALIDATION: {
    label: "En attente",
    className: "status-pending",
  },
  APPROVED: {
    label: "Approuvé",
    className: "status-approved",
  },
  REJECTED: {
    label: "Rejeté",
    className: "status-rejected",
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
}) => {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    className: "bg-gray-100 text-gray-800",
  };

  return (
    <span className={cn("status-badge", config.className, className)}>
      {config.label}
    </span>
  );
};
