import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useBookingData(userId: string | undefined) {
  const { data: bookings = [], isLoading, error } = useQuery({
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

  return { bookings, isLoading, error };
}
