import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateInquiryStatus } from "@/hooks/useInquiryNotes";
import { InquiryStatus } from "@/hooks/useInquiries";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface InquiryStatusDropdownProps {
  inquiryId: string;
  currentStatus: InquiryStatus;
  statusUpdatedAt?: string;
}

const STATUS_OPTIONS: InquiryStatus[] = [
  "Neu",
  "Möchte RG/KV",
  "Amtsgericht",
  "RG/KV gesendet",
  "Bezahlt",
  "Exchanged",
  "Kein Interesse"
];

const getStatusColor = (status: InquiryStatus) => {
  switch (status) {
    case "Neu":
      return "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200";
    case "Möchte RG/KV":
      return "bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200";
    case "Amtsgericht":
      return "bg-lime-100 text-lime-800 border-lime-300 hover:bg-lime-200";
    case "RG/KV gesendet":
      return "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200";
    case "Bezahlt":
      return "bg-green-100 text-green-800 border-green-300 hover:bg-green-200";
    case "Exchanged":
      return "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200";
    case "Kein Interesse":
      return "bg-red-100 text-red-800 border-red-300 hover:bg-red-200";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export const InquiryStatusDropdown = ({ inquiryId, currentStatus, statusUpdatedAt }: InquiryStatusDropdownProps) => {
  const updateStatus = useUpdateInquiryStatus();

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate({ inquiryId, status: newStatus as InquiryStatus });
  };

  return (
    <div className="flex flex-col gap-1">
      <Select value={currentStatus} onValueChange={handleStatusChange}>
        <SelectTrigger className={cn("w-[180px] h-8 text-xs font-medium transition-colors", getStatusColor(currentStatus))}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((status) => (
            <SelectItem 
              key={status} 
              value={status} 
              className={cn("text-xs font-medium transition-colors", getStatusColor(status))}
            >
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {statusUpdatedAt && (
        <span className="text-[10px] text-muted-foreground">
          {format(new Date(statusUpdatedAt), "dd.MM.yy HH:mm", { locale: de })}
        </span>
      )}
    </div>
  );
};
