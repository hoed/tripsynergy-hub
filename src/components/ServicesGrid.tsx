import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceCard } from "./ServiceCard";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/components/AuthProvider";

type ServiceType = "accommodations" | "transportation" | "attractions" | "meals";

type Service = 
  | Database["public"]["Tables"]["accommodations"]["Row"]
  | Database["public"]["Tables"]["transportation"]["Row"]
  | Database["public"]["Tables"]["attractions"]["Row"]
  | Database["public"]["Tables"]["meals"]["Row"];

interface ServicesGridProps {
  type: ServiceType;
}

export function ServicesGrid({ type }: ServicesGridProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { data: services, isLoading, error } = useQuery({
    queryKey: [type],
    queryFn: async () => {
      if (!user) {
        throw new Error("User must be authenticated");
      }

      const { data, error } = await supabase
        .from(type)
        .select("*");
      
      if (error) {
        console.error("Error fetching services:", error);
        throw error;
      }
      return data as Service[];
    },
    enabled: !!user,
  });

  if (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load services. Please try again later.",
    });
    console.error("Query error:", error);
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

  const getServiceName = (service: Service): string => {
    if ('type' in service) return service.type;
    if ('name' in service) return service.name;
    return '';
  };

  const getServicePrice = (service: Service): number => {
    if ('price_per_night' in service) return service.price_per_night;
    if ('price_per_person' in service) return service.price_per_person;
    return 0;
  };

  const getServiceLocation = (service: Service): string => {
    if ('location' in service) return service.location;
    return '';
  };

  const getPriceLabel = (serviceType: ServiceType): string => {
    switch (serviceType) {
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
          service={service}
          serviceType={type}
          title={getServiceName(service)}
          description={service.description || ""}
          price={getServicePrice(service)}
          location={getServiceLocation(service)}
          priceLabel={getPriceLabel(type)}
        />
      ))}
    </div>
  );
}