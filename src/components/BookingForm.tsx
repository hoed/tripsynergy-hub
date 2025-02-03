import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

type Service = 
  | Database["public"]["Tables"]["accommodations"]["Row"]
  | Database["public"]["Tables"]["transportation"]["Row"]
  | Database["public"]["Tables"]["attractions"]["Row"]
  | Database["public"]["Tables"]["meals"]["Row"];

interface BookingFormProps {
  service: Service;
  serviceType: "accommodations" | "transportation" | "attractions" | "meals";
  onSuccess: () => void;
  onCancel: () => void;
}

export function BookingForm({ service, serviceType, onSuccess, onCancel }: BookingFormProps) {
  const { session } = useAuth();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateTotalPrice = () => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    
    const days = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    
    if ('price_per_night' in service) {
      return service.price_per_night * days;
    } else if ('price_per_person' in service) {
      return service.price_per_person * numberOfPeople * (serviceType === 'transportation' ? 1 : days);
    }
    
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !dateRange?.from || !dateRange?.to) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    setIsSubmitting(true);
    const totalPrice = calculateTotalPrice();

    try {
      const bookingData = {
        client_id: session.user.id,
        start_date: dateRange.from.toISOString(),
        end_date: dateRange.to.toISOString(),
        number_of_people: numberOfPeople,
        total_price: totalPrice,
        [`${serviceType.slice(0, -1)}_id`]: service.id,
      };

      const { error } = await supabase
        .from('bookings')
        .insert([bookingData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your booking has been confirmed!",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create booking. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Dates</label>
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={setDateRange}
          numberOfMonths={1}
          disabled={(date) => date < new Date()}
          className="rounded-md border"
        />
        {dateRange?.from && (
          <p className="text-sm text-muted-foreground">
            Selected: {format(dateRange.from, 'MMM dd, yyyy')} 
            {dateRange.to && ` - ${format(dateRange.to, 'MMM dd, yyyy')}`}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Number of {serviceType === 'transportation' ? 'Items' : 'People'}</label>
        <Input
          type="number"
          min={1}
          value={numberOfPeople}
          onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
        />
      </div>

      {dateRange?.from && dateRange?.to && (
        <div className="text-lg font-semibold">
          Total Price: ${calculateTotalPrice()}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Confirming..." : "Confirm Booking"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}