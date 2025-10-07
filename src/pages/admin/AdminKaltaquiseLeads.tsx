import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, X, Mail, CheckCircle2, Copy, ThumbsDown, RotateCcw } from 'lucide-react';
import { useCallers } from '@/hooks/useColdCallCallers';
import { useCallerCampaigns } from '@/hooks/useColdCallCampaigns';
import { useCampaignLeads, useUpdateLeadStatus, useUpdateLeadEmail, useConvertLeadToRegularLead } from '@/hooks/useColdCallLeads';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { leadEmailSchema } from '@/lib/validation/coldCallSchema';

const AdminKaltaquiseLeads = () => {
  const { callerId, campaignId } = useParams<{ callerId: string; campaignId: string }>();
  const navigate = useNavigate();
  
  const { data: callers } = useCallers();
  const { data: campaigns } = useCallerCampaigns(callerId || '');
  const { data: leads, isLoading } = useCampaignLeads(campaignId || '');
  const updateStatus = useUpdateLeadStatus();
  const updateEmail = useUpdateLeadEmail();
  const convertToLead = useConvertLeadToRegularLead();
  
  const [editingEmailId, setEditingEmailId] = useState<string | null>(null);
  const [emailValue, setEmailValue] = useState('');
  const [filter, setFilter] = useState<'active' | 'invalid' | 'not_interested' | 'mailbox' | 'interested'>('active');

  const caller = callers?.find(c => c.id === callerId);
  const campaign = campaigns?.find(c => c.id === campaignId);

  const handleStatusUpdate = async (leadId: string, status: 'active' | 'invalid' | 'mailbox' | 'interested' | 'not_interested') => {
    await updateStatus.mutateAsync({ leadId, status, campaignId: campaignId || '' });
  };

  const handleEmailEdit = (leadId: string, currentEmail: string | null) => {
    setEditingEmailId(leadId);
    setEmailValue(currentEmail || '');
  };

  const handleEmailSave = async (leadId: string) => {
    // Validierung mit Zod-Schema
    const validation = leadEmailSchema.safeParse({ email: emailValue });
    
    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || 'Ungültige E-Mail-Adresse';
      toast({
        title: 'Validierungsfehler',
        description: errorMessage,
        variant: 'destructive',
      });
      return;
    }
    
    await updateEmail.mutateAsync({ 
      leadId, 
      email: validation.data.email, 
      campaignId: campaignId || '' 
    });
    setEditingEmailId(null);
    setEmailValue('');
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, leadId: string) => {
    if (e.key === 'Enter') {
      handleEmailSave(leadId);
    } else if (e.key === 'Escape') {
      setEditingEmailId(null);
      setEmailValue('');
    }
  };

  const handlePhoneCopy = (phone: string) => {
    navigator.clipboard.writeText(phone);
    toast({
      title: 'Telefonnummer kopiert',
      description: phone,
    });
  };

  const handleInterested = async (leadId: string, email: string | null) => {
    if (!email || !email.trim()) {
      toast({
        title: 'E-Mail erforderlich',
        description: 'Bitte geben Sie zuerst eine E-Mail-Adresse ein',
        variant: 'destructive',
      });
      return;
    }
    
    // Convert to regular lead
    await convertToLead.mutateAsync({
      coldCallLeadId: leadId,
      email: email,
      coldCallCampaignId: campaignId || '',
      brandingId: campaign?.branding_id || '',
      callerId: campaign?.caller_id || '',
    });
  };

  // Filter and sort leads - those with emails appear first
  const filteredAndSortedLeads = leads
    ?.filter(lead => {
      if (filter === 'invalid') return lead.status === 'invalid';
      if (filter === 'not_interested') return lead.status === 'not_interested';
      if (filter === 'mailbox') return lead.status === 'mailbox';
      if (filter === 'interested') return lead.status === 'interested';
      // 'active' filter: only show truly active leads
      return lead.status === 'active';
    })
    .sort((a, b) => {
      // Leads WITH email come first
      const aHasEmail = !!a.email && a.email.trim().length > 0;
      const bHasEmail = !!b.email && b.email.trim().length > 0;
      
      if (aHasEmail && !bHasEmail) return -1;  // a comes before b
      if (!aHasEmail && bHasEmail) return 1;   // b comes before a
      
      // If both have email or both don't have email: sort alphabetically by company name
      return a.company_name.localeCompare(b.company_name);
    });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate(`/admin/kaltaquise/${callerId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            {caller?.first_name} {caller?.last_name}
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Kampagne: {campaign ? new Date(campaign.campaign_date).toLocaleDateString('de-DE') : ''} |{' '}
            {campaign?.brandings?.company_name}
          </p>
        </div>
      </div>

      <Card className="modern-card border-border/40">
        <CardHeader>
          <CardTitle className="text-2xl">Statistiken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Gesamt</p>
              </div>
              <p className="text-2xl font-bold">{campaign?.total_leads || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <X className="h-4 w-4 text-destructive" />
                <p className="text-sm text-muted-foreground">Ungültig</p>
              </div>
              <p className="text-2xl font-bold text-destructive">{campaign?.invalid_count || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsDown className="h-4 w-4 text-gray-500" />
                <p className="text-sm text-muted-foreground">Nicht interessiert</p>
              </div>
              <p className="text-2xl font-bold text-gray-500">{campaign?.not_interested_count || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-orange-500" />
                <p className="text-sm text-muted-foreground">Mailbox</p>
              </div>
              <p className="text-2xl font-bold text-orange-500">{campaign?.mailbox_count || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <p className="text-sm text-muted-foreground">Interessiert</p>
              </div>
              <p className="text-2xl font-bold text-green-500">{campaign?.interested_count || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="modern-card border-border/40">
        <CardHeader>
          <CardTitle className="text-2xl">Buchstabieralphabet (DIN 5009)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { letter: 'A', word: 'Anton' },
              { letter: 'Ä', word: 'Ärger' },
              { letter: 'B', word: 'Berta' },
              { letter: 'C', word: 'Cäsar' },
              { letter: 'D', word: 'Dora' },
              { letter: 'E', word: 'Emil' },
              { letter: 'F', word: 'Friedrich' },
              { letter: 'G', word: 'Gustav' },
              { letter: 'H', word: 'Heinrich' },
              { letter: 'I', word: 'Ida' },
              { letter: 'J', word: 'Julius' },
              { letter: 'K', word: 'Kaufmann' },
              { letter: 'L', word: 'Ludwig' },
              { letter: 'M', word: 'Martha' },
              { letter: 'N', word: 'Nordpol' },
              { letter: 'O', word: 'Otto' },
              { letter: 'Ö', word: 'Ökonom' },
              { letter: 'P', word: 'Paula' },
              { letter: 'Q', word: 'Quelle' },
              { letter: 'R', word: 'Richard' },
              { letter: 'S', word: 'Samuel' },
              { letter: 'ß', word: 'Eszett' },
              { letter: 'T', word: 'Theodor' },
              { letter: 'U', word: 'Ulrich' },
              { letter: 'Ü', word: 'Übermut' },
              { letter: 'V', word: 'Viktor' },
              { letter: 'W', word: 'Wilhelm' },
              { letter: 'X', word: 'Xanthippe' },
              { letter: 'Y', word: 'Ypsilon' },
              { letter: 'Z', word: 'Zacharias' },
            ].map(({ letter, word }) => (
              <div key={letter} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <span className="font-bold text-lg">{letter}</span>
                <span className="text-sm text-muted-foreground">=</span>
                <span className="text-sm">{word}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="modern-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Leads</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant={filter === 'active' ? 'default' : 'outline'}
                onClick={() => setFilter('active')}
                size="sm"
              >
                Aktive Leads
              </Button>
              <Button 
                variant={filter === 'invalid' ? 'default' : 'outline'}
                onClick={() => setFilter('invalid')}
                size="sm"
              >
                Ungültige
              </Button>
              <Button 
                variant={filter === 'not_interested' ? 'default' : 'outline'}
                onClick={() => setFilter('not_interested')}
                size="sm"
              >
                Nicht interessierte
              </Button>
              <Button 
                variant={filter === 'mailbox' ? 'default' : 'outline'}
                onClick={() => setFilter('mailbox')}
                size="sm"
              >
                Mailbox
              </Button>
              <Button 
                variant={filter === 'interested' ? 'default' : 'outline'}
                onClick={() => setFilter('interested')}
                size="sm"
              >
                Interessiert
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : filteredAndSortedLeads && filteredAndSortedLeads.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unternehmensname</TableHead>
                    <TableHead>Telefonnummer</TableHead>
                    <TableHead className="min-w-[280px]">E-Mail</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.company_name}</TableCell>
                      <TableCell>
                        <div
                          className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-1 rounded transition-colors group w-fit"
                          onClick={() => handlePhoneCopy(lead.phone_number)}
                        >
                          <span>{lead.phone_number}</span>
                          <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </TableCell>
                      <TableCell>
                        {editingEmailId === lead.id ? (
                          <div className="flex items-center gap-2 min-w-[280px]">
                            <Input
                              type="email"
                              value={emailValue}
                              onChange={(e) => setEmailValue(e.target.value)}
                              onKeyDown={(e) => handleEmailKeyDown(e, lead.id)}
                              placeholder="email@example.com"
                              className="h-9 flex-1"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-9 w-9 p-0"
                              onClick={() => handleEmailSave(lead.id)}
                              disabled={!emailValue.trim()}
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-9 w-9 p-0"
                              onClick={() => {
                                setEditingEmailId(null);
                                setEmailValue('');
                              }}
                            >
                              <X className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        ) : (
                          <div 
                            className="cursor-pointer hover:bg-accent/50 p-2 rounded transition-colors min-w-[280px] truncate"
                            onClick={() => handleEmailEdit(lead.id, lead.email)}
                            title={lead.email || 'Klicken zum Hinzufügen'}
                          >
                            {lead.email ? (
                              <span className="text-sm">{lead.email}</span>
                            ) : (
                              <span className="text-muted-foreground text-sm italic">
                                + E-Mail hinzufügen
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 items-center">
                          {lead.status === 'active' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(lead.id, 'invalid')}
                                disabled={updateStatus.isPending}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Ungültig
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(lead.id, 'not_interested')}
                                disabled={updateStatus.isPending}
                              >
                                <ThumbsDown className="h-4 w-4 mr-1" />
                                Nicht interessiert
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(lead.id, 'mailbox')}
                                disabled={updateStatus.isPending}
                              >
                                <Mail className="h-4 w-4 mr-1" />
                                Mailbox
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleInterested(lead.id, lead.email)}
                                disabled={!lead.email || !lead.email.trim() || convertToLead.isPending}
                                title={!lead.email ? "Bitte zuerst E-Mail eingeben" : "Lead als interessiert markieren und konvertieren"}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Interessiert
                              </Button>
                            </>
                          )}
                          {lead.status === 'invalid' && (
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive">
                                <X className="h-3 w-3 mr-1" />
                                Ungültig
                              </Badge>
                              {lead.invalid_timestamp && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(lead.invalid_timestamp).toLocaleString('de-DE', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              )}
                            </div>
                          )}
                          {lead.status === 'not_interested' && (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-gray-500 text-white">
                                <ThumbsDown className="h-3 w-3 mr-1" />
                                Nicht interessiert
                              </Badge>
                              {lead.not_interested_timestamp && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(lead.not_interested_timestamp).toLocaleString('de-DE', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              )}
                            </div>
                          )}
                          {lead.status === 'mailbox' && (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                <Mail className="h-3 w-3 mr-1" />
                                Mailbox
                              </Badge>
                              {lead.mailbox_timestamp && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(lead.mailbox_timestamp).toLocaleString('de-DE', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              )}
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleStatusUpdate(lead.id, 'active')}
                                title="Zurücksetzen"
                                disabled={updateStatus.isPending}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {lead.status === 'interested' && (
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-500 hover:bg-green-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Interessiert
                              </Badge>
                              {lead.interested_timestamp && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(lead.interested_timestamp).toLocaleString('de-DE', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Keine Leads in dieser Kategorie
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminKaltaquiseLeads;
