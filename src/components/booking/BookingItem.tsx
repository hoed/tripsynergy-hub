import { SummaryItem } from "../SummaryItem";
import { format } from "date-fns";

interface BookingItemProps {
  item: {
    name: string;
    price: number;
    type: string;
    startDate: string;
    endDate: string;
  };
}

export function BookingItem({ item }: BookingItemProps) {
  return (
    <div className="flex flex-col">
      <p className="font-semibold">{item.name}</p>
      <p>{item.type}</p>
      <p>{item.startDate} - {item.endDate}</p>
      <p>{item.price}</p>
    </div>
  );
}