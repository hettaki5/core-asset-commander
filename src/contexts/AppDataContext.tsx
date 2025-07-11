
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Asset, AssetType, Ticket, Event, Message, LogEntry, WorkflowHistory } from '@/types';

interface AppDataContextType {
  assets: Asset[];
  assetTypes: AssetType[];
  tickets: Ticket[];
  events: Event[];
  messages: Message[];
  logs: LogEntry[];
  workflowHistory: WorkflowHistory[];
  
  // Assets
  createAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  submitAsset: (id: string) => void;
  validateAsset: (id: string, approved: boolean, comment?: string) => void;
  
  // Asset Types
  createAssetType: (assetType: Omit<AssetType, 'id'>) => void;
  updateAssetType: (id: string, updates: Partial<AssetType>) => void;
  
  // Tickets
  createTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  
  // Events
  createEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  
  // Messages
  sendMessage: (message: Omit<Message, 'id' | 'sentAt' | 'isRead'>) => void;
  markMessageAsRead: (id: string) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

// Données simulées
const mockAssetTypes: AssetType[] = [
  {
    id: '1',
    name: 'Ordinateur portable',
    description: 'Équipement informatique mobile',
    isActive: true,
    sections: [
      {
        id: '1',
        name: 'Informations générales',
        order: 1,
        fields: [
          { id: '1', name: 'Modèle', type: 'text', required: true },
          { id: '2', name: 'Numéro de série', type: 'text', required: true },
          { id: '3', name: 'Date d\'achat', type: 'date', required: false }
        ]
      },
      {
        id: '2',
        name: 'Spécifications techniques',
        order: 2,
        fields: [
          { id: '4', name: 'Processeur', type: 'text', required: false },
          { id: '5', name: 'RAM (GB)', type: 'number', required: false },
          { id: '6', name: 'Stockage (GB)', type: 'number', required: false }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Serveur',
    description: 'Équipement serveur',
    isActive: true,
    sections: [
      {
        id: '3',
        name: 'Configuration matérielle',
        order: 1,
        fields: [
          { id: '7', name: 'Type de serveur', type: 'select', required: true, options: ['Rack', 'Blade', 'Tour'] },
          { id: '8', name: 'Nombre de CPU', type: 'number', required: true },
          { id: '9', name: 'RAM totale (GB)', type: 'number', required: true }
        ]
      }
    ]
  }
];

const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Laptop-DEV-001',
    type: 'Ordinateur portable',
    status: 'approved',
    model: 'Dell Latitude 7420',
    serialNumber: 'DL7420001',
    supplier: 'Dell Technologies',
    assignedTo: 'Jean Dupont',
    location: 'Bureau 201',
    description: 'Ordinateur portable pour développeur',
    createdBy: '2',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
    validatedBy: '3',
    validatedAt: '2024-01-16T14:30:00Z',
    sections: [
      {
        id: '1',
        name: 'Informations générales',
        fields: [
          { id: '1', name: 'Modèle', type: 'text', value: 'Dell Latitude 7420', required: true },
          { id: '2', name: 'Numéro de série', type: 'text', value: 'DL7420001', required: true },
          { id: '3', name: 'Date d\'achat', type: 'date', value: '2024-01-10', required: false }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Server-PROD-001',
    type: 'Serveur',
    status: 'pending',
    model: 'HP ProLiant DL380',
    serialNumber: 'HP380001',
    supplier: 'Hewlett Packard Enterprise',
    location: 'Salle serveur A',
    description: 'Serveur de production principal',
    createdBy: '2',
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
    sections: [
      {
        id: '3',
        name: 'Configuration matérielle',
        fields: [
          { id: '7', name: 'Type de serveur', type: 'select', value: 'Rack', required: true, options: ['Rack', 'Blade', 'Tour'] },
          { id: '8', name: 'Nombre de CPU', type: 'number', value: 2, required: true },
          { id: '9', name: 'RAM totale (GB)', type: 'number', value: 64, required: true }
        ]
      }
    ]
  }
];

const mockTickets: Ticket[] = [
  {
    id: '1',
    title: 'Configuration nouveau type d\'asset',
    description: 'Besoin de créer un nouveau type d\'asset pour les imprimantes',
    type: 'configuration',
    priority: 'medium',
    status: 'open',
    assignedTo: '1',
    createdBy: '2',
    createdAt: '2024-01-22T10:00:00Z',
    updatedAt: '2024-01-22T10:00:00Z',
    dueDate: '2024-01-30T23:59:59Z'
  }
];

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Maintenance serveur PROD-001',
    description: 'Maintenance préventive mensuelle',
    startDate: '2024-02-15T14:00:00Z',
    endDate: '2024-02-15T16:00:00Z',
    type: 'maintenance',
    relatedAssetId: '2',
    assignedTo: ['2'],
    createdBy: '1'
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    subject: 'Validation requise pour Server-PROD-001',
    content: 'Le serveur Server-PROD-001 est prêt pour validation. Merci de vérifier les spécifications.',
    fromUserId: '2',
    toUserId: '3',
    relatedAssetId: '2',
    isRead: false,
    sentAt: '2024-01-20T09:30:00Z'
  }
];

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>(mockAssetTypes);
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [workflowHistory, setWorkflowHistory] = useState<WorkflowHistory[]>([]);

  const addLog = (action: string, entityType: LogEntry['entityType'], entityId: string, performedBy: string, details: Record<string, any> = {}) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      action,
      entityType,
      entityId,
      performedBy,
      performedAt: new Date().toISOString(),
      details
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const addWorkflowHistory = (entityId: string, entityType: 'asset' | 'ticket', fromStatus: string, toStatus: string, performedBy: string, comment?: string) => {
    const newHistory: WorkflowHistory = {
      id: Date.now().toString(),
      entityId,
      entityType,
      fromStatus,
      toStatus,
      performedBy,
      performedAt: new Date().toISOString(),
      comment
    };
    setWorkflowHistory(prev => [newHistory, ...prev]);
  };

  // Assets
  const createAsset = (assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAsset: Asset = {
      ...assetData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setAssets(prev => [...prev, newAsset]);
    addLog('CREATE_ASSET', 'asset', newAsset.id, assetData.createdBy, { name: assetData.name });
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets(prev => prev.map(asset => 
      asset.id === id 
        ? { ...asset, ...updates, updatedAt: new Date().toISOString() }
        : asset
    ));
    addLog('UPDATE_ASSET', 'asset', id, updates.createdBy || 'system', updates);
  };

  const deleteAsset = (id: string) => {
    const asset = assets.find(a => a.id === id);
    setAssets(prev => prev.filter(asset => asset.id !== id));
    if (asset) {
      addLog('DELETE_ASSET', 'asset', id, 'system', { name: asset.name });
    }
  };

  const submitAsset = (id: string) => {
    const asset = assets.find(a => a.id === id);
    if (asset && asset.status === 'draft') {
      updateAsset(id, { status: 'submitted' });
      addWorkflowHistory(id, 'asset', 'draft', 'submitted', asset.createdBy);
    }
  };

  const validateAsset = (id: string, approved: boolean, comment?: string) => {
    const asset = assets.find(a => a.id === id);
    if (asset && asset.status === 'submitted') {
      const newStatus = approved ? 'approved' : 'rejected';
      const updates: Partial<Asset> = {
        status: newStatus,
        validatedBy: 'current_user_id', // À remplacer par l'ID de l'utilisateur connecté
        validatedAt: new Date().toISOString()
      };
      
      if (!approved && comment) {
        updates.rejectionReason = comment;
      }
      
      updateAsset(id, updates);
      addWorkflowHistory(id, 'asset', 'submitted', newStatus, 'current_user_id', comment);
    }
  };

  // Asset Types
  const createAssetType = (assetTypeData: Omit<AssetType, 'id'>) => {
    const newAssetType: AssetType = {
      ...assetTypeData,
      id: Date.now().toString()
    };
    setAssetTypes(prev => [...prev, newAssetType]);
    addLog('CREATE_ASSET_TYPE', 'config', newAssetType.id, 'current_user_id', { name: assetTypeData.name });
  };

  const updateAssetType = (id: string, updates: Partial<AssetType>) => {
    setAssetTypes(prev => prev.map(type => 
      type.id === id ? { ...type, ...updates } : type
    ));
    addLog('UPDATE_ASSET_TYPE', 'config', id, 'current_user_id', updates);
  };

  // Tickets
  const createTicket = (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTicket: Ticket = {
      ...ticketData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTickets(prev => [...prev, newTicket]);
    addLog('CREATE_TICKET', 'ticket', newTicket.id, ticketData.createdBy, { title: ticketData.title });
  };

  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === id 
        ? { ...ticket, ...updates, updatedAt: new Date().toISOString() }
        : ticket
    ));
    addLog('UPDATE_TICKET', 'ticket', id, 'current_user_id', updates);
  };

  // Events
  const createEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString()
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id: string, updates: Partial<Event>) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  // Messages
  const sendMessage = (messageData: Omit<Message, 'id' | 'sentAt' | 'isRead'>) => {
    const newMessage: Message = {
      ...messageData,
      id: Date.now().toString(),
      sentAt: new Date().toISOString(),
      isRead: false
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const markMessageAsRead = (id: string) => {
    setMessages(prev => prev.map(message => 
      message.id === id ? { ...message, isRead: true } : message
    ));
  };

  const value: AppDataContextType = {
    assets,
    assetTypes,
    tickets,
    events,
    messages,
    logs,
    workflowHistory,
    createAsset,
    updateAsset,
    deleteAsset,
    submitAsset,
    validateAsset,
    createAssetType,
    updateAssetType,
    createTicket,
    updateTicket,
    createEvent,
    updateEvent,
    deleteEvent,
    sendMessage,
    markMessageAsRead
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = (): AppDataContextType => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
