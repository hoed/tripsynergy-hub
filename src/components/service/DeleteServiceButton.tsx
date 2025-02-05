import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { useQueryClient } from "@tanstack/react-query";

type ServiceType = "accommodations" | "transportation" | "attractions" | "meals";
type Service = 
  | Database["public"]["Tables"]["accommodations"]["Row"]
  | Database["public"]["Tables"]["transportation"]["Row"]
  | Database["public"]["Tables"]["attractions"]["Row"]
  | Database["public"]["Tables"]["meals"]["Row"];

type BookingReferenceColumn = "accommodation_id" | "transportation_id" | "attraction_id" | "meal_id";

const getBookingReferenceColumn = (serviceType: ServiceType): BookingReferenceColumn => {
  switch (serviceType) {
    case "accommodations":
      return "accommodation_id";
    case "transportation":
      return "transportation_id";
    case "attractions":
      return "attraction_id";
    case "meals":
      return "meal_id";
  }
};

interface DeleteServiceButtonProps {
  service: Service;
  serviceType: ServiceType;
  onDelete?: () => void;
}

export function DeleteServiceButton({ service, serviceType, onDelete }: DeleteServiceButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);

    try {
      // First, check if we have staff permissions
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to delete items.",
        });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || !['owner', 'operator'].includes(profile.role)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You don't have permission to delete this item.",
        });
        return;
      }

      const bookingColumn = getBookingReferenceColumn(serviceType);

      // First, check if there are any associated bookings
      const { data: bookings, error: bookingsCheckError } = await supabase
        .from('bookings')
        .select('id')
        .eq(bookingColumn, service.id);

      if (bookingsCheckError) {
        console.error('Error checking bookings:', bookingsCheckError);
        throw bookingsCheckError;
      }

      if (bookings && bookings.length > 0) {
        // Delete all associated bookings first
        const { error: bookingsDeletionError } = await supabase
          .from('bookings')
          .delete()
          .eq(bookingColumn, service.id);

        if (bookingsDeletionError) {
          console.error('Error deleting bookings:', bookingsDeletionError);
          throw bookingsDeletionError;
        }
      }

      // Then delete the service itself
      const { error: serviceError } = await supabase
        .from(serviceType)
        .delete()
        .eq('id', service.id);

      if (serviceError) {
        console.error('Error deleting service:', serviceError);
        throw serviceError;
      }

      // Invalidate both queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: [serviceType] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });

      toast({
        title: "Success",
        description: "Service and associated bookings have been deleted.",
      });

      if (onDelete) onDelete();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the item. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="icon"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}