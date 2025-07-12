
import React, { useState } from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateEventDialog } from '@/components/events/CreateEventDialog';
import { Calendar as CalendarIcon, Clock, MapPin, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const Calendar: React.FC = () => {
  const { events, assets } = useAppData();

  const getEventTypeBadge = (type: string) => {
    const variants = {
      maintenance: 'destructive',
      meeting: 'default',
      deadline: 'secondary',
      reminder: 'outline'
    } as const;
    
    const labels = {
      maintenance: 'Maintenance',
      meeting: 'Réunion',
      deadline: 'Échéance',
      reminder: 'Rappel'
    };

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'default'}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const getRelatedAsset = (assetId?: string) => {
    if (!assetId) return null;
    return assets.find(asset => asset.id === assetId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Calendrier</h1>
          <p className="text-muted-foreground">Gérez vos événements et maintenances</p>
        </div>
        <CreateEventDialog />
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Événements totaux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Maintenances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {events.filter(e => e.type === 'maintenance').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Réunions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {events.filter(e => e.type === 'meeting').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Échéances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {events.filter(e => e.type === 'deadline').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des événements */}
      <Card>
        <CardHeader>
          <CardTitle>Événements à venir</CardTitle>
          <CardDescription>Liste de tous vos événements planifiés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => {
              const relatedAsset = getRelatedAsset(event.relatedAssetId);
              return (
                <div key={event.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{event.title}</h3>
                        {getEventTypeBadge(event.type)}
                      </div>
                      {event.description && (
                        <p className="text-muted-foreground text-sm">{event.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          {format(new Date(event.startDate), 'PPP', { locale: fr })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(event.startDate), 'HH:mm')}
                          {event.endDate && ` - ${format(new Date(event.endDate), 'HH:mm')}`}
                        </div>
                        {relatedAsset && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {relatedAsset.name}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {event.assignedTo.length} participant{event.assignedTo.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {events.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun événement planifié</p>
                <p className="text-sm">Créez votre premier événement pour commencer</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
