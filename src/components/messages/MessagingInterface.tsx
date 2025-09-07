// Fixed MessagingInterface.tsx with correct types
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Send,
  Search,
  MessageCircle,
  Users,
  Hash,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { messageService } from "@/services/messageService";
import type {
  Conversation,
  Message,
  CreateConversationRequest,
  SendMessageRequest,
  UserSearchResult,
  EnrichedLastMessageInfo,
} from "@/types/messages";

interface MessagingInterfaceProps {
  className?: string;
}

export const MessagingInterface: React.FC<MessagingInterfaceProps> = ({
  className = "",
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New conversation states
  const [newConversationType, setNewConversationType] = useState<
    "PRIVATE" | "GROUP"
  >("PRIVATE");
  const [newConversationName, setNewConversationName] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<
    UserSearchResult[]
  >([]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation);
    }
  }, [activeConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await messageService.getConversations();
      setConversations(data);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des conversations");
      console.error("Error loading conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const data = await messageService.getMessages(conversationId);
      setMessages(data);

      // Mark messages as read
      await messageService.markMessagesAsRead(conversationId);

      // Update conversation unread count
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeConversation) return;

    try {
      const request: SendMessageRequest = {
        conversationId: activeConversation,
        content: messageText.trim(),
        messageType: "TEXT", // Fixed: use messageType instead of type
      };

      const newMessage = await messageService.sendMessage(request);
      setMessages((prev) => [...prev, newMessage]);
      setMessageText("");

      // Update conversation last message - Fixed type compatibility
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversation
            ? {
                ...conv,
                lastMessage: {
                  id: newMessage.id,
                  content: newMessage.content,
                  senderInfo: newMessage.senderInfo || {
                    keycloakUserId: newMessage.senderId,
                    username: newMessage.senderId,
                    displayName: newMessage.senderId,
                    email: "",
                    roles: [],
                    enabled: true,
                  },
                  timestamp: newMessage.timestamp,
                } as EnrichedLastMessageInfo,
                messageCount: conv.messageCount + 1,
              }
            : conv
        )
      );
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Erreur lors de l'envoi du message");
    }
  };

  const searchUsers = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await messageService.searchUsers(searchTerm);
      // Filter out current user
      const filtered = results.filter((u) => u.keycloakUserId !== user?.id);
      setSearchResults(filtered);
    } catch (err) {
      console.error("Error searching users:", err);
    }
  };

  const handleCreateConversation = async () => {
    if (
      newConversationType === "PRIVATE" &&
      selectedParticipants.length !== 1
    ) {
      setError("Une conversation privée doit avoir exactement 1 participant");
      return;
    }

    if (
      newConversationType === "GROUP" &&
      (!newConversationName.trim() || selectedParticipants.length === 0)
    ) {
      setError("Un groupe doit avoir un nom et au moins 1 participant");
      return;
    }

    try {
      const request: CreateConversationRequest = {
        type: newConversationType,
        participants: selectedParticipants.map((p) => p.keycloakUserId),
        ...(newConversationType === "GROUP" && {
          name: newConversationName.trim(),
        }),
      };

      const newConversation = await messageService.createConversation(request);
      setConversations((prev) => [newConversation, ...prev]);
      setActiveConversation(newConversation.id);

      // Reset form
      setShowNewConversation(false);
      setNewConversationType("PRIVATE");
      setNewConversationName("");
      setSelectedParticipants([]);
      setUserSearchTerm("");
      setSearchResults([]);
      setError(null);
    } catch (err) {
      console.error("Error creating conversation:", err);
      setError("Erreur lors de la création de la conversation");
    }
  };

  // Helper function to get conversation display name
  const getConversationDisplayName = (conversation: Conversation): string => {
    if (conversation.name) {
      return conversation.name;
    }

    // For private conversations, try to get the other participant's name
    if (
      conversation.type === "PRIVATE" &&
      Array.isArray(conversation.participants)
    ) {
      // If participants are ParticipantInfo objects, get the display name
      const otherParticipant = conversation.participants.find(
        (p: any) => (typeof p === "string" ? p : p.userId) !== user?.id
      );

      if (otherParticipant) {
        return typeof otherParticipant === "string"
          ? otherParticipant
          : otherParticipant.displayName ||
              otherParticipant.username ||
              "Utilisateur";
      }
    }

    return `Conversation ${conversation.id.slice(0, 8)}`;
  };

  // Helper function to get participant count
  const getParticipantCount = (conversation: Conversation): number => {
    if (Array.isArray(conversation.participants)) {
      return conversation.participants.length;
    }
    return 0;
  };

  // Fixed: Helper function to get last message timestamp
  const getLastMessageTimestamp = (
    conversation: Conversation
  ): string | null => {
    if (conversation.lastMessage && conversation.lastMessage.timestamp) {
      return conversation.lastMessage.timestamp;
    }
    return null;
  };

  // Fixed: Helper function to get last message text
  const getLastMessageText = (conversation: Conversation): string => {
    if (conversation.lastMessage && conversation.lastMessage.content) {
      return conversation.lastMessage.content;
    }
    return "Aucun message";
  };

  const currentConversation = conversations.find(
    (c) => c.id === activeConversation
  );

  const filteredConversations = conversations.filter((conv) => {
    const displayName = getConversationDisplayName(conv);
    const lastMessageText = getLastMessageText(conv);
    return (
      displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lastMessageText.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Chargement des conversations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex h-[600px] border rounded-lg overflow-hidden bg-background ${className}`}
    >
      {/* Sidebar - Liste des conversations */}
      <div className="w-80 border-r bg-muted/30">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Messages</h2>
            <div className="flex items-center gap-2">
              <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowNewConversation(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-auto flex-1">
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 border-b">
              {error}
            </div>
          )}

          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 mb-1 ${
                  activeConversation === conversation.id
                    ? "bg-primary/10 border-l-4 border-primary"
                    : ""
                }`}
                onClick={() => setActiveConversation(conversation.id)}
              >
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    {conversation.type === "PRIVATE" ? (
                      <div className="h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {getConversationDisplayName(conversation).charAt(0) ||
                          "U"}
                      </div>
                    ) : (
                      <Hash className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">
                      {getConversationDisplayName(conversation)}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {getLastMessageTimestamp(conversation) &&
                        new Date(
                          getLastMessageTimestamp(conversation)!
                        ).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {getLastMessageText(conversation)}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>

                  {conversation.type === "GROUP" && (
                    <div className="flex items-center gap-1 mt-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {getParticipantCount(conversation)} membres
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredConversations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune conversation trouvée</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zone de conversation principale */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* En-tête de la conversation */}
            <div className="border-b p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  {currentConversation.type === "PRIVATE" ? (
                    <div className="h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">
                      {getConversationDisplayName(currentConversation).charAt(
                        0
                      ) || "U"}
                    </div>
                  ) : (
                    <Hash className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {getConversationDisplayName(currentConversation)}
                  </h3>
                  {currentConversation.type === "GROUP" && (
                    <p className="text-sm text-muted-foreground">
                      {getParticipantCount(currentConversation)} membres
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Zone des messages */}
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwn = message.senderId === user?.id;
                  // Get proper display name from senderInfo or fallback to senderId
                  const senderDisplayName =
                    message.senderInfo?.displayName ||
                    message.senderInfo?.username ||
                    message.senderId ||
                    "Utilisateur";

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isOwn && (
                        <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center text-xs font-medium">
                          {senderDisplayName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div
                        className={`max-w-[70%] ${
                          isOwn ? "items-end" : "items-start"
                        } flex flex-col`}
                      >
                        {!isOwn && (
                          <span className="text-xs text-muted-foreground mb-1">
                            {senderDisplayName}
                          </span>
                        )}

                        <div
                          className={`px-3 py-2 rounded-lg ${
                            isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>

                        <span className="text-xs text-muted-foreground mt-1">
                          {new Date(message.timestamp).toLocaleTimeString(
                            "fr-FR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Zone de saisie */}
            <div className="border-t p-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Tapez votre message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          // État vide
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">
                Sélectionnez une conversation
              </h3>
              <p className="text-muted-foreground mb-4">
                Choisissez une conversation existante ou créez-en une nouvelle
              </p>
              <Button onClick={() => setShowNewConversation(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle conversation
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal nouvelle conversation */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md max-h-[80vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Nouvelle conversation</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewConversation(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Type de conversation */}
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={newConversationType}
                  onValueChange={(value: "PRIVATE" | "GROUP") =>
                    setNewConversationType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRIVATE">Conversation privée</SelectItem>
                    <SelectItem value="GROUP">Groupe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Nom du groupe */}
              {newConversationType === "GROUP" && (
                <div>
                  <label className="text-sm font-medium">Nom du groupe</label>
                  <Input
                    value={newConversationName}
                    onChange={(e) => setNewConversationName(e.target.value)}
                    placeholder="Nom du groupe"
                  />
                </div>
              )}

              {/* Recherche utilisateurs */}
              <div>
                <label className="text-sm font-medium">
                  Ajouter des participants
                </label>
                <Input
                  value={userSearchTerm}
                  onChange={(e) => {
                    setUserSearchTerm(e.target.value);
                    searchUsers(e.target.value);
                  }}
                  placeholder="Rechercher un utilisateur..."
                />
              </div>

              {/* Résultats de recherche */}
              {searchResults.length > 0 && (
                <div className="max-h-40 overflow-auto border rounded p-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.keycloakUserId}
                      className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                      onClick={() => {
                        if (newConversationType === "PRIVATE") {
                          setSelectedParticipants([user]);
                        } else {
                          if (
                            !selectedParticipants.find(
                              (p) => p.keycloakUserId === user.keycloakUserId
                            )
                          ) {
                            setSelectedParticipants((prev) => [...prev, user]);
                          }
                        }
                        setUserSearchTerm("");
                        setSearchResults([]);
                      }}
                    >
                      <div>
                        <p className="text-sm font-medium">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.username}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Participants sélectionnés */}
              {selectedParticipants.length > 0 && (
                <div>
                  <label className="text-sm font-medium">
                    Participants sélectionnés
                  </label>
                  <div className="space-y-1">
                    {selectedParticipants.map((participant) => (
                      <div
                        key={participant.keycloakUserId}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <span className="text-sm">{participant.fullName}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setSelectedParticipants((prev) =>
                              prev.filter(
                                (p) =>
                                  p.keycloakUserId !==
                                  participant.keycloakUserId
                              )
                            )
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNewConversation(false)}
                >
                  Annuler
                </Button>
                <Button onClick={handleCreateConversation}>Créer</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
