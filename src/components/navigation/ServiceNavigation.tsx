import { Hotel, Bus, MapPin, Utensils, Package } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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
  if (isMobile) {
    return (
      <TabsList className="grid w-full grid-cols-2 gap-2">
        {serviceTypes.map((service) => (
          <TabsTrigger
            key={service.value}
            value={service.value}
            className="flex items-center gap-2"
            onClick={() => setSelectedTab(service.value)}
          >
            <service.icon className="h-4 w-4" />
            {service.label}
          </TabsTrigger>
        ))}
      </TabsList>
    );
  }

  return (
    <TabsList className="grid w-full max-w-3xl grid-cols-4">
      {serviceTypes.map((service) => (
        <TabsTrigger
          key={service.value}
          value={service.value}
          onClick={() => setSelectedTab(service.value)}
        >
          {service.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}