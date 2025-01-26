import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceCard } from "./ServiceCard";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  name: string;
  description: string;
  location?: string;
  price_per_night?: number;
  price_per_person?: number;
}

interface ServicesGridProps {
  type: "accommodations" | "transportation" | "attractions" | "meals";
  onSelect: (service: Service) => void;
}

export function ServicesGrid({ type, onSelect }: ServicesGridProps) {
  const { toast } = useToast();
  
  const { data: services, isLoading, error } = useQuery({
    queryKey: [type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(type)
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  if (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load services. Please try again later.",
    });
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const getPriceLabel = () => {
    switch (type) {
      case "accommodations":
        return "per night";
      default:
        return "per person";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services?.map((service) => (
        <ServiceCard
          key={service.id}
          title={service.name}
          description={service.description || ""}
          price={service.price_per_night || service.price_per_person || 0}
          location={service.location}
          priceLabel={getPriceLabel()}
          onSelect={() => onSelect(service)}
        />
      ))}
    </div>
  );
}