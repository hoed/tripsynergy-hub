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
    <div className="flex flex-col space-y-2">
      <p className="font-semibold">{item.name}</p>
      <p>Type: {item.type}</p>
      <p>Price: {item.price}</p>
      <p>Start Date: {item.startDate}</p>
      <p>End Date: {item.endDate}</p>
    </div>
  );
}