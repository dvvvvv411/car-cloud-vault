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
import { ArrowLeft, Users, X, Mail, CheckCircle2, Copy } from 'lucide-react';
import { useCallers } from '@/hooks/useColdCallCallers';
import { useCallerCampaigns } from '@/hooks/useColdCallCampaigns';
import { useCampaignLeads, useUpdateLeadStatus, useUpdateLeadEmail } from '@/hooks/useColdCallLeads';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

const AdminKaltaquiseLeads = () => {
  const { callerId, campaignId } = useParams<{ callerId: string; campaignId: string }>();
  const navigate = useNavigate();
  
  const { data: callers } = useCallers();
  const { data: campaigns } = useCallerCampaigns(callerId || '');
  const { data: leads, isLoading } = useCampaignLeads(campaignId || '');
  const updateStatus = useUpdateLeadStatus();
  const updateEmail = useUpdateLeadEmail();
  
  const [editingEmailId, setEditingEmailId] = useState<string | null>(null);
  const [emailValue, setEmailValue] = useState('');

  const caller = callers?.find(c => c.id === callerId);
  const campaign = campaigns?.find(c => c.id === campaignId);

  const handleStatusUpdate = async (leadId: string, status: 'invalid' | 'mailbox' | 'interested') => {
    await updateStatus.mutateAsync({ leadId, status, campaignId: campaignId || '' });
  };

  const handleEmailEdit = (leadId: string, currentEmail: string | null) => {
    setEditingEmailId(leadId);
    setEmailValue(currentEmail || '');
  };

  const handleEmailSave = async (leadId: string) => {
    if (emailValue.trim()) {
      await updateEmail.mutateAsync({ leadId, email: emailValue, campaignId: campaignId || '' });
    }
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="text-2xl">Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : leads && leads.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unternehmensname</TableHead>
                    <TableHead>Telefonnummer</TableHead>
                    <TableHead>E-Mail</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
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
                          <Input
                            type="email"
                            value={emailValue}
                            onChange={(e) => setEmailValue(e.target.value)}
                            onBlur={() => handleEmailSave(lead.id)}
                            onKeyDown={(e) => handleEmailKeyDown(e, lead.id)}
                            placeholder="email@example.com"
                            className="h-8"
                            autoFocus
                          />
                        ) : (
                          <div 
                            className="cursor-pointer hover:bg-accent/50 p-1 rounded transition-colors"
                            onClick={() => handleEmailEdit(lead.id, lead.email)}
                          >
                            {lead.email || (
                              <span className="text-muted-foreground text-sm">
                                Klicken zum Hinzufügen
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {lead.status === 'mailbox' && (
                            <Badge variant="secondary" className="mr-2">
                              <Mail className="h-3 w-3 mr-1" />
                              Mailbox
                            </Badge>
                          )}
                          {lead.status === 'interested' && (
                            <Badge className="mr-2 bg-green-500 hover:bg-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Interessiert
                            </Badge>
                          )}
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
                                onClick={() => handleStatusUpdate(lead.id, 'mailbox')}
                                disabled={updateStatus.isPending}
                              >
                                <Mail className="h-4 w-4 mr-1" />
                                Mailbox
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(lead.id, 'interested')}
                                disabled={updateStatus.isPending}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Interessiert
                              </Button>
                            </>
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
              Keine Leads vorhanden
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminKaltaquiseLeads;
