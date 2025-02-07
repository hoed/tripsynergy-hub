import { useState, useEffect } from "react";
import { BookingItem } from "./BookingItem";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { BookingSummaryCalculations } from "./BookingSummaryCalculations";
import { supabase } from "@/integrations/supabase/client";

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
  onDeleteItem: (bookingId: string) => void;
  totalPrice: number;
}

export function BookingList({ 
  items, 
  isStaff, 
  onProfitUpdate, 
  onDeleteItem, 
  totalPrice 
}: BookingListProps) {
  const [currentProfit, setCurrentProfit] = useState<number>(items[0]?.profitPercentage || 0);
  const [calculatedTotal, setCalculatedTotal] = useState<number>(totalPrice);
  const [numberOfPersons, setNumberOfPersons] = useState<number>(1);

  useEffect(() => {
    if (items[0]?.profitPercentage) {
      const profitAmount = totalPrice * (items[0].profitPercentage / 100);
      setCalculatedTotal(totalPrice + profitAmount);
      setCurrentProfit(items[0].profitPercentage);
    } else {
      setCalculatedTotal(totalPrice);
      setCurrentProfit(0);
    }
  }, [items, totalPrice]);

  const handleProfitChange = (value: number) => {
    setCurrentProfit(value);
    if (items[0]?.bookingId) {
      onProfitUpdate(items[0].bookingId, value);
      const profitAmount = totalPrice * (value / 100);
      setCalculatedTotal(totalPrice + profitAmount);
    }
  };

  const handleDelete = async (bookingId: string) => {
    // Delete the item from Supabase database
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (error) {
      console.error("Error deleting booking:", error);
      return;
    }

    // Call the onDeleteItem function to update the state in the parent component
    onDeleteItem(bookingId);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-start justify-between gap-4">
          <BookingItem item={item} />
          {item.bookingId && (
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDelete(item.bookingId!)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      
      <BookingSummaryCalculations
        totalPrice={totalPrice}
        isStaff={isStaff}
        currentProfit={currentProfit}
        numberOfPersons={numberOfPersons}
        onProfitChange={handleProfitChange}
        onPersonsChange={setNumberOfPersons}
        calculatedTotal={calculatedTotal}
      />
    </div>
  );
}