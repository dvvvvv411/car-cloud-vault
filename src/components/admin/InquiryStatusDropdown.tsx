import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateInquiryStatus } from "@/hooks/useInquiryNotes";
import { InquiryStatus } from "@/hooks/useInquiries";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface InquiryStatusDropdownProps {
  inquiryId: string;
  currentStatus: InquiryStatus;
  statusUpdatedAt?: string;
}

const STATUS_OPTIONS: InquiryStatus[] = [
  "Neu",
  "Möchte RG/KV",
  "RG/KV gesendet",
  "Bezahlt",
  "Exchanged"
];

export const InquiryStatusDropdown = ({ inquiryId, currentStatus, statusUpdatedAt }: InquiryStatusDropdownProps) => {
  const updateStatus = useUpdateInquiryStatus();

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate({ inquiryId, status: newStatus as InquiryStatus });
  };

  return (
    <div className="flex flex-col gap-1">
      <Select value={currentStatus} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[160px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((status) => (
            <SelectItem key={status} value={status} className="text-xs">
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
