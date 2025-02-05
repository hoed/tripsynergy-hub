import { formatToIDR } from "@/utils/currency";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

interface BookingSummaryCalculationsProps {
  totalPrice: number;
  isStaff: boolean;
  currentProfit: number;
  numberOfPersons: number;
  onProfitChange: (value: number) => void;
  onPersonsChange: (value: number) => void;
  onCalculate: () => void;
  calculatedTotal: number;
}

export function BookingSummaryCalculations({
  totalPrice,
  isStaff,
  currentProfit,
  numberOfPersons,
  onProfitChange,
  onPersonsChange,
  onCalculate,
  calculatedTotal,
}: BookingSummaryCalculationsProps) {
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

      {isStaff && (
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
                onProfitChange(value);
              }
            }}
          />
          <span className="text-sm text-muted-foreground">%</span>
          <Button variant="outline" size="sm" onClick={onCalculate}>
            <Calculator className="h-4 w-4 mr-2" />
            Calculate
          </Button>
        </div>
      )}
      {isStaff && (
        <div className="flex justify-between items-center">
          <p className="font-semibold">Profit</p>
          <p className="font-semibold">{formatToIDR(calculatedTotal)}</p>
        </div>
      )}

      {isStaff && (
        <div className="flex justify-between items-center">
          <p className="font-semibold">Total Price</p>
          <p className="font-semibold">{formatToIDR(calculatedTotal)}</p>
        </div>
      )}
      {isStaff && (
        <div className="flex justify-between items-center">
          <p className="font-semibold">Price per pax</p>
          <p className="font-semibold">{formatToIDR(calculatedTotal)}</p>
        </div>
      )}
    </div>
  );
}
