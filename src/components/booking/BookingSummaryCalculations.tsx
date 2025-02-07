import { useState, useEffect } from "react";
import { formatToIDR } from "@/utils/currency";
import { Input } from "@/components/ui/input";
import { ProfitCalculations } from "./ProfitCalculations";

interface BookingSummaryCalculationsProps {
  totalPrice: number;
  isStaff: boolean;
  currentProfit: number;
  numberOfPersons: number;
  onProfitChange: (value: number) => void;
  onPersonsChange: (value: number) => void;
  calculatedTotal: number;
}

export function BookingSummaryCalculations({
  totalPrice,
  isStaff,
  currentProfit,
  numberOfPersons,
  onProfitChange,
  onPersonsChange,
  calculatedTotal,
}: BookingSummaryCalculationsProps) {
  const [pricePerPax, setPricePerPax] = useState<number>(0);

  useEffect(() => {
    if (numberOfPersons > 0) {
      setPricePerPax(totalPrice / numberOfPersons);
    }
  }, [totalPrice, numberOfPersons]);

  return (
    <div className="pt-4 border-t space-y-2">
      <div className="flex justify-between items-center">
        <p className="font-semibold">Subtotal</p>
        <p className="font-semibold">{formatToIDR(totalPrice)}</p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Number of Persons:</span>
        <Input
          type="number"
          min="1"
          value={numberOfPersons}
          className="w-24"
          onChange={(e) => {
            const value = parseInt(e.target.value);
            if (!isNaN(value) && value > 0) {
              onPersonsChange(value);
            }
          }}
        />
      </div>

      <ProfitCalculations
        isStaff={isStaff}
        currentProfit={currentProfit}
        pricePerPax={pricePerPax}
        onProfitChange={onProfitChange}
        totalWithProfit={calculatedTotal}
      />
    </div>
  );
}