import React from "react";
import { X } from "lucide-react";
import { Vehicle } from "@/hooks/useVehicles";
import demoVehicle from "@/assets/demo-vehicle.png";

interface VehicleInquiryCardProps {
  vehicle: Vehicle;
  onRemove: (chassis: string) => void;
}

export const VehicleInquiryCard: React.FC<VehicleInquiryCardProps> = ({
  vehicle,
  onRemove,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 hover:bg-white/15 transition-all animate-fade-in">
      <button
        onClick={() => onRemove(vehicle.chassis)}
        className="absolute top-2 right-2 p-1 rounded-full bg-destructive/80 hover:bg-destructive text-white transition-colors"
        aria-label="Fahrzeug entfernen"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex gap-4">
        <div className="w-24 h-24 flex-shrink-0 bg-white/5 rounded-md overflow-hidden">
          <img
            src={vehicle.image_url || demoVehicle}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="text-sm text-muted-foreground">
            FG-Nr.: {vehicle.chassis}
          </p>
          <p className="text-lg font-bold text-primary mt-2">
            {formatPrice(vehicle.price)}
          </p>
        </div>
      </div>
    </div>
  );
};
