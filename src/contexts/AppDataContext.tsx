// src/contexts/AppDataContext.tsx
import React, { createContext, useContext } from "react";
import { useAssets } from "@/hooks/useAssets";
import type { UseAssetsReturn } from "@/hooks/useAssets";
import { WorkflowHistory } from "@/types"; // Import WorkflowHistory type

// Interface updated to include workflowHistory
interface AppDataContextType extends UseAssetsReturn {
  messages: unknown[];
  workflowHistory: WorkflowHistory[]; // Add workflowHistory
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const assetsData = useAssets();

  // Provide default workflowHistory (empty array if not provided by useAssets)
  const contextValue: AppDataContextType = {
    ...assetsData,
    messages: [],
    workflowHistory: assetsData.workflowHistory || [], // Default to empty array
  };

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = (): AppDataContextType => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return {
    ...context,
    messages: [], // Ensure messages is always an array
    workflowHistory: context.workflowHistory || [], // Ensure workflowHistory is always an array
  };
};