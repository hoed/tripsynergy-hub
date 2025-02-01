import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { calculateAccommodationPrice, calculatePerPersonPrice } from "@/utils/bookingCalculations";
import { SummaryItem } from "./SummaryItem";

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

      const booking = bookings[0];
      const items: SummaryItem[] = [];
      let total = 0;

      // Calculate accommodation price
      const accommodationPrice = calculateAccommodationPrice(
        booking.accommodations,
        booking.start_date,
        booking.end_date
      );
      if (accommodationPrice) {
        items.push(accommodationPrice);
        total += accommodationPrice.price;
      }

      // Calculate transportation price
      const transportationPrice = calculatePerPersonPrice(
        booking.transportation,
        booking.number_of_people,
        'Transportation'
      );
      if (transportationPrice) {
        items.push(transportationPrice);
        total += transportationPrice.price;
      }

      // Calculate attraction price
      const attractionPrice = calculatePerPersonPrice(
        booking.attractions,
        booking.number_of_people,
        'Attraction'
      );
      if (attractionPrice) {
        items.push(attractionPrice);
        total += attractionPrice.price;
      }

      // Calculate meal price
      const mealPrice = calculatePerPersonPrice(
        booking.meals,
        booking.number_of_people,
        'Meal'
      );
      if (mealPrice) {
        items.push(mealPrice);
        total += mealPrice.price;
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
            <SummaryItem key={index} {...item} />
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