
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send } from 'lucide-react';
import { Asset } from '@/types';

interface MessageComposerProps {
  isComposing: boolean;
  newMessage: {
    subject: string;
    content: string;
    toUserId: string;
    relatedAssetId: string;
  };
  setNewMessage: React.Dispatch<React.SetStateAction<{
    subject: string;
    content: string;
    toUserId: string;
    relatedAssetId: string;
  }>>;
  onSend: () => void;
  onCancel: () => void;
  users: Array<{ id: string; name: string; role: string }>;
  assets: Asset[];
  currentUserId?: string;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  isComposing,
  newMessage,
  setNewMessage,
  onSend,
  onCancel,
  users,
  assets,
  currentUserId
}) => {
  if (!isComposing) return null;

  return (
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
                {users.filter(u => u.id !== currentUserId).map(u => (
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
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button onClick={onSend}>
            <Send className="h-4 w-4 mr-2" />
            Envoyer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
