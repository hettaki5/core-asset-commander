import React, { useState } from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Inbox, Plus, Search, Eye, Reply } from 'lucide-react';
import { Message } from '@/types';

export const Messages: React.FC = () => {
  const { messages, sendMessage, markMessageAsRead, assets } = useAppData();
  const { user } = useAuth();
  const [isComposing, setIsComposing] = useState(false);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    toUserId: '',
    relatedAssetId: ''
  });

  // Utilisateurs simulés pour le prototype
  const users = [
    { id: '1', name: 'Jean Martin', role: 'admin' },
    { id: '2', name: 'Marie Dubois', role: 'ingenieurpr' },
    { id: '3', name: 'Pierre Durand', role: 'validateur' },
    { id: '4', name: 'Sophie Bernard', role: 'observateur' }
  ];

  const inboxMessages = messages.filter(msg => msg.toUserId === user?.id);
  const sentMessages = messages.filter(msg => msg.fromUserId === user?.id);
  const currentMessages = activeTab === 'inbox' ? inboxMessages : sentMessages;

  const filteredMessages = currentMessages.filter(msg =>
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = inboxMessages.filter(msg => !msg.isRead).length;

  const handleSendMessage = () => {
    if (newMessage.subject.trim() && newMessage.content.trim() && newMessage.toUserId && user) {
      sendMessage({
        ...newMessage,
        fromUserId: user.id
      });
      setNewMessage({
        subject: '',
        content: '',
        toUserId: '',
        relatedAssetId: ''
      });
      setIsComposing(false);
    }
  };

  const handleReadMessage = (message: Message) => {
    if (!message.isRead && message.toUserId === user?.id) {
      markMessageAsRead(message.id);
    }
    setSelectedMessage(message);
  };

  const getUserName = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.name : 'Utilisateur inconnu';
  };

  const getAssetName = (assetId?: string) => {
    if (!assetId) return null;
    const asset = assets.find(a => a.id === assetId);
    return asset ? asset.name : 'Asset inconnu';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Communiquez avec votre équipe</p>
        </div>
        <Button onClick={() => setIsComposing(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Message
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Messages reçus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inboxMessages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Non lus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Envoyés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentMessages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Liés aux assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {messages.filter(m => m.relatedAssetId).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de composition */}
      {isComposing && (
        <Card>
          <CardHeader>
            <CardTitle>Nouveau Message</CardTitle>
            <CardDescription>Rédigez un nouveau message</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recipient">Destinataire</Label>
                <Select value={newMessage.toUserId} onValueChange={(value) => setNewMessage(prev => ({ ...prev, toUserId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un destinataire" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.filter(u => u.id !== user?.id).map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="asset">Asset associé (optionnel)</Label>
                <Select value={newMessage.relatedAssetId} onValueChange={(value) => setNewMessage(prev => ({ ...prev, relatedAssetId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un asset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucun asset</SelectItem>
                    {assets.map(asset => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="subject">Sujet</Label>
              <Input
                id="subject"
                value={newMessage.subject}
                onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Sujet du message"
              />
            </div>
            <div>
              <Label htmlFor="content">Message</Label>
              <Textarea
                id="content"
                value={newMessage.content}
                onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Contenu du message"
                rows={6}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsComposing(false)}>
                Annuler
              </Button>
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4 mr-2" />
                Envoyer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des messages */}
        <div className="lg:col-span-2">
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
                    onClick={() => handleReadMessage(message)}
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
        </div>

        {/* Détail du message sélectionné */}
        <div>
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{selectedMessage.subject}</CardTitle>
                    <CardDescription>
                      {activeTab === 'inbox' 
                        ? `De: ${getUserName(selectedMessage.fromUserId)}`
                        : `À: ${getUserName(selectedMessage.toUserId)}`
                      }
                    </CardDescription>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedMessage.sentAt).toLocaleString('fr-FR')}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  {selectedMessage.relatedAssetId && (
                    <Badge variant="outline" className="mb-3">
                      📦 {getAssetName(selectedMessage.relatedAssetId)}
                    </Badge>
                  )}
                  <div className="whitespace-pre-wrap text-sm">
                    {selectedMessage.content}
                  </div>
                </div>
                {activeTab === 'inbox' && (
                  <div className="flex gap-2">
                    <Button size="sm">
                      <Reply className="h-4 w-4 mr-2" />
                      Répondre
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Sélectionnez un message pour le lire
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
