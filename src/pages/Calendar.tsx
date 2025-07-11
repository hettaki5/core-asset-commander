
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
import { Calendar as CalendarIcon, Plus, Clock, Users, MapPin, Bell } from 'lucide-react';
import { Event } from '@/types';

export const Calendar: React.FC = () => {
  const { events, createEvent, assets } = useAppData();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    type: 'meeting' as const,
    relatedAssetId: '',
    assignedTo: [] as string[]
  });

  const canCreateEvent = ['admin', 'ingenieurpr', 'validateur'].includes(user?.role || '');

  const handleCreateEvent = () => {
    if (newEvent.title.trim() && newEvent.startDate && user) {
      createEvent({
        ...newEvent,
        assignedTo: [user.id],
        createdBy: user.id
      });
      setNewEvent({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        type: 'meeting',
        relatedAssetId: '',
        assignedTo: []
      });
      setIsCreating(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'maintenance': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deadline': return 'bg-red-100 text-red-800 border-red-200';
      case 'reminder': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return <Clock className="h-4 w-4" />;
      case 'meeting': return <Users className="h-4 w-4" />;
      case 'deadline': return <Bell className="h-4 w-4" />;
      case 'reminder': return <Bell className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.startDate);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  });

  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.startDate);
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    return eventDate > today && eventDate <= nextWeek;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Calendrier</h1>
          <p className="text-muted-foreground">Gérez vos événements et planifications</p>
        </div>
        {canCreateEvent && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel Événement
          </Button>
        )}
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{todayEvents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{upcomingEvents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Maintenances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {events.filter(e => e.type === 'maintenance').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Événements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire de création */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvel Événement</CardTitle>
            <CardDescription>Planifiez un nouvel événement ou une maintenance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titre de l'événement"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de l'événement"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Date de début</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={newEvent.startDate}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endDate">Date de fin</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={newEvent.endDate}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type d'événement</Label>
                <Select value={newEvent.type} onValueChange={(value: any) => setNewEvent(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="meeting">Réunion</SelectItem>
                    <SelectItem value="deadline">Échéance</SelectItem>
                    <SelectItem value="reminder">Rappel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="asset">Asset associé (optionnel)</Label>
                <Select value={newEvent.relatedAssetId} onValueChange={(value) => setNewEvent(prev => ({ ...prev, relatedAssetId: value }))}>
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateEvent}>
                Créer l'événement
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendrier principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Calendrier</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant={viewMode === 'month' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setViewMode('month')}
                  >
                    Mois
                  </Button>
                  <Button 
                    variant={viewMode === 'week' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setViewMode('week')}
                  >
                    Semaine
                  </Button>
                  <Button 
                    variant={viewMode === 'day' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setViewMode('day')}
                  >
                    Jour
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendrier simplifié - remplacer par un vrai composant calendrier */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                  <div key={day} className="text-center font-medium p-2 text-sm text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - date.getDay() + i - 6);
                  const dayEvents = events.filter(event => {
                    const eventDate = new Date(event.startDate);
                    return eventDate.toDateString() === date.toDateString();
                  });
                  
                  return (
                    <div 
                      key={i} 
                      className="min-h-[80px] p-2 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="text-sm font-medium">
                        {date.getDate()}
                      </div>
                      {dayEvents.map(event => (
                        <div 
                          key={event.id} 
                          className={`text-xs p-1 rounded mt-1 ${getEventTypeColor(event.type)}`}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar avec événements */}
        <div className="space-y-4">
          {/* Événements d'aujourd'hui */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Aujourd'hui</CardTitle>
            </CardHeader>
            <CardContent>
              {todayEvents.length > 0 ? (
                <div className="space-y-3">
                  {todayEvents.map(event => (
                    <div key={event.id} className="border-l-4 border-blue-500 pl-3">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(event.startDate).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <Badge className={getEventTypeColor(event.type)} variant="outline">
                        {getEventTypeIcon(event.type)}
                        <span className="ml-1">
                          {event.type === 'maintenance' ? 'Maintenance' :
                           event.type === 'meeting' ? 'Réunion' :
                           event.type === 'deadline' ? 'Échéance' : 'Rappel'}
                        </span>
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Aucun événement aujourd'hui</p>
              )}
            </CardContent>
          </Card>

          {/* Événements à venir */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">À venir (7 jours)</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 5).map(event => (
                    <div key={event.id} className="border-l-4 border-orange-500 pl-3">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(event.startDate).toLocaleDateString('fr-FR')} à{' '}
                        {new Date(event.startDate).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <Badge className={getEventTypeColor(event.type)} variant="outline">
                        {getEventTypeIcon(event.type)}
                        <span className="ml-1">
                          {event.type === 'maintenance' ? 'Maintenance' :
                           event.type === 'meeting' ? 'Réunion' :
                           event.type === 'deadline' ? 'Échéance' : 'Rappel'}
                        </span>
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Aucun événement prévu</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
