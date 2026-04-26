import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Send,
  Search,
  CheckCircle2,
  AlertCircle,
  Bot,
  KeyRound,
} from "lucide-react";

interface BrandingRow {
  id: string;
  company_name: string;
  lawyer_firm_name: string;
  telegram_chat_id: string | null;
  telegram_notify_new_inquiry: boolean;
  telegram_notify_moechte_rgkv: boolean;
  telegram_notify_rgkv_sent: boolean;
  telegram_notify_amtsgericht_ready: boolean;
}

interface DiscoveredChat {
  id: number | string;
  type: string;
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export default function AdminTelegram() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string>("");
  const [chatId, setChatId] = useState("");
  const [notifyNew, setNotifyNew] = useState(true);
  const [notifyMoechte, setNotifyMoechte] = useState(true);
  const [notifyRgkvSent, setNotifyRgkvSent] = useState(true);
  const [notifyAmtsgericht, setNotifyAmtsgericht] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [chats, setChats] = useState<DiscoveredChat[]>([]);

  const { data: brandings, isLoading } = useQuery({
    queryKey: ["brandings-telegram"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brandings")
        .select(
          "id, company_name, lawyer_firm_name, telegram_chat_id, telegram_notify_new_inquiry, telegram_notify_moechte_rgkv, telegram_notify_rgkv_sent, telegram_notify_amtsgericht_ready"
        )
        .order("company_name");
      if (error) throw error;
      return (data as unknown) as BrandingRow[];
    },
  });

  const branding = useMemo(
    () => brandings?.find((b) => b.id === selectedId),
    [brandings, selectedId]
  );

  useEffect(() => {
    if (brandings && brandings.length > 0 && !selectedId) {
      setSelectedId(brandings[0].id);
    }
  }, [brandings, selectedId]);

  useEffect(() => {
    if (branding) {
      setChatId(branding.telegram_chat_id || "");
      setNotifyNew(branding.telegram_notify_new_inquiry);
      setNotifyMoechte(branding.telegram_notify_moechte_rgkv);
      setNotifyRgkvSent(branding.telegram_notify_rgkv_sent);
      setNotifyAmtsgericht(branding.telegram_notify_amtsgericht_ready);
    }
  }, [branding]);

