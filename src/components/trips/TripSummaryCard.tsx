import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface TripSummaryCardProps {
  tripId: string;
}

// Define simplified types for the joined data
type SimpleBooking = {
  id: string;
  total_price: number;
  accommodation?: {
    id: string;
    name: string;
    price_per_night: number;
  };
  transportation?: {
    id: string;
    type: string;
    price_per_person: number;
  };
  attraction?: {
    id: string;
    name: string;
    price_per_person: number;
  };
  meal?: {
    id: string;
    name: string;
    price_per_person: number;
  };
};

type TripAdditional = {
  id: string;
  name: string;
  total_price: number;
};

export function TripSummaryCard({ tripId }: TripSummaryCardProps) {
  const { data: bookings } = useQuery<SimpleBooking[]>({
    queryKey: ["trip-bookings", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          total_price,
          accommodation:accommodations(id, name, price_per_night),
          transportation:transportation(id, type, price_per_person),
          attraction:attractions(id, name, price_per_person),
          meal:meals(id, name, price_per_person)
        `)
        .eq("trip_id", tripId);

      if (error) throw error;
      return data;
    },
  });

  const { data: additionals } = useQuery<TripAdditional[]>({
    queryKey: ["trip-additionals", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trip_additionals")
        .select("id, name, total_price")
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