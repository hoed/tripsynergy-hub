import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hotel, Bus, MapPin, Utensils } from "lucide-react";

interface ServiceSummaryProps {
  summaryData: {
    accommodations: number;
    transportation: number;
    attractions: number;
    meals: number;
  } | undefined;
}

export function ServiceSummary({ summaryData }: ServiceSummaryProps) {
  const summaryCards = [
    { title: 'Accommodations', count: summaryData?.accommodations || 0, icon: Hotel },
    { title: 'Transportation', count: summaryData?.transportation || 0, icon: Bus },
    { title: 'Attractions', count: summaryData?.attractions || 0, icon: MapPin },
    { title: 'Meals', count: summaryData?.meals || 0, icon: Utensils },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      {summaryCards.map((card) => (
        <Card key={card.title} className="col-span-1">
          <CardHeader className="p-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <card.icon className="h-4 w-4" />
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold">{card.count}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}