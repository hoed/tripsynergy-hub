import { SummaryItem } from "../SummaryItem";
import { Input } from "@/components/ui/input";

interface BookingItemProps {
  item: {
    name: string;
    price: number;
    type: string;
    bookingId?: string;
    profitPercentage?: number;
  };
  isStaff: boolean;
  onProfitUpdate: (bookingId: string, newProfit: number) => void;
}

export function BookingItem({ item, isStaff, onProfitUpdate }: BookingItemProps) {
  return (
    <div className="flex justify-between items-center gap-4">
      <SummaryItem {...item} />
      {isStaff && item.bookingId && (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            max="100"
            defaultValue={item.profitPercentage || 0}
            className="w-24"
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              if (!isNaN(value)) {
                onProfitUpdate(item.bookingId!, value);
              }
            }}
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      )}
    </div>
  );
}