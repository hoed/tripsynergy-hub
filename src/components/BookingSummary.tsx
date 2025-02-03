import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { calculateAccommodationPrice, calculatePerPersonPrice } from "@/utils/bookingCalculations";
import { useToast } from "@/hooks/use-toast";
import { BookingList } from "./booking/BookingList";

interface SummaryItem {
  name: string;
  price: number;
  type: string;
  bookingId?: string;
  profitPercentage?: number;
}

export function BookingSummary() {
  const [summaryItems, setSummaryItems] = useState<SummaryItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalWithProfit, setTotalWithProfit] = useState(0);
  const [isStaff, setIsStaff] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const checkStaffStatus = async () => {
      if (!user) return;
      const { data: role } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      setIsStaff(role?.role === 'owner' || role?.role === 'operator');
    };
    checkStaffStatus();
  }, [user]);

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
        .eq('client_id', user.id);

      if (error) {
        console.error('Error fetching bookings:', error);
        return;
      }

      if (!bookings || bookings.length === 0) {
        setSummaryItems([]);
        setTotalPrice(0);
        setTotalWithProfit(0);
        return;
      }

      const items: SummaryItem[] = [];
      let total = 0;
      let totalProfit = 0;

      bookings.forEach(booking => {
        let itemPrice = 0;
        
        if (booking.accommodations) {
          const accommodationPrice = calculateAccommodationPrice(
            booking.accommodations,
            booking.start_date,
            booking.end_date
          );
          if (accommodationPrice) {
            itemPrice = accommodationPrice.price;
            items.push({
              ...accommodationPrice,
              bookingId: booking.id,
              profitPercentage: booking.profit_percentage
            });
          }
        }

        if (booking.transportation) {
          const transportationPrice = calculatePerPersonPrice(
            booking.transportation,
            booking.number_of_people,
            'Transportation'
          );
          if (transportationPrice) {
            itemPrice = transportationPrice.price;
            items.push({
              ...transportationPrice,
              bookingId: booking.id,
              profitPercentage: booking.profit_percentage
            });
          }
        }

        if (booking.attractions) {
          const attractionPrice = calculatePerPersonPrice(
            booking.attractions,
            booking.number_of_people,
            'Attraction'
          );
          if (attractionPrice) {
            itemPrice = attractionPrice.price;
            items.push({
              ...attractionPrice,
              bookingId: booking.id,
              profitPercentage: booking.profit_percentage
            });
          }
        }

        if (booking.meals) {
          const mealPrice = calculatePerPersonPrice(
            booking.meals,
            booking.number_of_people,
            'Meal'
          );
          if (mealPrice) {
            itemPrice = mealPrice.price;
            items.push({
              ...mealPrice,
              bookingId: booking.id,
              profitPercentage: booking.profit_percentage
            });
          }
        }

        total += itemPrice;
        totalProfit += itemPrice * (1 + (booking.profit_percentage || 0) / 100);
      });

      setSummaryItems(items);
      setTotalPrice(total);
      setTotalWithProfit(totalProfit);
    };

    fetchBookingsAndCalculate();
  }, [user]);

  const handleProfitUpdate = async (bookingId: string, newProfit: number) => {
    const { error } = await supabase
      .from('bookings')
      .update({ profit_percentage: newProfit })
      .eq('id', bookingId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profit percentage",
      });
    } else {
      toast({
        title: "Success",
        description: "Profit percentage updated successfully",
      });
    }
  };

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
        <BookingList
          items={summaryItems}
          isStaff={isStaff}
          onProfitUpdate={handleProfitUpdate}
        />
        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between items-center">
            <p className="font-semibold">Subtotal</p>
            <p className="font-semibold">${totalPrice.toFixed(2)}</p>
          </div>
          {isStaff && (
            <div className="flex justify-between items-center text-primary">
              <p>With Profit</p>
              <p>${totalWithProfit.toFixed(2)}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}