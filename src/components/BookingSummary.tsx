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
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          *,
          accommodations (name, price_per_night),
          transportation (type, price_per_person),
          attractions (name, price_per_person),
          meals (name, price_per_person)
        `)
        .eq('client_id', user.id)
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching bookings:', error);
        return;
      }

      if (!bookings || bookings.length === 0) {
        setSummaryItems([]);
        setTotalPrice(0);
        return;
      }

      // Process the first pending booking
      const booking = bookings[0];
      const items: SummaryItem[] = [];
      let total = 0;

      // Process accommodation
      if (booking.accommodations) {
        const days = Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24));
        const accommodationTotal = booking.accommodations.price_per_night * days;
        items.push({
          name: booking.accommodations.name,
          price: accommodationTotal,
          type: 'Accommodation'
        });
        total += accommodationTotal;
      }

      // Process transportation
      if (booking.transportation) {
        const transportationTotal = booking.transportation.price_per_person * booking.number_of_people;
        items.push({
          name: booking.transportation.type,
          price: transportationTotal,
          type: 'Transportation'
        });
        total += transportationTotal;
      }

      // Process attraction
      if (booking.attractions) {
        const attractionTotal = booking.attractions.price_per_person * booking.number_of_people;
        items.push({
          name: booking.attractions.name,
          price: attractionTotal,
          type: 'Attraction'
        });
        total += attractionTotal;
      }

      // Process meal
      if (booking.meals) {
        const mealTotal = booking.meals.price_per_person * booking.number_of_people;
        items.push({
          name: booking.meals.name,
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