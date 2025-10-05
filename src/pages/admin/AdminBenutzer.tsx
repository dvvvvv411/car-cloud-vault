import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function AdminBenutzer() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Benutzerverwaltung</h1>
        <p className="text-muted-foreground mt-1">Verwalten Sie Benutzer und Rollen</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Users className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground text-center">
            Benutzerverwaltung wird demnächst verfügbar sein.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
