import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { formatToIDR } from "@/utils/currency";
import { useState } from "react";
import { ProfitCalculations } from "./ProfitCalculations";

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
  if (!isStaff) return null;

  const profitAmount = pricePerPax * (currentProfit / 100);
  const totalPriceWithProfit = pricePerPax + profitAmount;

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
        <p className="font-semibold">{formatToIDR(profitAmount)}</p>
      </div>

      <div className="flex justify-between items-center">
        <p className="font-semibold">Total Price</p>
        <p className="font-semibold">{formatToIDR(totalPriceWithProfit)}</p>
      </div>

      <div className="flex justify-between items-center">
        <p className="font-semibold">Price per pax</p>
        <p className="font-semibold">{formatToIDR(pricePerPax)}</p>
      </div>
    </div>
  );
}

const ParentComponent = () => {
  const [currentProfit, setCurrentProfit] = useState<number>(0);
  const [pricePerPax, setPricePerPax] = useState<number>(100); // Example value
  const [totalWithProfit, setTotalWithProfit] = useState<number>(0);

  const handleProfitChange = (value: number) => {
    setCurrentProfit(value);
  };

  const handleCalculate = () => {
    const profitAmount = pricePerPax * (currentProfit / 100);
    setTotalWithProfit(pricePerPax + profitAmount);
  };

  return (
    <ProfitCalculations
      isStaff={true}
      currentProfit={currentProfit}
      pricePerPax={pricePerPax}
      onProfitChange={handleProfitChange}
      onCalculate={handleCalculate}
      totalWithProfit={totalWithProfit}
    />
  );
};

export default ParentComponent;