import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { calculateAccommodationPrice, calculatePerPersonPrice } from "@/utils/bookingCalculations";
import { SummaryItem } from "./SummaryItem";
import { useToast } from "@/hooks/use-toast";

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
  const [isStaff, setIsStaff] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const checkStaffStatus = async () => {
      if (!user) return;
      const { data, error } = await supabase.rpc('is_staff', { user_id: user.id });
      if (!error) {
        setIsStaff(data);
      }
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
        return;
      }

      const items: SummaryItem[] = [];
      let total = 0;

      bookings.forEach(booking => {
        // Calculate accommodation price
        const accommodationPrice = calculateAccommodationPrice(
          booking.accommodations,
          booking.start_date,
          booking.end_date
        );
        if (accommodationPrice) {
          items.push({
            ...accommodationPrice,
            bookingId: booking.id,
            profitPercentage: booking.profit_percentage
          });
          total += accommodationPrice.price * (1 + (booking.profit_percentage || 0) / 100);
        }

        // Calculate transportation price
        const transportationPrice = calculatePerPersonPrice(
          booking.transportation,
          booking.number_of_people,
          'Transportation'
        );
        if (transportationPrice) {
          items.push({
            ...transportationPrice,
            bookingId: booking.id,
            profitPercentage: booking.profit_percentage
          });
          total += transportationPrice.price * (1 + (booking.profit_percentage || 0) / 100);
        }

        // Calculate attraction price
        const attractionPrice = calculatePerPersonPrice(
          booking.attractions,
          booking.number_of_people,
          'Attraction'
        );
        if (attractionPrice) {
          items.push({
            ...attractionPrice,
            bookingId: booking.id,
            profitPercentage: booking.profit_percentage
          });
          total += attractionPrice.price * (1 + (booking.profit_percentage || 0) / 100);
        }

        // Calculate meal price
        const mealPrice = calculatePerPersonPrice(
          booking.meals,
          booking.number_of_people,
          'Meal'
        );
        if (mealPrice) {
          items.push({
            ...mealPrice,
            bookingId: booking.id,
            profitPercentage: booking.profit_percentage
          });
          total += mealPrice.price * (1 + (booking.profit_percentage || 0) / 100);
        }
      });

      setSummaryItems(items);
      setTotalPrice(total);
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
        <div className="space-y-4">
          {summaryItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center gap-4">
              <SummaryItem {...item} />
              {isStaff && item.bookingId && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={item.profitPercentage || 0}
                    className="w-24"
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        handleProfitUpdate(item.bookingId!, value);
                      }
                    }}
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              )}
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