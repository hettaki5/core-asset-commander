
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Reply } from 'lucide-react';
import { Message } from '@/types';

interface MessageDetailProps {
  selectedMessage: Message | null;
  activeTab: 'inbox' | 'sent';
  getUserName: (userId: string) => string;
  getAssetName: (assetId?: string) => string | null;
}

export const MessageDetail: React.FC<MessageDetailProps> = ({
  selectedMessage,
  activeTab,
  getUserName,
  getAssetName
}) => {
  if (!selectedMessage) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Sélectionnez un message pour le lire
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
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
  );
};
