import { Hotel, Bus, MapPin, Utensils, Package } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export const serviceTypes = [
  { value: "accommodations", label: "Accommodations", icon: Hotel },
  { value: "transportation", label: "Transportation", icon: Bus },
  { value: "attractions", label: "Attractions", icon: MapPin },
  { value: "meals", label: "Meals", icon: Utensils },
  { value: "additional_services", label: "Additional Items", icon: Package },
];

interface ServiceNavigationProps {
  selectedTab: string;
  setSelectedTab: (value: string) => void;
  isMobile: boolean;
}

export function ServiceNavigation({ selectedTab, setSelectedTab, isMobile }: ServiceNavigationProps) {
  return (
    <TabsList className={`grid w-full gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-5'}`}>
      {serviceTypes.map((service) => (
        <TabsTrigger
          key={service.value}
          value={service.value}
          className={`flex items-center gap-2 ${selectedTab === service.value ? 'bg-accent text-accent-foreground' : ''}`}
          onClick={() => setSelectedTab(service.value)}
        >
          <service.icon className="h-4 w-4" />
          {service.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}