  const handleSave = async () => {
    if (!branding) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("brandings")
        .update({
          telegram_chat_id: chatId.trim() || null,
          telegram_notify_new_inquiry: notifyNew,
          telegram_notify_moechte_rgkv: notifyMoechte,
          telegram_notify_rgkv_sent: notifyRgkvSent,
          telegram_notify_amtsgericht_ready: notifyAmtsgericht,
        })
        .eq("id", branding.id);
      if (error) throw error;
      toast({ title: "Telegram-Einstellungen gespeichert" });
      qc.invalidateQueries({ queryKey: ["brandings-telegram"] });
    } catch (err: any) {
      toast({
        title: "Fehler beim Speichern",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDiscover = async () => {
    setDiscovering(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "telegram-get-updates",
        { body: { action: "get_updates" } }
      );
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Unbekannter Fehler");
      setChats(data.chats || []);
      setDiscoverOpen(true);
      if ((data.chats || []).length === 0) {
        toast({
          title: "Keine Chats gefunden",
          description:
            "Stelle sicher, dass der Bot in der Gruppe ist UND mindestens eine Nachricht in der Gruppe geschickt wurde.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Fehler",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setDiscovering(false);
    }
  };

  const handleTest = async () => {
    if (!chatId.trim()) {
      toast({
        title: "Chat-ID fehlt",
        description: "Bitte zuerst eine Chat-ID eintragen.",
        variant: "destructive",
      });
      return;
    }
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "telegram-get-updates",
        {
          body: {
            chatId: chatId.trim(),
            action: "send_test",
            text: `✅ <b>Test-Nachricht</b>\n\nDie Telegram-Integration für <b>${
              branding?.company_name || "diese Branding"
            }</b> funktioniert!`,
          },
        }
      );
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Unbekannter Fehler");
      toast({
        title: "Test-Nachricht gesendet",
        description: "Schau in deine Telegram-Gruppe.",
      });
    } catch (err: any) {
      toast({
        title: "Fehler beim Senden",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const isConfigured = !!branding?.telegram_chat_id;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Telegram</h2>
        <p className="text-muted-foreground">
          Ein zentraler Bot, pro Branding eigene Chat-Gruppe und Event-Auswahl.
        </p>
      </div>

      {/* Bot-Token Hinweis */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4" />
            Bot-Token
          </CardTitle>
          <CardDescription>
            Der Bot-Token wird zentral als Supabase Secret{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">
              TELEGRAM_BOT_TOKEN
            </code>{" "}
            verwaltet — gilt für <strong>alle Brandings</strong>. Es gibt nur
            einen Bot, aber jede Branding kann in einer eigenen Gruppe
            benachrichtigt werden.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Setup Anleitung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Setup-Anleitung
          </CardTitle>
          <CardDescription>
            So richtest du den Telegram-Bot ein (einmalig pro Branding):
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="rounded-lg border p-4 space-y-2">
            <p className="font-semibold">1. Bot bei BotFather erstellen (nur einmal nötig)</p>
            <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
              <li>Öffne Telegram und suche nach <code className="bg-muted px-1 rounded">@BotFather</code></li>
              <li>Sende <code className="bg-muted px-1 rounded">/newbot</code></li>
              <li>Wähle einen Namen (z. B. „Kanzlei Notifications")</li>
              <li>Wähle einen Username, der auf <code className="bg-muted px-1 rounded">bot</code> endet</li>
              <li>Kopiere den <strong>Bot-Token</strong> und hinterlege ihn als Supabase Secret <code className="bg-muted px-1 rounded">TELEGRAM_BOT_TOKEN</code> (ist bereits gesetzt, falls du den Token schon einmal eingegeben hast)</li>
            </ol>
          </div>

          <div className="rounded-lg border p-4 space-y-2">
            <p className="font-semibold">2. Bot in deine Gruppe einladen</p>
            <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
              <li>Erstelle eine Telegram-Gruppe (oder nutze eine bestehende) — pro Branding eine eigene Gruppe</li>
              <li>Tippe oben auf den Gruppennamen → <strong>Mitglieder hinzufügen</strong> → suche deinen Bot per Username → hinzufügen</li>
              <li><strong>Wichtig:</strong> Sende mindestens <strong>eine Nachricht</strong> in die Gruppe (z. B. „test"), sonst kann der Bot die Chat-ID nicht ermitteln</li>
            </ol>
          </div>

          <div className="rounded-lg border p-4 space-y-2">
            <p className="font-semibold">3. Chat-ID eintragen & testen</p>
            <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
              <li>Branding unten auswählen</li>
              <li>Klick <strong>„Chat-ID automatisch erkennen"</strong> — das System zeigt alle Gruppen, in denen der Bot aktiv ist</li>
              <li>Wähle die richtige Gruppe — die Chat-ID wird automatisch eingetragen</li>
              <li>Klick <strong>„Test-Nachricht senden"</strong> — sollte sofort in der Gruppe ankommen</li>
              <li>Speichern nicht vergessen!</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Branding-Auswahl */}
      <Card>
        <CardHeader>
          <CardTitle>Branding-Konfiguration</CardTitle>
          <CardDescription>
            Pro Branding eigene Chat-Gruppe und Event-Auswahl.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Branding</Label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {brandings?.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    <div className="flex items-center gap-2">
                      {b.company_name}
                      {b.telegram_chat_id && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isConfigured && (
            <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div>
                Diese Branding versendet aktuell <strong>keine Telegram-Notifications</strong>. Bitte Chat-ID eintragen.
              </div>
            </div>
          )}

          <div>
            <Label>Chat-ID (Gruppen-ID)</Label>
            <div className="flex gap-2">
              <Input
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="-1001234567890"
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleDiscover}
                disabled={discovering}
              >
                {discovering ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="ml-2 hidden sm:inline">Chat-ID automatisch erkennen</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Gruppen-IDs starten typischerweise mit <code className="bg-muted px-1 rounded">-100…</code>
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t">
            <Label className="text-base">Welche Events sollen benachrichtigt werden?</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={notifyNew} onCheckedChange={(v) => setNotifyNew(!!v)} />
                <span>🆕 Neue Anfrage eingegangen</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={notifyMoechte} onCheckedChange={(v) => setNotifyMoechte(!!v)} />
                <span>📝 Status auf <strong>Möchte RG/KV</strong> gesetzt</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={notifyRgkvSent} onCheckedChange={(v) => setNotifyRgkvSent(!!v)} />
                <span>📤 Status auf <strong>RG/KV gesendet</strong> gesetzt</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={notifyAmtsgericht} onCheckedChange={(v) => setNotifyAmtsgericht(!!v)} />
                <span>⚖️ Status auf <strong>Amtsgericht Ready</strong> gesetzt</span>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Einstellungen speichern
            </Button>
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={testing || !chatId.trim()}
            >
              {testing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Test-Nachricht senden
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Beispiel-Vorschau */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Beispiel-Nachricht</CardTitle>
          <CardDescription>So sieht eine Notification in der Gruppe aus:</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl bg-muted/60 p-4 text-sm leading-relaxed whitespace-pre-wrap font-mono">
            {`🆕 Neue Anfrage

👤 Name: Max Mustermann
🏢 Firma: Mustermann GmbH
🎨 Branding: ${branding?.company_name || "Kanzlei XY"}
📞 Telefon: +49 176 12345678
💶 Nettopreis: 12.500,00 €`}
          </div>
        </CardContent>
      </Card>

      {/* Discover Modal */}
      <Dialog open={discoverOpen} onOpenChange={setDiscoverOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chats auswählen</DialogTitle>
            <DialogDescription>
              Diese Chats hat dein Bot in den letzten 24h gesehen. Klick einen
              an, um die Chat-ID zu übernehmen.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-auto">
            {chats.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                Keine Chats gefunden. Schick eine Nachricht in die Gruppe und versuch's nochmal.
              </p>
            )}
            {chats.map((chat) => {
              const name =
                chat.title ||
                [chat.first_name, chat.last_name].filter(Boolean).join(" ") ||
                chat.username ||
                String(chat.id);
              return (
                <button
                  key={String(chat.id)}
                  className="w-full text-left rounded-lg border p-3 hover:bg-muted/60 transition flex items-center justify-between gap-3"
                  onClick={() => {
                    setChatId(String(chat.id));
                    setDiscoverOpen(false);
                    toast({ title: `Chat-ID übernommen: ${chat.id}` });
                  }}
                >
                  <div>
                    <div className="font-medium">{name}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      ID: {chat.id}
                    </div>
                  </div>
                  <Badge variant="outline">{chat.type}</Badge>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
