import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Percent, Save, X } from "lucide-react";
import { useUpdateInquiryDiscount } from "@/hooks/useInquiryDiscount";
import { toast } from "sonner";

interface DiscountButtonProps {
  inquiryId: string;
  currentDiscount?: number | null;
}

export const DiscountButton = ({ 
  inquiryId, 
  currentDiscount
}: DiscountButtonProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(
    currentDiscount?.toString() || ""
  );
  
  const updateDiscount = useUpdateInquiryDiscount();

  const handleSave = () => {
    const percentage = parseFloat(discountPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      toast.error("Bitte geben Sie einen gültigen Prozentsatz zwischen 0 und 100 ein");
      return;
    }

    updateDiscount.mutate(
      { 
        inquiryId, 
        discountPercentage: percentage
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleCancel = () => {
    setDiscountPercentage(currentDiscount?.toString() || "");
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <Button
        onClick={() => setIsEditing(true)}
        variant={currentDiscount ? "default" : "outline"}
        size="sm"
        className={`gap-2 ${!currentDiscount ? 'border-primary text-primary hover:bg-primary hover:text-primary-foreground' : ''}`}
      >
        <Percent className="h-4 w-4" />
        {currentDiscount 
          ? `Rabatt: ${currentDiscount}%`
          : "Rabatt?"
        }
      </Button>
    );
  }

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
      <div className="space-y-2">
        <Label htmlFor="discount-percentage">Rabatt in Prozent</Label>
        <div className="flex items-center gap-2">
          <Input
            id="discount-percentage"
            type="number"
            step="0.1"
            min="0"
            max="100"
            placeholder="z.B. 10"
            value={discountPercentage}
            onChange={(e) => setDiscountPercentage(e.target.value)}
            className="max-w-[120px]"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={updateDiscount.isPending || !discountPercentage}
          size="sm"
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Speichern
        </Button>
        <Button
          onClick={handleCancel}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Abbrechen
        </Button>
      </div>
    </div>
  );
};
