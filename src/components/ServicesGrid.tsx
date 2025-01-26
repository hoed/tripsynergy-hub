import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceCard } from "./ServiceCard";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type ServiceType = "accommodations" | "transportation" | "attractions" | "meals";

type Service = 
  | Database["public"]["Tables"]["accommodations"]["Row"]
  | Database["public"]["Tables"]["transportation"]["Row"]
  | Database["public"]["Tables"]["attractions"]["Row"]
  | Database["public"]["Tables"]["meals"]["Row"];

interface ServicesGridProps {
  type: ServiceType;
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
      return data as Service[];
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

  const getServiceName = (service: Service) => {
    if ('name' in service) return service.name;
    if ('type' in service) return service.type;
    return '';
  };

  const getServicePrice = (service: Service) => {
    if ('price_per_night' in service) return service.price_per_night;
    if ('price_per_person' in service) return service.price_per_person;
    return 0;
  };

  const getServiceLocation = (service: Service) => {
    if ('location' in service) return service.location;
    return '';
  };

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
          title={getServiceName(service)}
          description={service.description || ""}
          price={getServicePrice(service)}
          location={getServiceLocation(service)}
          priceLabel={getPriceLabel()}
          onSelect={() => onSelect(service)}
        />
      ))}
    </div>
  );
}