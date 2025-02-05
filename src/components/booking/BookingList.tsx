import { BookingItem } from "./BookingItem";
import { Input } from "@/components/ui/input";
import { formatToIDR } from "@/utils/currency";
import { Button } from "@/components/ui/button";
import { Trash2, Calculator } from "lucide-react";
import { useState, useEffect } from "react";

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

export function BookingList({ items, isStaff, onProfitUpdate, onDeleteItem, totalPrice }: BookingListProps) {
  const [currentProfit, setCurrentProfit] = useState<number>(items[0]?.profitPercentage || 0);
  const [calculatedTotal, setCalculatedTotal] = useState<number>(totalPrice);

  useEffect(() => {
    // Update calculated total whenever items or totalPrice changes
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

  const handleCalculate = () => {
    if (items[0]?.bookingId) {
      const profitAmount = totalPrice * (currentProfit / 100);
      setCalculatedTotal(totalPrice + profitAmount);
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-start justify-between gap-4">
          <BookingItem item={item} />
          {isStaff && item.bookingId && (
            <Button
              variant="destructive"
              size="icon"
              onClick={() => {
                if (item.bookingId) {
                  onDeleteItem(item.bookingId);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <div className="pt-4 border-t space-y-2">
        <div className="flex justify-between items-center">
          <p className="font-semibold">Subtotal</p>
          <p className="font-semibold">{formatToIDR(totalPrice)}</p>
        </div>
        {isStaff && items.length > 0 && items[0].bookingId && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Profit Percentage:</span>
              <Input
                type="number"
                min="0"
                max="100"
                value={currentProfit}
                className="w-24"
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    handleProfitChange(value);
                  }
                }}
              />
              <span className="text-sm text-muted-foreground">%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCalculate}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calculate
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <p className="font-semibold">Total with Profit</p>
              <p className="font-semibold">{formatToIDR(calculatedTotal)}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}