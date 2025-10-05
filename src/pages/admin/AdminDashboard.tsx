import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, MessageSquare, Users, Building2, TrendingUp, Clock, Package } from "lucide-react";
import { useVehicles } from "@/hooks/useVehicles";
import { useInquiries } from "@/hooks/useInquiries";
import { useLeadCampaigns } from "@/hooks/useLeads";
import { useBrandings } from "@/hooks/useBranding";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useMemo } from "react";
import { format, subDays, startOfDay } from "date-fns";
import { de } from "date-fns/locale";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--muted))'];

export default function AdminDashboard() {
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { data: inquiries, isLoading: inquiriesLoading } = useInquiries();
  const { data: leadCampaigns, isLoading: leadsLoading } = useLeadCampaigns();
  const { data: brandings, isLoading: brandingsLoading } = useBrandings();

  // Calculate statistics
  const stats = useMemo(() => {
    const avgPrice = vehicles?.length ? vehicles.reduce((acc, v) => acc + Number(v.price), 0) / vehicles.length : 0;
    const totalLeads = leadCampaigns?.reduce((acc, lc) => acc + (lc.total_leads || 0), 0) || 0;
    const loggedInLeads = leadCampaigns?.reduce((acc, lc) => acc + (lc.logged_in_count || 0), 0) || 0;
    const conversionRate = totalLeads > 0 ? (loggedInLeads / totalLeads) * 100 : 0;
    const activeBrandings = brandings?.filter(b => b.is_active).length || 0;

    return {
      totalVehicles: vehicles?.length || 0,
      avgPrice,
      totalInquiries: inquiries?.length || 0,
      newInquiries: inquiries?.filter(i => i.status === 'Neu').length || 0,
      totalLeads,
      loggedInLeads,
      conversionRate,
      activeBrandings,
    };
  }, [vehicles, inquiries, leadCampaigns, brandings]);

  // Status distribution
  const statusData = useMemo(() => {
    if (!inquiries) return [];
    const statusCount: Record<string, number> = {};
    inquiries.forEach(inq => {
      statusCount[inq.status] = (statusCount[inq.status] || 0) + 1;
    });
    return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
  }, [inquiries]);

  // Timeline data (last 30 days)
  const timelineData = useMemo(() => {
    if (!inquiries) return [];
    const days = 30;
    const dataMap = new Map<string, number>();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = format(startOfDay(subDays(new Date(), i)), 'dd.MM', { locale: de });
      dataMap.set(date, 0);
    }

    inquiries.forEach(inq => {
      const date = format(startOfDay(new Date(inq.created_at)), 'dd.MM', { locale: de });
      if (dataMap.has(date)) {
        dataMap.set(date, dataMap.get(date)! + 1);
      }
    });

    return Array.from(dataMap.entries()).map(([date, count]) => ({ date, count }));
  }, [inquiries]);

  // Lead campaign performance
  const campaignData = useMemo(() => {
    if (!leadCampaigns) return [];
    return leadCampaigns.slice(0, 5).map(lc => ({
      name: lc.campaign_name.substring(0, 20),
      gesamt: lc.total_leads || 0,
      eingeloggt: lc.logged_in_count || 0,
      anfragen: lc.inquiry_count || 0,
    }));
  }, [leadCampaigns]);

  // Recent inquiries
  const recentInquiries = useMemo(() => {
    if (!inquiries) return [];
    return inquiries
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [inquiries]);

  // Top vehicles
  const topVehicles = useMemo(() => {
    if (!inquiries || !vehicles) return [];
    const vehicleCount = new Map<string, { vehicle: any; count: number }>();
    
    inquiries.forEach(inq => {
      const selectedVehicles = inq.selected_vehicles as any[];
      selectedVehicles.forEach(sv => {
        const key = sv.chassis;
        const existing = vehicleCount.get(key);
        if (existing) {
          existing.count++;
        } else {
          const vehicle = vehicles.find(v => v.chassis === sv.chassis);
          if (vehicle) {
            vehicleCount.set(key, { vehicle, count: 1 });
          }
        }
      });
    });

    return Array.from(vehicleCount.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [inquiries, vehicles]);

  const isLoading = vehiclesLoading || inquiriesLoading || leadsLoading || brandingsLoading;

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-base">Übersicht über Ihre wichtigsten Kennzahlen</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card group border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Fahrzeuge
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
              <Car className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            {isLoading ? (
              <Skeleton className="h-12 w-20 rounded-lg" />
            ) : (
              <>
                <div className="text-4xl font-bold text-foreground tracking-tight">{stats.totalVehicles}</div>
                <p className="text-xs text-muted-foreground mt-2">Ø {stats.avgPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="stat-card group border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Anfragen
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-chart-2/10 text-chart-2 group-hover:bg-chart-2/20 transition-all duration-300 group-hover:scale-110">
              <MessageSquare className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            {isLoading ? (
              <Skeleton className="h-12 w-20 rounded-lg" />
            ) : (
              <>
                <div className="text-4xl font-bold text-foreground tracking-tight">{stats.totalInquiries}</div>
                <p className="text-xs text-muted-foreground mt-2">{stats.newInquiries} neu</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="stat-card group border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Leads
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-chart-3/10 text-chart-3 group-hover:bg-chart-3/20 transition-all duration-300 group-hover:scale-110">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            {isLoading ? (
              <Skeleton className="h-12 w-20 rounded-lg" />
            ) : (
              <>
                <div className="text-4xl font-bold text-foreground tracking-tight">{stats.totalLeads}</div>
                <p className="text-xs text-muted-foreground mt-2">{stats.conversionRate.toFixed(1)}% eingeloggt</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="stat-card group border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Brandings
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-chart-4/10 text-chart-4 group-hover:bg-chart-4/20 transition-all duration-300 group-hover:scale-110">
              <Building2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            {isLoading ? (
              <Skeleton className="h-12 w-20 rounded-lg" />
            ) : (
              <>
                <div className="text-4xl font-bold text-foreground tracking-tight">{stats.activeBrandings}</div>
                <p className="text-xs text-muted-foreground mt-2">Aktive Mandanten</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Anfragen nach Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full rounded-lg" />
            ) : statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Keine Daten verfügbar
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lead Performance */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Lead-Kampagnen Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full rounded-lg" />
            ) : campaignData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={campaignData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="gesamt" fill="hsl(var(--chart-1))" name="Gesamt" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="eingeloggt" fill="hsl(var(--chart-2))" name="Eingeloggt" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="anfragen" fill="hsl(var(--chart-3))" name="Anfragen" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Keine Kampagnen vorhanden
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline Chart */}
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Anfragen der letzten 30 Tage
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[250px] w-full rounded-lg" />
          ) : timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                  fontSize={11}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorCount)"
                  strokeWidth={2}
                  name="Anfragen"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Keine Daten verfügbar
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Row: Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Inquiries */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-chart-2" />
              Neueste Anfragen
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
              </div>
            ) : recentInquiries.length > 0 ? (
              <div className="space-y-3">
                {recentInquiries.map(inq => (
                  <div key={inq.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors bg-card/50">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{inq.first_name} {inq.last_name}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(inq.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-foreground">{Number(inq.total_price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</p>
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
                        {inq.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                Keine Anfragen vorhanden
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Vehicles */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-chart-3" />
              Meistgefragte Fahrzeuge
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
              </div>
            ) : topVehicles.length > 0 ? (
              <div className="space-y-3">
                {topVehicles.map(({ vehicle, count }) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors bg-card/50">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{vehicle.brand} {vehicle.model}</p>
                      <p className="text-xs text-muted-foreground">Chassis: {vehicle.chassis}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">{count}</span>
                        <span className="text-xs text-muted-foreground">Anfragen</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                Keine Daten verfügbar
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
