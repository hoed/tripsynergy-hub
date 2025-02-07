import { SummaryItem } from "../SummaryItem";
import { format } from "date-fns";

interface BookingItemProps {
  item: {
    name: string;
    price: number;
    type: string;
    bookingId?: string;
    profitPercentage?: number;
    startDate: string;
    endDate: string;
  };
}

export function BookingItem({ item }: BookingItemProps) {
  return (
    <div className="space-y-2 flex-1">
      <div className="flex justify-between items-center gap-4">
        <SummaryItem {...item} />
      </div>
      <div className="text-sm text-muted-foreground">
        {format(new Date(item.startDate), 'MMM dd, yyyy')} - {format(new Date(item.endDate), 'MMM dd, yyyy')}
      </div>
    </div>
  );
}