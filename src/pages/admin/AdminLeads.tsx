import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, Download, Eye, Calendar, Building2, Users, UserCheck, FileText, Package } from "lucide-react";
import { useLeadCampaigns, useCampaignLeads, useUploadLeadCampaign, LeadCampaign, Lead } from "@/hooks/useLeads";
import { useBrandings } from "@/hooks/useBranding";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { LeadReservationDialog } from "@/components/admin/LeadReservationDialog";

const AdminLeads = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedBrandingId, setSelectedBrandingId] = useState<string>("");
  const [selectedCampaign, setSelectedCampaign] = useState<LeadCampaign | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "logged-in" | "not-logged-in" | "with-inquiry">("all");
  const [reservationDialogOpen, setReservationDialogOpen] = useState(false);
  const [selectedLeadForReservation, setSelectedLeadForReservation] = useState<Lead | null>(null);

  const { data: campaigns, isLoading: campaignsLoading } = useLeadCampaigns();
  const { data: brandings, isLoading: brandingsLoading } = useBrandings();
  const { data: leads, isLoading: leadsLoading } = useCampaignLeads(selectedCampaign?.id || null);
  const uploadMutation = useUploadLeadCampaign();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert("Datei zu groß (max 10MB)");
        return;
      }
      if (!selectedFile.name.endsWith('.txt')) {
        alert("Nur .txt Dateien erlaubt");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (!file || !selectedBrandingId) {
      alert("Bitte wähle eine Datei und ein Branding aus");
      return;
    }
    uploadMutation.mutate({ file, brandingId: selectedBrandingId });
    setFile(null);
    setSelectedBrandingId("");
  };

  const exportToCSV = (campaign: LeadCampaign, campaignLeads: Lead[]) => {
    const headers = ["Email", "Passwort", "Eingeloggt", "Erster Login", "Letzter Login", "Login-Anzahl", "Anfrage ID"];
    const rows = campaignLeads.map(lead => [
      lead.email,
      lead.password,
      lead.has_logged_in ? "Ja" : "Nein",
      lead.first_login_at ? format(new Date(lead.first_login_at), "dd.MM.yyyy HH:mm", { locale: de }) : "",
      lead.last_login_at ? format(new Date(lead.last_login_at), "dd.MM.yyyy HH:mm", { locale: de }) : "",
      lead.login_count.toString(),
      lead.inquiry_id || "",
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-${campaign.campaign_name}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredLeads = leads?.filter(lead => {
    if (filterStatus === "all") return true;
    if (filterStatus === "logged-in") return lead.has_logged_in;
    if (filterStatus === "not-logged-in") return !lead.has_logged_in;
    if (filterStatus === "with-inquiry") return lead.inquiry_id !== null;
    return true;
  }) || [];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Lead-Management</h1>
        <p className="text-muted-foreground">Lade Lead-Listen hoch und tracke Conversions</p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Lead-Liste hochladen
          </CardTitle>
          <CardDescription>Lade eine .txt Datei mit Emails hoch (max 10MB)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="file">Datei auswählen</Label>
              <Input
                id="file"
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                disabled={uploadMutation.isPending}
              />
              {file && <p className="text-sm text-muted-foreground mt-1">{file.name}</p>}
            </div>
            <div>
              <Label htmlFor="branding">Branding</Label>
              <Select value={selectedBrandingId} onValueChange={setSelectedBrandingId} disabled={uploadMutation.isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Branding auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {brandings?.filter(b => b.is_active).map(branding => (
                    <SelectItem key={branding.id} value={branding.id}>
                      {branding.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleUpload} disabled={!file || !selectedBrandingId || uploadMutation.isPending} className="w-full">
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Lädt hoch...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Cards */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Kampagnen</h2>
        {campaignsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map(campaign => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-4 w-4" />
                    {campaign.campaign_name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {campaign.brandings?.company_name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Leads gesamt
                    </span>
                    <span className="font-semibold">{campaign.total_leads}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <UserCheck className="h-4 w-4" />
                      Eingeloggt
                    </span>
                    <span className="font-semibold">
                      {campaign.logged_in_count} ({((campaign.logged_in_count / campaign.total_leads) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Anfragen
                    </span>
                    <span className="font-semibold">
                      {campaign.inquiry_count} ({((campaign.inquiry_count / campaign.total_leads) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedCampaign(campaign)} className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Noch keine Leads hochgeladen</p>
              <p className="text-sm text-muted-foreground">Laden Sie Ihre erste Lead-Liste hoch</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={!!selectedCampaign} onOpenChange={(open) => !open && setSelectedCampaign(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lead-Details: {selectedCampaign?.campaign_name}</DialogTitle>
            <DialogDescription>
              {selectedCampaign?.brandings?.company_name} - {selectedCampaign?.total_leads} Leads
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Leads</SelectItem>
                  <SelectItem value="logged-in">Nur eingeloggt</SelectItem>
                  <SelectItem value="not-logged-in">Nur nicht eingeloggt</SelectItem>
                  <SelectItem value="with-inquiry">Nur mit Anfrage</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedCampaign && leads && exportToCSV(selectedCampaign, leads)}
                disabled={!leads || leads.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                CSV Export
              </Button>
            </div>

            {leadsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Passwort</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Erster Login</TableHead>
                      <TableHead>Letzter Login</TableHead>
                      <TableHead>Login-Anzahl</TableHead>
                      <TableHead>Anfrage</TableHead>
                      <TableHead>Reservierungen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Keine Leads gefunden
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLeads.map(lead => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.email}</TableCell>
                          <TableCell className="font-mono">{lead.password}</TableCell>
                          <TableCell>
                            <Badge variant={lead.has_logged_in ? "default" : "secondary"}>
                              {lead.has_logged_in ? "Eingeloggt" : "Nicht eingeloggt"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {lead.first_login_at ? format(new Date(lead.first_login_at), "dd.MM.yyyy HH:mm", { locale: de }) : "-"}
                          </TableCell>
                          <TableCell>
                            {lead.last_login_at ? format(new Date(lead.last_login_at), "dd.MM.yyyy HH:mm", { locale: de }) : "-"}
                          </TableCell>
                          <TableCell>{lead.login_count}</TableCell>
                          <TableCell>
                            {lead.inquiry_id ? <Badge variant="default">✓</Badge> : <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedLeadForReservation(lead);
                                setReservationDialogOpen(true);
                              }}
                            >
                              <Package className="h-4 w-4 mr-1" />
                              Verwalten
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reservation Dialog */}
      <LeadReservationDialog
        lead={selectedLeadForReservation}
        open={reservationDialogOpen}
        onOpenChange={(open) => {
          setReservationDialogOpen(open);
          if (!open) setSelectedLeadForReservation(null);
        }}
      />
    </div>
  );
};

export default AdminLeads;
