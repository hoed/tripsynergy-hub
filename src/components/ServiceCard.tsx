import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  price: number;
  location?: string;
  priceLabel: string;
  onSelect: () => void;
}

export function ServiceCard({ title, description, price, location, priceLabel, onSelect }: ServiceCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span>{title}</span>
          <span className="text-primary">${price} {priceLabel}</span>
        </CardTitle>
        {location && (
          <CardDescription className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {location}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button onClick={onSelect} className="w-full">
          Select
        </Button>
      </CardContent>
    </Card>
  );
}