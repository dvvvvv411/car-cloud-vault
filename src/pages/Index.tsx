import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Fahrzeugbestand
          </h1>
          <p className="text-muted-foreground">
            Verwalten und durchsuchen Sie Ihren Fahrzeugbestand
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Suche nach Marke, Modell oder Fahrgestell-Nr..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-input"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-foreground">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("brand")}
                      className="hover:bg-transparent p-0 h-auto font-medium"
                    >
                      Marke
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-foreground">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("model")}
                      className="hover:bg-transparent p-0 h-auto font-medium"
                    >
                      Modell
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-foreground">
                    Fahrgestell-Nr.
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-foreground">
                    DEKRA / Bericht-Nr.
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-foreground">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("firstRegistration")}
                      className="hover:bg-transparent p-0 h-auto font-medium"
                    >
                      Erstzulassung
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-foreground">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("kilometers")}
                      className="hover:bg-transparent p-0 h-auto font-medium"
                    >
                      Kilometer
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-foreground">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("price")}
                      className="hover:bg-transparent p-0 h-auto font-medium"
                    >
                      Einzelpreis
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAndSortedVehicles.map((vehicle, index) => (
                  <tr
                    key={index}
                    className="hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {vehicle.brand}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {vehicle.model}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                      {vehicle.chassis}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {vehicle.reportNr}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {vehicle.firstRegistration}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground text-right">
                      {formatKilometers(vehicle.kilometers)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground text-right">
                      {formatPrice(vehicle.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-border bg-muted/30">
            <p className="text-sm text-muted-foreground">
              {filteredAndSortedVehicles.length} von {vehicles.length}{" "}
              Fahrzeugen angezeigt
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
