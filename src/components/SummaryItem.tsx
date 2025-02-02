interface SummaryItemProps {
  name: string;
  price: number;
  type: string;
}

export function SummaryItem({ name, price, type }: SummaryItemProps) {
  return (
    <div className="flex-1">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{type}</p>
        </div>
        <p className="font-medium">${price.toFixed(2)}</p>
      </div>
    </div>
  );
}