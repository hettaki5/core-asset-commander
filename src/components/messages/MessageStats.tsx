
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Message } from '@/types';

interface MessageStatsProps {
  inboxMessages: Message[];
  sentMessages: Message[];
  messages: Message[];
  unreadCount: number;
}

export const MessageStats: React.FC<MessageStatsProps> = ({
  inboxMessages,
  sentMessages,
  messages,
  unreadCount
}) => {
  return (
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
  );
};
