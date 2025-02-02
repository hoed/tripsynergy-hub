import { BookingItem } from "./BookingItem";

interface BookingListProps {
  items: Array<{
    name: string;
    price: number;
    type: string;
    bookingId?: string;
    profitPercentage?: number;
  }>;
  isStaff: boolean;
  onProfitUpdate: (bookingId: string, newProfit: number) => void;
}

export function BookingList({ items, isStaff, onProfitUpdate }: BookingListProps) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <BookingItem
          key={index}
          item={item}
          isStaff={isStaff}
          onProfitUpdate={onProfitUpdate}
        />
      ))}
    </div>
  );
}