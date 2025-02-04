import { useEffect, useState } from "react";
import { ServiceCard } from "./ServiceCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ServicesGridProps {
  type: "accommodations" | "transportation" | "attractions" | "meals";
}

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          serviceType={type}
          title={service.name || service.type}
          description={service.description || ""}
          price={
            type === "accommodations"
              ? service.price_per_night
              : service.price_per_person
          }
          location={service.location}
          priceLabel={getPriceLabel()}
          isStaff={isStaff}
          onDelete={refetch}
        />
      ))}
    </div>
  );
}