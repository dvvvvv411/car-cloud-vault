

## Plan: Admin-Passwortänderung für Benutzer

### Übersicht

Admins sollen das Passwort jedes Benutzers ändern können, ohne das alte Passwort zu kennen. Dafür brauchen wir:

1. Eine neue Edge Function die mit Admin-Rechten das Passwort ändert
2. Einen neuen Dialog für die Passwortänderung
3. Eine neue Spalte "Aktionen" in der Benutzertabelle mit einem Button

---

### Änderung 1: Neue Edge Function `update-user-password`

**Neue Datei:** `supabase/functions/update-user-password/index.ts`

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Prüfe ob Anfragender Admin ist
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) throw new Error('Unauthorized');

    // Prüfe Admin-Rolle
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) throw new Error('Insufficient permissions');

    // Hole Request-Body
    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword) {
      throw new Error('User ID and new password are required');
    }

    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Ändere Passwort mit Admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
```

---

### Änderung 2: Hook erweitern in `src/hooks/useUsers.ts`

Neue Mutation `useUpdateUserPassword` hinzufügen:

```typescript
export const useUpdateUserPassword = () => {
  return useMutation({
    mutationFn: async ({ 
      userId, 
      newPassword 
    }: { 
      userId: string; 
      newPassword: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('update-user-password', {
        body: { userId, newPassword },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Passwort geändert',
        description: 'Das Passwort wurde erfolgreich aktualisiert.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Fehler',
        description: error.message || 'Das Passwort konnte nicht geändert werden.',
        variant: 'destructive',
      });
    },
  });
};
```

---

### Änderung 3: Neuer Dialog `AdminChangePasswordDialog.tsx`

**Neue Datei:** `src/components/admin/AdminChangePasswordDialog.tsx`

```tsx
import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { useUpdateUserPassword } from "@/hooks/useUsers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { id: string; email: string } | null;
}

export function AdminChangePasswordDialog({ 
  open, 
  onOpenChange, 
  user 
}: AdminChangePasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { mutate: updatePassword, isPending } = useUpdateUserPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      // Toast-Fehler
      return;
    }
    
    if (!user) return;

    updatePassword(
      { userId: user.id, newPassword },
      {
        onSuccess: () => {
          setNewPassword("");
          setConfirmPassword("");
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Passwort ändern
          </DialogTitle>
          <DialogDescription>
            Neues Passwort für {user?.email} festlegen.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Neues Passwort</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label>Passwort bestätigen</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
              disabled={isPending}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Passwort ändern
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Änderung 4: Tabelle in `AdminBenutzer.tsx` erweitern

**Neue Spalte "Aktionen"** mit Passwort-Button:

```tsx
// Neue State-Variable
const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
const [selectedUser, setSelectedUser] = useState<User | null>(null);

// Neue Spalte in TableHeader
<TableHead>Aktionen</TableHead>

// Neue Zelle in TableRow
<TableCell>
  <Button
    variant="ghost"
    size="sm"
    onClick={() => {
      setSelectedUser(user);
      setPasswordDialogOpen(true);
    }}
  >
    <KeyRound className="h-4 w-4 mr-2" />
    Passwort
  </Button>
</TableCell>

// Dialog am Ende
<AdminChangePasswordDialog
  open={passwordDialogOpen}
  onOpenChange={setPasswordDialogOpen}
  user={selectedUser}
/>
```

---

### Ergebnis

| Vorher | Nachher |
|--------|---------|
| Keine Aktionen pro Benutzer | Button "Passwort" pro Zeile |
| Admin muss altes Passwort kennen | Admin kann direkt neues Passwort setzen |
| Nur eigenes Passwort änderbar | Jedes Benutzerpasswort änderbar |

### Sicherheit

- Edge Function prüft Admin-Rolle vor Passwortänderung
- Verwendet `supabaseAdmin.auth.admin.updateUserById()` mit Service Role Key
- Mindestlänge 6 Zeichen wird validiert

