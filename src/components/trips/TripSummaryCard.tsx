import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

interface TripSummaryCardProps {
  tripId: string;
}

// Define base table types
type Tables = Database['public']['Tables'];
type BookingRow = Tables['bookings']['Row'];
type AccommodationRow = Tables['accommodations']['Row'];
type TransportationRow = Tables['transportation']['Row'];
type AttractionRow = Tables['attractions']['Row'];
type MealRow = Tables['meals']['Row'];

// Define the combined booking type
interface BookingWithDetails extends BookingRow {
  accommodation?: AccommodationRow;
  transportation?: TransportationRow;
  attraction?: AttractionRow;
  meal?: MealRow;
}

export function TripSummaryCard({ tripId }: TripSummaryCardProps) {
  const { data: bookings } = useQuery<BookingWithDetails[]>({
    queryKey: ["trip-bookings", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          accommodation:accommodations(*),
          transportation:transportation(*),
          attraction:attractions(*),
          meal:meals(*)
        `)
        .eq("trip_id", tripId);

      if (error) throw error;
      return data;
    },
  });

  const { data: additionals } = useQuery<Tables['trip_additionals']['Row'][]>({
    queryKey: ["trip-additionals", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trip_additionals")
        .select("*")
        .eq("trip_id", tripId);

      if (error) throw error;
      return data;
    },
  });

  const calculateTotalPrice = () => {
    let total = 0;

    bookings?.forEach((booking) => {
      total += booking.total_price || 0;
    });

    additionals?.forEach((additional) => {
      total += additional.total_price || 0;
    });

    return total;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trip Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bookings?.map((booking) => (
          <div key={booking.id} className="border-b pb-2">
            {booking.accommodation && (
              <div className="flex justify-between">
                <span>Accommodation: {booking.accommodation.name}</span>
                <span>${booking.accommodation.price_per_night}</span>
              </div>
            )}
            {booking.transportation && (
              <div className="flex justify-between">
                <span>Transportation: {booking.transportation.type}</span>
                <span>${booking.transportation.price_per_person}</span>
              </div>
            )}
            {booking.attraction && (
              <div className="flex justify-between">
                <span>Attraction: {booking.attraction.name}</span>
                <span>${booking.attraction.price_per_person}</span>
              </div>
            )}
            {booking.meal && (
              <div className="flex justify-between">
                <span>Meal: {booking.meal.name}</span>
                <span>${booking.meal.price_per_person}</span>
              </div>
            )}
          </div>
        ))}

        {additionals?.map((additional) => (
          <div key={additional.id} className="flex justify-between border-b pb-2">
            <span>{additional.name}</span>
            <span>${additional.total_price}</span>
          </div>
        ))}

        <div className="pt-4">
          <div className="flex justify-between font-semibold">
            <span>Total Price</span>
            <span>${calculateTotalPrice().toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}