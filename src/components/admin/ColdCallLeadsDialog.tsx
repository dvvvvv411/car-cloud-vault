import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCampaignLeads, useUpdateLeadStatus, useUpdateLeadEmail } from '@/hooks/useColdCallLeads';
import { X, CheckCircle2, Mail } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ColdCallLeadsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  campaignDate: string;
}

export const ColdCallLeadsDialog = ({ 
  open, 
  onOpenChange, 
  campaignId,
  campaignDate,
}: ColdCallLeadsDialogProps) => {
  const { data: leads, isLoading } = useCampaignLeads(campaignId);
  const updateStatus = useUpdateLeadStatus();
  const updateEmail = useUpdateLeadEmail();
  
  const [editingEmailId, setEditingEmailId] = useState<string | null>(null);
  const [emailValue, setEmailValue] = useState('');

  const visibleLeads = leads?.filter(lead => lead.status !== 'invalid') || [];

  const handleStatusUpdate = async (leadId: string, status: 'invalid' | 'mailbox' | 'interested') => {
    await updateStatus.mutateAsync({ leadId, status, campaignId });
  };

  const handleEmailEdit = (leadId: string, currentEmail: string | null) => {
    setEditingEmailId(leadId);
    setEmailValue(currentEmail || '');
  };

  const handleEmailSave = async (leadId: string) => {
    if (emailValue.trim()) {
      await updateEmail.mutateAsync({ leadId, email: emailValue, campaignId });
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cold Call Leads - {campaignDate}</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
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
        
        {!isLoading && visibleLeads.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Keine Leads vorhanden
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
