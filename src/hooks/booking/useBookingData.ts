import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SummaryItem } from "./types";
import { useBookingCalculations } from "./useBookingCalculations";

export function useBookingData(userId: string | undefined) {
  const [summaryItems, setSummaryItems] = useState<SummaryItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [totalWithProfit, setTotalWithProfit] = useState<number>(0);
  const { toast } = useToast();
  const { calculateItemPrice, calculateTotalPrice, calculateTotalWithProfit } = useBookingCalculations();

  const fetchBookingsAndCalculate = async () => {
    if (!userId) return;

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        client_id,
        start_date,
        end_date,
        number_of_people,
        total_price,
        profit_percentage,
        transportation_id,
        accommodation_id,
        attraction_id,
        meal_id,
        accommodations (
          name,
          price_per_night
        ),
        transportation (
          type,
          price_per_person
        ),
        attractions (
          name,
          price_per_person
        ),
        meals (
          name,
          price_per_person
        )
      `)
      .eq('client_id', userId);

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

    bookings.forEach(booking => {
      const calculatedPrice = calculateItemPrice(booking);
      if (calculatedPrice) {
        items.push({
          name: calculatedPrice.name,
          price: calculatedPrice.price,
          type: calculatedPrice.type,
          bookingId: booking.id,
          profitPercentage: booking.profit_percentage,
          startDate: booking.start_date,
          endDate: booking.end_date
        });
      }
    });

    setSummaryItems(items);
    setTotalPrice(calculateTotalPrice(items));
    setTotalWithProfit(calculateTotalWithProfit(items));
  };

  return {
    summaryItems,
    totalPrice,
    totalWithProfit,
    fetchBookingsAndCalculate,
  };
}