import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, CheckCircle2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useCampaignLeads, useUpdateLeadStatus, useUpdateLeadEmail } from '@/hooks/useColdCallLeads';
import { useCallers } from '@/hooks/useColdCallCallers';
import { useCallerCampaigns } from '@/hooks/useColdCallCampaigns';

export default function AdminKaltaquiseLeads() {
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
  const visibleLeads = leads?.filter(lead => lead.status !== 'invalid') || [];

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

  const handleEmailKeyDown = (e: React.KeyboardEvent, leadId: string) => {
    if (e.key === 'Enter') {
      handleEmailSave(leadId);
    } else if (e.key === 'Escape') {
      setEditingEmailId(null);
      setEmailValue('');
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/admin/kaltaquise/${callerId}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            {caller ? `${caller.first_name} ${caller.last_name}` : 'Laden...'}
          </h1>
          {campaign && (
            <p className="text-muted-foreground">
              Kampagne: {new Date(campaign.campaign_date).toLocaleDateString('de-DE')} | {campaign.brandings?.company_name || 'Kein Branding'}
            </p>
          )}
        </div>
      </div>

      {/* Statistics Card */}
      {campaign && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Statistiken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold">{campaign.total_leads}</div>
                <div className="text-sm text-muted-foreground">Gesamt</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-destructive">{campaign.invalid_count}</div>
                <div className="text-sm text-muted-foreground">Ungültig</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{campaign.mailbox_count}</div>
                <div className="text-sm text-muted-foreground">Mailbox</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{campaign.interested_count}</div>
                <div className="text-sm text-muted-foreground">Interessiert</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : visibleLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Keine Leads vorhanden
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unternehmensname</TableHead>
                  <TableHead>Telefonnummer</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.company_name}</TableCell>
                    <TableCell>{lead.phone_number}</TableCell>
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
                          className="cursor-pointer hover:bg-accent/50 p-1 rounded"
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
                          <Badge className="mr-2">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
