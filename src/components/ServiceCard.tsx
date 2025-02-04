import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Trash2 } from "lucide-react";
import { BookingForm } from "./BookingForm";
import { Database } from "@/integrations/supabase/types";
import { formatToIDR } from "@/utils/currency";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

type Service = 
  | Database["public"]["Tables"]["accommodations"]["Row"]
  | Database["public"]["Tables"]["transportation"]["Row"]
  | Database["public"]["Tables"]["attractions"]["Row"]
  | Database["public"]["Tables"]["meals"]["Row"];

interface ServiceCardProps {
  service: Service;
  serviceType: "accommodations" | "transportation" | "attractions" | "meals";
  title: string;
  description: string;
  price: number;
  location?: string;
  priceLabel: string;
  isStaff: boolean;
  onDelete?: () => void;
}

export function ServiceCard({ 
  service, 
  serviceType, 
  title, 
  description, 
  price, 
  location, 
  priceLabel,
  isStaff,
  onDelete 
}: ServiceCardProps) {
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      // First, delete any associated bookings
      const { error: bookingsError } = await supabase
        .from('bookings')
        .delete()
        .eq(`${serviceType.slice(0, -1)}_id`, service.id);

      if (bookingsError) throw bookingsError;

      // Then delete the service itself
      const { error } = await supabase
        .from(serviceType)
        .delete()
        .eq('id', service.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${title} has been deleted.`,
      });

      if (onDelete) onDelete();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the item.",
      });
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>{title}</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-primary">{formatToIDR(price)} {priceLabel}</span>
              {isStaff && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          {location && (
            <CardDescription className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {location}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{description}</p>
          <Button onClick={() => setShowBookingDialog(true)} className="w-full">
            Book Now
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Book {title}</DialogTitle>
          </DialogHeader>
          <BookingForm
            service={service}
            serviceType={serviceType}
            onSuccess={() => setShowBookingDialog(false)}
            onCancel={() => setShowBookingDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}