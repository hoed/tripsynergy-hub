import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin } from "lucide-react";
import { BookingForm } from "@/components/BookingForm";
import { Database } from "@/integrations/supabase/types";
import { formatToIDR } from "@/utils/currency";
import { DeleteServiceButton } from "@/components/service/DeleteServiceButton";

type Service = 
  | Database["public"]["Tables"]["accommodations"]["Row"]
  | Database["public"]["Tables"]["transportation"]["Row"]
  | Database["public"]["Tables"]["attractions"]["Row"]
  | Database["public"]["Tables"]["meals"]["Row"];

type ServiceType = "accommodations" | "transportation" | "attractions" | "meals";

interface ServiceCardProps {
  service: Service;
  serviceType: ServiceType;
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

  return (
    <>
      <Card className="group w-full h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="space-y-2">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold line-clamp-2 text-primary">
                {title}
              </CardTitle>
              {location && (
                <CardDescription className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">{location}</span>
                </CardDescription>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="font-semibold text-lg text-primary whitespace-nowrap">
                {formatToIDR(price)}
              </span>
              <span className="text-sm text-muted-foreground">
                {priceLabel}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {description || "No description available"}
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={() => setShowBookingDialog(true)} 
              className="w-full sm:flex-1 bg-primary hover:bg-primary/90"
            >
              Book Now
            </Button>
            {isStaff && (
              <DeleteServiceButton
                service={service}
                serviceType={serviceType}
                onDelete={onDelete}
              />
            )}
          </div>
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