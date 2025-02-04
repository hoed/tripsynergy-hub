import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookingSummary } from "@/hooks/use-booking";
import { BookingList } from "./booking/BookingList";
import { formatToIDR } from "@/utils/currency";

export function BookingSummary() {
  const { 
    summaryItems, 
    totalPrice, 
    totalWithProfit, 
    isStaff, 
    handleProfitUpdate,
    handleDeleteItem 
  } = useBookingSummary();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <BookingList
          items={summaryItems}
          isStaff={isStaff}
          onProfitUpdate={handleProfitUpdate}
          onDeleteItem={handleDeleteItem}
          totalPrice={totalPrice}
        />
        {isStaff && (
          <div className="pt-2 text-primary">
            <div className="flex justify-between items-center">
              <p>Total with Profit</p>
              <p>{formatToIDR(totalWithProfit)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}