import { BookingItem } from "./BookingItem";
import { Input } from "@/components/ui/input";
import { formatToIDR } from "@/utils/currency";

interface BookingListProps {
  items: Array<{
    name: string;
    price: number;
    type: string;
    bookingId?: string;
    profitPercentage?: number;
    startDate: string;
    endDate: string;
  }>;
  isStaff: boolean;
  onProfitUpdate: (bookingId: string, newProfit: number) => void;
  totalPrice: number;
}

export function BookingList({ items, isStaff, onProfitUpdate, totalPrice }: BookingListProps) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <BookingItem
          key={index}
          item={item}
        />
      ))}
      <div className="pt-4 border-t space-y-2">
        <div className="flex justify-between items-center">
          <p className="font-semibold">Subtotal</p>
          <p className="font-semibold">{formatToIDR(totalPrice)}</p>
        </div>
        {isStaff && items.length > 0 && items[0].bookingId && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Profit Percentage:</span>
            <Input
              type="number"
              min="0"
              max="100"
              defaultValue={items[0].profitPercentage || 0}
              className="w-24"
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                  onProfitUpdate(items[0].bookingId!, value);
                }
              }}
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        )}
      </div>
    </div>
  );
}