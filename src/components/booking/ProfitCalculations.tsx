import { Input } from "@/components/ui/input";
import { formatToIDR } from "@/utils/currency";

interface ProfitCalculationsProps {
  isStaff: boolean;
  currentProfit: number;
  pricePerPax: number;
  onProfitChange: (value: number) => void;
  totalWithProfit: number;
}

export function ProfitCalculations({
  isStaff,
  currentProfit,
  pricePerPax,
  onProfitChange,
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