import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface SummaryItem {
  name: string;
  price: number;
  type: string;
}

export function BookingSummary() {
  const [summaryItems, setSummaryItems] = useState<SummaryItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBookingsAndCalculate = async () => {
      if (!user) return;

      // Fetch user's bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          *,
          accommodations (name, price_per_night),
          transportation (type, price_per_person),
          attractions (name, price_per_person),
          meals (name, price_per_person)
        `)
        .eq('client_id', user.id)
        .eq('status', 'pending')
        .single();

      if (!bookings) return;

      const items: SummaryItem[] = [];
      let total = 0;

      // Process accommodation
      if (bookings.accommodations) {
        const days = Math.ceil((new Date(bookings.end_date).getTime() - new Date(bookings.start_date).getTime()) / (1000 * 60 * 60 * 24));
        const accommodationTotal = bookings.accommodations.price_per_night * days;
        items.push({
          name: bookings.accommodations.name,
          price: accommodationTotal,
          type: 'Accommodation'
        });
        total += accommodationTotal;
      }

      // Process transportation
      if (bookings.transportation) {
        const transportationTotal = bookings.transportation.price_per_person * bookings.number_of_people;
        items.push({
          name: bookings.transportation.type,
          price: transportationTotal,
          type: 'Transportation'
        });
        total += transportationTotal;
      }

      // Process attraction
      if (bookings.attractions) {
        const attractionTotal = bookings.attractions.price_per_person * bookings.number_of_people;
        items.push({
          name: bookings.attractions.name,
          price: attractionTotal,
          type: 'Attraction'
        });
        total += attractionTotal;
      }

      // Process meal
      if (bookings.meals) {
        const mealTotal = bookings.meals.price_per_person * bookings.number_of_people;
        items.push({
          name: bookings.meals.name,
          price: mealTotal,
          type: 'Meal'
        });
        total += mealTotal;
      }

      setSummaryItems(items);
      setTotalPrice(total);
    };

    fetchBookingsAndCalculate();
  }, [user]);

  if (summaryItems.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No active bookings found.</p>
        </CardContent>
      </Card>
    );
  }

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