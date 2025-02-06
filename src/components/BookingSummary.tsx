import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookingSummary } from "@/hooks/use-booking";
import { BookingList } from "./booking/BookingList";
import { formatToIDR } from "@/utils/currency";
import { Skeleton } from "@/components/ui/skeleton";

export function BookingSummary() {
  const { 
    summaryItems, 
    totalPrice, 
    totalWithProfit, 
    isStaff,
    isLoading,
    handleProfitUpdate,
    handleDeleteItem 
  } = useBookingSummary();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <>
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
          </>
        )}
      </CardContent>
    </Card>
  );
}