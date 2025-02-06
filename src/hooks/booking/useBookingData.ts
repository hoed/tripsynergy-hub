import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SummaryItem } from "./types";

export function useBookingData(userId: string | undefined) {
  const { data: bookings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['bookings', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
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
          accommodations(name, price_per_night),
          transportation(type, price_per_person),
          attractions(name, price_per_person),
          meals(name, price_per_person)
        `)
        .eq('client_id', userId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId
  });

  const summaryItems: SummaryItem[] = bookings.map(booking => ({
    name: booking.accommodations?.[0]?.name || 
         booking.transportation?.[0]?.type || 
         booking.attractions?.[0]?.name || 
         booking.meals?.[0]?.name || 'Unknown',
    price: booking.total_price,
    type: booking.accommodations ? 'Accommodation' :
          booking.transportation ? 'Transportation' :
          booking.attractions ? 'Attraction' :
          booking.meals ? 'Meal' : 'Unknown',
    bookingId: booking.id,
    profitPercentage: booking.profit_percentage,
    startDate: booking.start_date,
    endDate: booking.end_date
  }));

  const totalPrice = bookings.reduce((sum, booking) => sum + (booking.total_price || 0), 0);
  const totalWithProfit = bookings.reduce((sum, booking) => {
    const profit = (booking.total_price || 0) * ((booking.profit_percentage || 0) / 100);
    return sum + (booking.total_price || 0) + profit;
  }, 0);

  return {
    bookings,
    summaryItems,
    totalPrice,
    totalWithProfit,
    isLoading,
    error,
    fetchBookingsAndCalculate: refetch
  };
}