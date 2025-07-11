
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Inbox, Search } from 'lucide-react';
import { Message, Asset } from '@/types';

interface MessageListProps {
  activeTab: 'inbox' | 'sent';
  setActiveTab: (tab: 'inbox' | 'sent') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredMessages: Message[];
  selectedMessage: Message | null;
  onMessageClick: (message: Message) => void;
  getUserName: (userId: string) => string;
  getAssetName: (assetId?: string) => string | null;
  unreadCount: number;
}

export const MessageList: React.FC<MessageListProps> = ({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  filteredMessages,
  selectedMessage,
  onMessageClick,
  getUserName,
  getAssetName,
  unreadCount
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant={activeTab === 'inbox' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('inbox')}
              className="relative"
            >
              <Inbox className="h-4 w-4 mr-2" />
              Boîte de réception
              {unreadCount > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === 'sent' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('sent')}
            >
              <Send className="h-4 w-4 mr-2" />
              Envoyés
            </Button>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                !message.isRead && activeTab === 'inbox' ? 'bg-blue-50 border-blue-200' : ''
              } ${selectedMessage?.id === message.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => onMessageClick(message)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {activeTab === 'inbox' 
                      ? `De: ${getUserName(message.fromUserId)}`
                      : `À: ${getUserName(message.toUserId)}`
                    }
                  </span>
                  {!message.isRead && activeTab === 'inbox' && (
                    <Badge variant="secondary" className="text-xs">Nouveau</Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(message.sentAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="font-medium mb-1">{message.subject}</div>
              <div className="text-sm text-muted-foreground line-clamp-2">
                {message.content}
              </div>
              {message.relatedAssetId && (
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    📦 {getAssetName(message.relatedAssetId)}
                  </Badge>
                </div>
              )}
            </div>
          ))}
          {filteredMessages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun message trouvé</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
