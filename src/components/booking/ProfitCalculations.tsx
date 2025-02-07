import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { formatToIDR } from "@/utils/currency";

interface ProfitCalculationsProps {
  isStaff: boolean;
  currentProfit: number;
  pricePerPax: number;
  onProfitChange: (value: number) => void;
  onCalculate: () => void;
  totalWithProfit: number;
}

export function ProfitCalculations({
  isStaff,
  currentProfit,
  pricePerPax,
  onProfitChange,
  onCalculate,
  totalWithProfit,
}: ProfitCalculationsProps) {
  useEffect(() => {
    const profitAmount = (pricePerPax * currentProfit) / 100;
    onProfitChange(pricePerPax + profitAmount);
  }, [currentProfit, pricePerPax, onProfitChange]);

  if (!isStaff) return null;

  return (
    <div className="space-y-2">
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
            if (!isNaN(value) && value >= 0 && value <= 100) {
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

      <div className="flex justify-between items-center">
        <p className="font-semibold">Profit</p>
        <p className="font-semibold">{formatToIDR((pricePerPax * currentProfit) / 100)}</p>
      </div>

      <div className="flex justify-between items-center">
        <p className="font-semibold">Total Price</p>
        <p className="font-semibold">{formatToIDR(totalWithProfit)}</p>
      </div>

      <div className="flex justify-between items-center">
        <p className="font-semibold">Price per pax</p>
        <p className="font-semibold">{formatToIDR(pricePerPax)}</p>
      </div>
    </div>
  );
}