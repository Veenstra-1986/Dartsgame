'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Check, X, Calendar, Clock, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

type User = {
  id: string;
  name: string;
  email: string;
};

type Match = {
  id: string;
  gameType: string;
  status: string;
  scheduledAt: string;
  player1: {
    id: string;
    name: string;
    email: string;
  };
  player2?: {
    id: string;
    name: string;
    email: string;
  };
  group: {
    id: string;
    name: string;
  };
};

type Invitations = {
  received: Match[];
  sent: Match[];
};

const gameTypes = [
  { id: '501', name: '501' },
  { id: '301', name: '301' },
  { id: 'cricket', name: 'Cricket' },
  { id: 'around-clock', name: 'Around the Clock' },
  { id: 'high-score', name: 'High Score' },
  { id: 'shanghai', name: 'Shanghai' },
  { id: 'golf', name: 'Golf Darts' },
  { id: 'killers', name: 'Killer' },
  { id: 'gotcha', name: 'Gotcha' },
  { id: 'all-five', name: 'All Five' }
];

interface MatchInvitationsProps {
  currentUser: User | null;
  getAccentColorClass: (color: string) => string;
  getAccentTextColor: (color: string) => string;
  accentColor: string;
  onInvitationChange?: () => void;
}

export function MatchInvitations({
  currentUser,
  getAccentColorClass,
  getAccentTextColor,
  accentColor,
  onInvitationChange
}: MatchInvitationsProps) {
  const [invitations, setInvitations] = useState<Invitations | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteGameType, setInviteGameType] = useState('501');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInvitations();
  }, [currentUser]);

  const fetchInvitations = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/matches/invite?userId=' + currentUser.id);
      const data = await response.json();
      if (data.success) {
        setInvitations(data.invitations);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!currentUser || !inviteEmail || !inviteGameType) {
      toast({
        variant: 'destructive',
        title: 'Ongeldige invoer',
        description: 'Vul alle velden in.'
      });
      return;
    }

    if (inviteEmail === currentUser.email) {
      toast({
        variant: 'destructive',
        title: 'Niet toegestaan',
        description: 'Je kunt jezelf niet uitnodigen.'
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/matches/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          gameType: inviteGameType,
          inviterId: currentUser.id,
          scheduledAt: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Uitnodiging verzonden!',
          description: data.match.player2.name + ' is uitgenodigd voor een ' + inviteGameType + ' wedstrijd.'
        });
        setInviteDialogOpen(false);
        setInviteEmail('');
        setInviteGameType('501');
        fetchInvitations();
        onInvitationChange?.();
      } else {
        toast({
          variant: 'destructive',
          title: 'Fout',
          description: data.error || 'Er ging iets mis.'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fout',
        description: 'Er ging iets mis bij het verzenden van de uitnodiging.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptMatch = async (matchId: string) => {
    try {
      const response = await fetch('/api/matches/' + matchId + '/accept', {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Match geaccepteerd!',
          description: 'De match is begonnen!'
        });
        fetchInvitations();
      } else {
        toast({
          variant: 'destructive',
          title: 'Fout',
          description: data.error || 'Er ging iets mis.'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fout',
        description: 'Er ging iets mis bij het accepteren van de match.'
      });
    }
  };

  const handleDeclineMatch = async (matchId: string) => {
    try {
      const response = await fetch('/api/matches/' + matchId + '/accept', {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Match geannuleerd',
          description: 'De uitnodiging is geannuleerd.'
        });
        fetchInvitations();
      } else {
        toast({
          variant: 'destructive',
          title: 'Fout',
          description: data.error || 'Er ging iets mis.'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fout',
        description: 'Er ging iets mis bij het annuleren van de match.'
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentUser) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <UserPlus className="h-12 w-12 mx-auto mb-4" style={{ color: getAccentTextColor(accentColor), opacity: 0.3 }} />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Niet Ingelogd
          </h3>
          <p className="text-sm text-slate-600">
            Log in om match uitnodigingen te beheren.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
        <p className="text-sm text-slate-500 mt-2">Laden...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Invite Button */}
      <div className="flex justify-end">
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs h-7 px-2" style={{ backgroundColor: getAccentColorClass(accentColor) }}>
              <Send className="h-3 w-3 mr-1" />
              Nodig uit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nodig iemand uit</DialogTitle>
              <DialogDescription>
                Nodig een groepslid uit voor een darts match.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="email">E-mailadres</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@voorbeeld.nl"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="gameType">Spel Type</Label>
                <Select value={inviteGameType} onValueChange={setInviteGameType}>
                  <SelectTrigger id="gameType" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {gameTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSendInvitation}
                  disabled={submitting}
                  className="flex-1"
                  style={{ backgroundColor: getAccentColorClass(accentColor) }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verzenden...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Uitnodiging Versturen
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInviteDialogOpen(false)}
                >
                  Annuleren
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Received Invitations */}
      {invitations?.received && invitations.received.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Ontvangen ({invitations.received.length})
          </h2>
          <div className="space-y-2">
            {invitations.received.map((match) => (
              <Card key={match.id} className="border-l-4" style={{ borderLeftColor: getAccentColorClass(accentColor) }}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">{match.player1.name}</span>
                        <Badge variant="secondary" className="text-[10px]">{match.gameType}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5" />
                          {formatDate(match.scheduledAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {formatTime(match.scheduledAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        className="h-7 w-7 p-0 hover:opacity-90"
                        style={{ backgroundColor: getAccentColorClass(accentColor) }}
                        onClick={() => handleAcceptMatch(match.id)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0"
                        style={{ borderColor: getAccentTextColor(accentColor) }}
                        onClick={() => handleDeclineMatch(match.id)}
                      >
                        <X className="h-3 w-3" style={{ color: getAccentTextColor(accentColor) }} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Sent Invitations */}
      {invitations?.sent && invitations.sent.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Send className="h-4 w-4" />
            Verzonden ({invitations.sent.length})
          </h2>
          <div className="space-y-2">
            {invitations.sent.map((match) => (
              <Card key={match.id} className="opacity-80">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">{match.player2.name}</span>
                        <Badge variant="secondary" className="text-[10px]">{match.gameType}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5" />
                          {formatDate(match.scheduledAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {formatTime(match.scheduledAt)}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[10px]"
                      style={{ borderColor: getAccentTextColor(accentColor) }}
                      onClick={() => handleDeclineMatch(match.id)}
                    >
                      <X className="h-3 w-3 mr-1" style={{ color: getAccentTextColor(accentColor) }} />
                      Annuleren
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Invitations */}
      {(!invitations?.received || invitations.received.length === 0) &&
       (!invitations?.sent || invitations.sent.length === 0) && (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <UserPlus className="h-12 w-12 mx-auto mb-4" style={{ color: getAccentTextColor(accentColor), opacity: 0.3 }} />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Geen uitnodigingen
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Je hebt momenteel geen match uitnodigingen.
            </p>
            <Button
              onClick={() => setInviteDialogOpen(true)}
              style={{ backgroundColor: getAccentColorClass(accentColor) }}
            >
              <Send className="h-4 w-4 mr-2" />
              Nodig iemand uit
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
