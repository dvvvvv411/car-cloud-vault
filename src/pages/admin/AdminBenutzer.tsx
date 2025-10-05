import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function AdminBenutzer() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Benutzerverwaltung</h1>
        <p className="text-muted-foreground mt-2 text-base">Verwalten Sie Benutzer und Rollen</p>
      </div>

      <Card className="modern-card">
        <CardContent className="flex flex-col items-center justify-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/30 mb-4">
            <Users className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <p className="text-base font-medium text-foreground mb-1">Benutzerverwaltung</p>
          <p className="text-sm text-muted-foreground text-center">
            Diese Funktion wird demnächst verfügbar sein
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
