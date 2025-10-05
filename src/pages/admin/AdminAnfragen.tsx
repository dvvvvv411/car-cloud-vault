import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function AdminAnfragen() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Anfragen</h1>
        <p className="text-muted-foreground mt-1">Verwalten Sie Kundenanfragen</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <MessageSquare className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground text-center">
            Anfragenverwaltung wird demnächst verfügbar sein.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
