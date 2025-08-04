import React, { useState } from "react";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Message } from "@/types";
import { MessageStats } from "@/components/messages/MessageStats";
import { MessageComposer } from "@/components/messages/MessageComposer";
import { MessageList } from "@/components/messages/MessageList";
import { MessageDetail } from "@/components/messages/MessageDetail";

export const Messages: React.FC = () => {
  const { messages, sendMessage, markMessageAsRead, assets } = useAppData();
  const { user } = useAuth();
  const [isComposing, setIsComposing] = useState(false);
  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState({
    subject: "",
    content: "",
    toUserId: "",
    relatedAssetId: "",
  });

  // Utilisateurs simulés pour le prototype - ensure all have valid IDs
  const users = [
    { id: "1", name: "Jean Martin", role: "admin" },
    { id: "2", name: "Marie Dubois", role: "ingenieurpr" },
    { id: "3", name: "Pierre Durand", role: "validateur" },
    { id: "4", name: "Sophie Bernard", role: "observateur" },
  ].filter((u) => u.id && u.id.trim() !== ""); // Filter out any users with empty IDs

  const inboxMessages = messages.filter((msg) => msg.toUserId === user?.id);
  const sentMessages = messages.filter((msg) => msg.fromUserId === user?.id);
  const currentMessages = activeTab === "inbox" ? inboxMessages : sentMessages;

  const filteredMessages = currentMessages.filter(
    (msg) =>
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = inboxMessages.filter((msg) => !msg.isRead).length;

  const handleSendMessage = () => {
    if (
      newMessage.subject.trim() &&
      newMessage.content.trim() &&
      newMessage.toUserId &&
      user
    ) {
      sendMessage({
        ...newMessage,
        relatedAssetId:
          newMessage.relatedAssetId === "none"
            ? undefined
            : newMessage.relatedAssetId,
        fromUserId: user.id,
      });
      setNewMessage({
        subject: "",
        content: "",
        toUserId: "",
        relatedAssetId: "",
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
    const foundUser = users.find((u) => u.id === userId);
    return foundUser ? foundUser.name : "Utilisateur inconnu";
  };

  const getAssetName = (assetId?: string) => {
    if (!assetId) return null;
    const asset = assets.find((a) => a.id === assetId);
    return asset ? asset.name : "Asset inconnu";
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

      <MessageStats
        inboxMessages={inboxMessages}
        sentMessages={sentMessages}
        messages={messages}
        unreadCount={unreadCount}
      />

      <MessageComposer
        isComposing={isComposing}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onSend={handleSendMessage}
        onCancel={() => setIsComposing(false)}
        users={users}
        assets={assets}
        currentUserId={user?.id}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MessageList
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredMessages={filteredMessages}
            selectedMessage={selectedMessage}
            onMessageClick={handleReadMessage}
            getUserName={getUserName}
            getAssetName={getAssetName}
            unreadCount={unreadCount}
          />
        </div>

        <div>
          <MessageDetail
            selectedMessage={selectedMessage}
            activeTab={activeTab}
            getUserName={getUserName}
            getAssetName={getAssetName}
          />
        </div>
      </div>
    </div>
  );
};
