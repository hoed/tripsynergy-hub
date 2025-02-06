import { useState, useEffect, useCallback } from "react";
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

  const fetchBookingsAndCalculate = useCallback(async () => {
    if (!userId) {
      setSummaryItems([]);
      setTotalPrice(0);
      setTotalWithProfit(0);
      return;
    }

    try {
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

      if (error) throw error;

      const items: SummaryItem[] = (bookings || []).map(booking => {
        const calculatedPrice = calculateItemPrice(booking);
        return {
          name: calculatedPrice.name,
          price: calculatedPrice.price,
          type: calculatedPrice.type,
          bookingId: booking.id,
          profitPercentage: booking.profit_percentage,
          startDate: booking.start_date,
          endDate: booking.end_date
        };
      });

      setSummaryItems(items);
      setTotalPrice(calculateTotalPrice(items));
      setTotalWithProfit(calculateTotalWithProfit(items));
    } catch (error) {
      console.error('Error in fetchBookingsAndCalculate:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch booking data"
      });
    }
  }, [userId, calculateItemPrice, calculateTotalPrice, calculateTotalWithProfit, toast]);

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      fetchBookingsAndCalculate();
    }

    const channel = supabase
      .channel('booking-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          if (mounted) {
            fetchBookingsAndCalculate();
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [fetchBookingsAndCalculate]);

  return {
    summaryItems,
    totalPrice,
    totalWithProfit,
    fetchBookingsAndCalculate,
  };
}