import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown, Gauge, Calendar, FileText, Euro } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import kbsLogo from "@/assets/kbs_blue.png";
import demoVehicle from "@/assets/demo-vehicle.png";

interface Vehicle {
  brand: string;
  model: string;
  chassis: string;
  reportNr: string;
  firstRegistration: string;
  kilometers: number;
  price: number;
}

const vehicles: Vehicle[] = [
  {
    brand: "BMW",
    model: "X5 M Competition",
    chassis: "WBSJU010709K42232",
    reportNr: "0993",
    firstRegistration: "01/22",
    kilometers: 79935,
    price: 41230.00,
  },
  {
    brand: "Volkswagen",
    model: "T6 2.0 TDI Kombi lang (50)",
    chassis: "WV2ZZZ7HZHH140678",
    reportNr: "1135",
    firstRegistration: "04/17",
    kilometers: 115621,
    price: 5009.90,
  },
  {
    brand: "Volkswagen",
    model: "T6.1 2.0 TDI Kombi L1H1 FWD",
    chassis: "WV2ZZZ7HZLX010470",
    reportNr: "2519",
    firstRegistration: "03/20",
    kilometers: 82751,
    price: 10311.00,
  },
  {
    brand: "Volkswagen",
    model: "T6 2.0 TSI Kasten",
    chassis: "WV1ZZZ7HZKH038702",
    reportNr: "3367",
    firstRegistration: "11/18",
    kilometers: 85461,
    price: 8654.80,
  },
  {
    brand: "Volkswagen",
    model: "T6.1 2.0 TDI Kombi L1H1 FWD",
    chassis: "WV2ZZZ7HZLX009005",
    reportNr: "3864",
    firstRegistration: "02/20",
    kilometers: 84613,
    price: 10066.70,
  },
];

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Vehicle | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  const handleSort = (key: keyof Vehicle) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredAndSortedVehicles = vehicles
    .filter(
      (vehicle) =>
        vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.chassis.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const formatKilometers = (km: number) => {
    return new Intl.NumberFormat("de-DE").format(km);
  };


  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-8 py-12">
        {/* Modern Header with Logo */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center gap-6 mb-6">
            <img 
              src={kbsLogo} 
              alt="KBS Kanzlei Logo" 
              className="h-16 w-auto"
            />
            <div className="h-12 w-px bg-[hsl(var(--divider))]"></div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-4xl font-light tracking-tight" style={{ color: "hsl(var(--text-primary))" }}>
                  Fahrzeugbestand
                </h1>
                <Badge variant="secondary" className="text-base px-4 py-1.5">
                  {vehicles.length} Fahrzeuge
                </Badge>
              </div>
              <p className="text-lg" style={{ color: "hsl(var(--text-secondary))" }}>
                Verwalten und durchsuchen Sie Ihren Fahrzeugbestand
              </p>
            </div>
          </div>
        </div>

        {/* Glassmorphism Search Bar */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="glassmorphism rounded-2xl p-4 shadow-sm">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: "hsl(var(--text-tertiary))" }} />
              <Input
                placeholder="Suche nach Marke, Modell oder Fahrgestell-Nr..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Modern Table */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: "hsl(var(--divider))" }}>
                  <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-wider" style={{ color: "hsl(var(--text-tertiary))" }}>
                    Fahrzeug
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-wider" style={{ color: "hsl(var(--text-tertiary))" }}>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("model")}
                      className="hover:bg-transparent p-0 h-auto font-medium -ml-2"
                      style={{ color: "hsl(var(--text-tertiary))" }}
                    >
                      Modell
                      <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-wider" style={{ color: "hsl(var(--text-tertiary))" }}>
                    Fahrgestell-Nr.
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-wider" style={{ color: "hsl(var(--text-tertiary))" }}>
                    Bericht-Nr.
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-wider" style={{ color: "hsl(var(--text-tertiary))" }}>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("firstRegistration")}
                      className="hover:bg-transparent p-0 h-auto font-medium -ml-2"
                      style={{ color: "hsl(var(--text-tertiary))" }}
                    >
                      Erstzulassung
                      <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-medium uppercase tracking-wider" style={{ color: "hsl(var(--text-tertiary))" }}>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("kilometers")}
                      className="hover:bg-transparent p-0 h-auto font-medium -mr-2 ml-auto"
                      style={{ color: "hsl(var(--text-tertiary))" }}
                    >
                      Kilometer
                      <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-medium uppercase tracking-wider" style={{ color: "hsl(var(--text-tertiary))" }}>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("price")}
                      className="hover:bg-transparent p-0 h-auto font-medium -mr-2 ml-auto"
                      style={{ color: "hsl(var(--text-tertiary))" }}
                    >
                      Einzelpreis
                      <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedVehicles.map((vehicle, index) => {
                  return (
                    <tr
                      key={index}
                      className="border-b hover-lift cursor-pointer group"
                      style={{ 
                        borderColor: "hsl(var(--divider))",
                        animationDelay: `${0.3 + index * 0.05}s`
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="w-24 h-16 rounded-lg overflow-hidden bg-muted">
                          <img 
                            src={demoVehicle} 
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div>
                          <div className="font-medium text-sm" style={{ color: "hsl(var(--text-primary))" }}>
                            {vehicle.brand}
                          </div>
                          <div className="text-sm mt-0.5" style={{ color: "hsl(var(--text-secondary))" }}>
                            {vehicle.model}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-mono" style={{ color: "hsl(var(--text-secondary))" }}>
                          {vehicle.chassis}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm" style={{ color: "hsl(var(--text-secondary))" }}>
                          {vehicle.reportNr}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm" style={{ color: "hsl(var(--text-secondary))" }}>
                          {vehicle.firstRegistration}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-sm font-medium" style={{ color: "hsl(var(--text-primary))" }}>
                          {formatKilometers(vehicle.kilometers)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-base font-semibold" style={{ color: "hsl(var(--text-primary))" }}>
                          {formatPrice(vehicle.price)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Results Footer */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>
              {filteredAndSortedVehicles.length} von {vehicles.length} Fahrzeugen angezeigt
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
