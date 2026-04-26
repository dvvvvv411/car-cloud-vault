import { useEffect, useState } from "react";
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
  AlertCircle,
  Bot,
  KeyRound,
} from "lucide-react";

interface TelegramSettingsRow {
  id: number;
  chat_id: string | null;
  notify_new_inquiry: boolean;
  notify_moechte_rgkv: boolean;
  notify_rgkv_sent: boolean;
  notify_amtsgericht_ready: boolean;
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

  const { data: settings, isLoading } = useQuery({
    queryKey: ["telegram-settings"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("telegram_settings")
        .select(
          "id, chat_id, notify_new_inquiry, notify_moechte_rgkv, notify_rgkv_sent, notify_amtsgericht_ready"
        )
        .eq("id", 1)
        .single();
      if (error) throw error;
      return data as TelegramSettingsRow;
    },
  });

  useEffect(() => {
    if (settings) {
      setChatId(settings.chat_id || "");
      setNotifyNew(settings.notify_new_inquiry);
      setNotifyMoechte(settings.notify_moechte_rgkv);
      setNotifyRgkvSent(settings.notify_rgkv_sent);
      setNotifyAmtsgericht(settings.notify_amtsgericht_ready);
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("telegram_settings")
        .update({
          chat_id: chatId.trim() || null,
          notify_new_inquiry: notifyNew,
          notify_moechte_rgkv: notifyMoechte,
          notify_rgkv_sent: notifyRgkvSent,
          notify_amtsgericht_ready: notifyAmtsgericht,
        })
        .eq("id", 1);
      if (error) throw error;
      toast({ title: "Telegram-Einstellungen gespeichert" });
      qc.invalidateQueries({ queryKey: ["telegram-settings"] });
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
            text: `✅ <b>Test-Nachricht</b>\n\nDie globale Telegram-Integration funktioniert!`,
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

  const isConfigured = !!chatId.trim();

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
          Ein zentraler Bot, eine Gruppe — alle Notifications für alle Brandings.
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
            verwaltet.
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
          <CardDescription>So richtest du den Telegram-Bot ein:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="rounded-lg border p-4 space-y-2">
            <p className="font-semibold">1. Bot bei BotFather erstellen</p>
            <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
              <li>
                Öffne Telegram und suche nach{" "}
                <code className="bg-muted px-1 rounded">@BotFather</code>
              </li>
              <li>
                Sende <code className="bg-muted px-1 rounded">/newbot</code>
              </li>
              <li>Wähle einen Namen (z. B. „Kanzlei Notifications")</li>
              <li>
                Kopiere den Bot-Token und hinterlege ihn als Supabase Secret{" "}
                <code className="bg-muted px-1 rounded">TELEGRAM_BOT_TOKEN</code>
              </li>
            </ol>
          </div>

          <div className="rounded-lg border p-4 space-y-2">
            <p className="font-semibold">2. Bot in deine Gruppe einladen</p>
            <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
              <li>Erstelle (oder nutze) eine Telegram-Gruppe für die Notifications</li>
              <li>
                Tippe auf den Gruppennamen → <strong>Mitglieder hinzufügen</strong>{" "}
                → suche deinen Bot per Username → hinzufügen
              </li>
              <li>
                <strong>Wichtig:</strong> Sende mindestens{" "}
                <strong>eine Nachricht</strong> in die Gruppe (z. B. „test"), sonst
                kann der Bot die Chat-ID nicht ermitteln
              </li>
            </ol>
          </div>

          <div className="rounded-lg border p-4 space-y-2">
            <p className="font-semibold">3. Chat-ID eintragen & testen</p>
            <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
              <li>
                Klick <strong>„Chat-ID automatisch erkennen"</strong>
              </li>
              <li>Wähle die richtige Gruppe — die Chat-ID wird übernommen</li>
              <li>
                Klick <strong>„Test-Nachricht senden"</strong>
              </li>
              <li>Speichern nicht vergessen!</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Konfiguration */}
      <Card>
        <CardHeader>
          <CardTitle>Konfiguration</CardTitle>
          <CardDescription>
            Eine Chat-ID, eine Event-Auswahl — gilt für alle Brandings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConfigured && (
            <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div>
                Aktuell werden <strong>keine Telegram-Notifications</strong>{" "}
                versendet. Bitte Chat-ID eintragen.
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
                <span className="ml-2 hidden sm:inline">
                  Chat-ID automatisch erkennen
                </span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Gruppen-IDs starten typischerweise mit{" "}
              <code className="bg-muted px-1 rounded">-100…</code>
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t">
            <Label className="text-base">
              Welche Events sollen benachrichtigt werden?
            </Label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={notifyNew}
                  onCheckedChange={(v) => setNotifyNew(!!v)}
                />
                <span>🆕 Neue Anfrage eingegangen</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={notifyMoechte}
                  onCheckedChange={(v) => setNotifyMoechte(!!v)}
                />
                <span>
                  📝 Status auf <strong>Möchte RG/KV</strong> gesetzt
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={notifyRgkvSent}
                  onCheckedChange={(v) => setNotifyRgkvSent(!!v)}
                />
                <span>
                  📤 Status auf <strong>RG/KV gesendet</strong> gesetzt
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={notifyAmtsgericht}
                  onCheckedChange={(v) => setNotifyAmtsgericht(!!v)}
                />
                <span>
                  ⚖️ Status auf <strong>Amtsgericht Ready</strong> gesetzt
                </span>
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
          <CardDescription>
            So sieht eine Notification in der Gruppe aus:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl bg-muted/60 p-4 text-sm leading-relaxed whitespace-pre-wrap font-mono">
            {`🆕 Neue Anfrage

👤 Name: Max Mustermann
🏢 Firma: Mustermann GmbH
🎨 Branding: Kanzlei XY
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
                Keine Chats gefunden. Schick eine Nachricht in die Gruppe und
                versuch's nochmal.
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
