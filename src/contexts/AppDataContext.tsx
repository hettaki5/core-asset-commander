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

// Données simulées pour le textile
const mockAssetTypes: AssetType[] = [
  {
    id: '1',
    name: 'Machine à coudre industrielle',
    description: 'Équipement de couture pour production textile',
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
          { id: '4', name: 'Vitesse maximale (ppm)', type: 'number', required: false },
          { id: '5', name: 'Type de point', type: 'select', required: false, options: ['Point droit', 'Point zigzag', 'Surjet', 'Boutonnière'] },
          { id: '6', name: 'Longueur de bras (mm)', type: 'number', required: false }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Métier à tisser',
    description: 'Équipement de tissage',
    isActive: true,
    sections: [
      {
        id: '3',
        name: 'Configuration machine',
        order: 1,
        fields: [
          { id: '7', name: 'Type de métier', type: 'select', required: true, options: ['Jet d\'air', 'Jet d\'eau', 'Projectile', 'Rapière'] },
          { id: '8', name: 'Largeur de tissage (cm)', type: 'number', required: true },
          { id: '9', name: 'Nombre de cadres', type: 'number', required: true }
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'Teinture',
    description: 'Équipement de teinture textile',
    isActive: true,
    sections: [
      {
        id: '4',
        name: 'Spécifications teinture',
        order: 1,
        fields: [
          { id: '10', name: 'Capacité (kg)', type: 'number', required: true },
          { id: '11', name: 'Température max (°C)', type: 'number', required: true },
          { id: '12', name: 'Type de teinture', type: 'select', required: true, options: ['Réactive', 'Dispersée', 'Acide', 'Basique'] }
        ]
      }
    ]
  }
];

const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Juki DDL-8700',
    type: 'Machine à coudre industrielle',
    status: 'approved',
    model: 'DDL-8700',
    serialNumber: 'JK8700001',
    supplier: 'Juki Corporation',
    assignedTo: 'Atelier Couture A',
    location: 'Ligne de production 1',
    description: 'Machine à coudre industrielle haute vitesse pour tissus légers',
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
          { id: '1', name: 'Modèle', type: 'text', value: 'DDL-8700', required: true },
          { id: '2', name: 'Numéro de série', type: 'text', value: 'JK8700001', required: true },
          { id: '3', name: 'Date d\'achat', type: 'date', value: '2024-01-10', required: false }
        ]
      },
      {
        id: '2',
        name: 'Spécifications techniques',
        fields: [
          { id: '4', name: 'Vitesse maximale (ppm)', type: 'number', value: 5500, required: false },
          { id: '5', name: 'Type de point', type: 'select', value: 'Point droit', required: false, options: ['Point droit', 'Point zigzag', 'Surjet', 'Boutonnière'] },
          { id: '6', name: 'Longueur de bras (mm)', type: 'number', value: 305, required: false }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Picanol OptiMax-i',
    type: 'Métier à tisser',
    status: 'pending',
    model: 'OptiMax-i-190',
    serialNumber: 'PIC190001',
    supplier: 'Picanol Group',
    location: 'Atelier tissage',
    description: 'Métier à tisser jet d\'air haute performance',
    createdBy: '2',
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
    sections: [
      {
        id: '3',
        name: 'Configuration machine',
        fields: [
          { id: '7', name: 'Type de métier', type: 'select', value: 'Jet d\'air', required: true, options: ['Jet d\'air', 'Jet d\'eau', 'Projectile', 'Rapière'] },
          { id: '8', name: 'Largeur de tissage (cm)', type: 'number', value: 190, required: true },
          { id: '9', name: 'Nombre de cadres', type: 'number', value: 16, required: true }
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'Thies Eco-Soft',
    type: 'Teinture',
    status: 'draft',
    model: 'Eco-Soft 150',
    serialNumber: 'THI150001',
    supplier: 'Thies GmbH',
    location: 'Atelier teinture',
    description: 'Machine de teinture écologique pour tissus délicats',
    createdBy: '2',
    createdAt: '2024-01-22T11:00:00Z',
    updatedAt: '2024-01-22T11:00:00Z',
    sections: [
      {
        id: '4',
        name: 'Spécifications teinture',
        fields: [
          { id: '10', name: 'Capacité (kg)', type: 'number', value: 150, required: true },
          { id: '11', name: 'Température max (°C)', type: 'number', value: 135, required: true },
          { id: '12', name: 'Type de teinture', type: 'select', value: 'Réactive', required: true, options: ['Réactive', 'Dispersée', 'Acide', 'Basique'] }
        ]
      }
    ]
  },
  {
    id: '4',
    name: 'Brother S-7300A',
    type: 'Machine à coudre industrielle',
    status: 'approved',
    model: 'S-7300A',
    serialNumber: 'BR7300002',
    supplier: 'Brother Industries',
    assignedTo: 'Atelier Couture B',
    location: 'Ligne de production 2',
    description: 'Machine surjeteuse industrielle',
    createdBy: '2',
    createdAt: '2024-01-18T14:00:00Z',
    updatedAt: '2024-01-19T09:30:00Z',
    validatedBy: '3',
    validatedAt: '2024-01-19T09:30:00Z',
    sections: [
      {
        id: '1',
        name: 'Informations générales',
        fields: [
          { id: '1', name: 'Modèle', type: 'text', value: 'S-7300A', required: true },
          { id: '2', name: 'Numéro de série', type: 'text', value: 'BR7300002', required: true },
          { id: '3', name: 'Date d\'achat', type: 'date', value: '2024-01-12', required: false }
        ]
      },
      {
        id: '2',
        name: 'Spécifications techniques',
        fields: [
          { id: '4', name: 'Vitesse maximale (ppm)', type: 'number', value: 7000, required: false },
          { id: '5', name: 'Type de point', type: 'select', value: 'Surjet', required: false, options: ['Point droit', 'Point zigzag', 'Surjet', 'Boutonnière'] },
          { id: '6', name: 'Longueur de bras (mm)', type: 'number', value: 280, required: false }
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
    title: 'Maintenance métier à tisser',
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
    subject: 'Validation requise pour Picanol OptiMax-i',
    content: 'Le métier à tisser Picanol OptiMax-i est prêt pour validation. Merci de vérifier les spécifications.',
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
        validatedBy: 'current_user_id',
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
