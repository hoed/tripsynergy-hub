import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface SummaryItem {
  name: string;
  price: number;
  type: string;
}

export function BookingSummary() {
  const [summaryItems, setSummaryItems] = useState<SummaryItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchSummaryData = async () => {
      // Fetch data from all relevant tables
      const [accommodations, transportation, attractions, meals, additionals] = await Promise.all([
        supabase.from('accommodations').select('name, price_per_night'),
        supabase.from('transportation').select('type, price_per_person'),
        supabase.from('attractions').select('name, price_per_person'),
        supabase.from('meals').select('name, price_per_person'),
        supabase.from('additional_services').select('name, price_per_person'),
      ]);

      const items: SummaryItem[] = [];
      let total = 0;

      // Process accommodations
      if (accommodations.data) {
        accommodations.data.forEach(item => {
          items.push({
            name: item.name,
            price: item.price_per_night,
            type: 'Accommodation'
          });
          total += item.price_per_night;
        });
      }

      // Process transportation
      if (transportation.data) {
        transportation.data.forEach(item => {
          items.push({
            name: item.type,
            price: item.price_per_person,
            type: 'Transportation'
          });
          total += item.price_per_person;
        });
      }

      // Process attractions
      if (attractions.data) {
        attractions.data.forEach(item => {
          items.push({
            name: item.name,
            price: item.price_per_person,
            type: 'Attraction'
          });
          total += item.price_per_person;
        });
      }

      // Process meals
      if (meals.data) {
        meals.data.forEach(item => {
          items.push({
            name: item.name,
            price: item.price_per_person,
            type: 'Meal'
          });
          total += item.price_per_person;
        });
      }

      // Process additional services
      if (additionals.data) {
        additionals.data.forEach(item => {
          items.push({
            name: item.name,
            price: item.price_per_person,
            type: 'Additional'
          });
          total += item.price_per_person;
        });
      }

      setSummaryItems(items);
      setTotalPrice(total);
    };

    fetchSummaryData();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {summaryItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.type}</p>
              </div>
              <p className="font-medium">${item.price.toFixed(2)}</p>
            </div>
          ))}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <p className="font-semibold">Total</p>
              <p className="font-semibold">${totalPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}