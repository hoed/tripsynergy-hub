import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

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
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateTotalPrice = () => {
    if (!startDate || !endDate) return 0;
    
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if ('price_per_night' in service) {
      return service.price_per_night * days;
    } else if ('price_per_person' in service) {
      return service.price_per_person * numberOfPeople * (serviceType === 'transportation' ? 1 : days);
    }
    
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !startDate || !endDate) {
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
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
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
        <label className="text-sm font-medium">Start Date</label>
        <Calendar
          mode="single"
          selected={startDate}
          onSelect={setStartDate}
          disabled={(date) => date < new Date()}
          className="rounded-md border"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">End Date</label>
        <Calendar
          mode="single"
          selected={endDate}
          onSelect={setEndDate}
          disabled={(date) => !startDate || date <= startDate}
          className="rounded-md border"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Number of People</label>
        <Input
          type="number"
          min={1}
          value={numberOfPeople}
          onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
        />
      </div>

      {startDate && endDate && (
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