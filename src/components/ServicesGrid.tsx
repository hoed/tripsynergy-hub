import { useEffect, useState } from "react";
import { ServiceCard } from "./ServiceCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Database } from "@/integrations/supabase/types";

type ServiceType = "accommodations" | "transportation" | "attractions" | "meals";

type Accommodation = Database["public"]["Tables"]["accommodations"]["Row"];
type Transportation = Database["public"]["Tables"]["transportation"]["Row"];
type Attraction = Database["public"]["Tables"]["attractions"]["Row"];
type Meal = Database["public"]["Tables"]["meals"]["Row"];

type Service = Accommodation | Transportation | Attraction | Meal;

interface ServicesGridProps {
  type: ServiceType;
}

const isAccommodation = (service: Service): service is Accommodation => {
  return 'price_per_night' in service;
};

const isTransportation = (service: Service): service is Transportation => {
  return 'type' in service && !('location' in service);
};

export function ServicesGrid({ type }: ServicesGridProps) {
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    const checkStaffStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      setIsStaff(profile?.role === 'owner' || profile?.role === 'operator');
    };
    
    checkStaffStatus();
  }, []);

  const { data: services = [], refetch } = useQuery({
    queryKey: [type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(type)
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  const getPriceLabel = () => {
    switch (type) {
      case "accommodations":
        return "/ night";
      default:
        return "/ person";
    }
  };

  const getServiceTitle = (service: Service) => {
    if (isTransportation(service)) {
      return service.type;
    }
    return 'name' in service ? service.name : '';
  };

  const getServicePrice = (service: Service) => {
    if (isAccommodation(service)) {
      return service.price_per_night;
    }
    return 'price_per_person' in service ? service.price_per_person : 0;
  };

  const getServiceLocation = (service: Service) => {
    return 'location' in service ? service.location : undefined;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          serviceType={type}
          title={getServiceTitle(service)}
          description={service.description || ""}
          price={getServicePrice(service)}
          location={getServiceLocation(service)}
          priceLabel={getPriceLabel()}
          isStaff={isStaff}
          onDelete={refetch}
        />
      ))}
    </div>
  );
}