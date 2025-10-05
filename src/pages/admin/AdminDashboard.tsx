import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, MessageSquare, Users } from "lucide-react";
import { useVehicles } from "@/hooks/useVehicles";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data: vehicles, isLoading } = useVehicles();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-base">Übersicht über Ihr Admin-Panel</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="stat-card group border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Fahrzeuge gesamt
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
              <Car className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            {isLoading ? (
              <Skeleton className="h-12 w-20 rounded-lg" />
            ) : (
              <div className="text-4xl font-bold text-foreground tracking-tight">{vehicles?.length || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-2">Insgesamt verfügbar</p>
          </CardContent>
        </Card>

        <Card className="stat-card group border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Neue Anfragen
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
              <MessageSquare className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-4xl font-bold text-foreground tracking-tight">0</div>
            <p className="text-xs text-muted-foreground mt-2">Ausstehend</p>
          </CardContent>
        </Card>

        <Card className="stat-card group border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Aktive Benutzer
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-4xl font-bold text-foreground tracking-tight">0</div>
            <p className="text-xs text-muted-foreground mt-2">Registriert</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
