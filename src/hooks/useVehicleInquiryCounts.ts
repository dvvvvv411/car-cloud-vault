import { useInquiries } from "./useInquiries";
import { useMemo } from "react";

export const useVehicleInquiryCounts = () => {
  const { data: inquiries, isLoading } = useInquiries();

  const inquiryCounts = useMemo(() => {
    if (!inquiries) return {};
    
    const counts: { [chassis: string]: number } = {};
    
    inquiries.forEach(inquiry => {
      if (Array.isArray(inquiry.selected_vehicles)) {
        inquiry.selected_vehicles.forEach(vehicle => {
          const chassis = vehicle.chassis;
          counts[chassis] = (counts[chassis] || 0) + 1;
        });
      }
    });
    
    return counts;
  }, [inquiries]);

  return { inquiryCounts, isLoading };
};
