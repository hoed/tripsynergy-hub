import { Hotel, Bus, MapPin, Utensils } from "lucide-react";
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
];

interface ServiceNavigationProps {
  selectedTab: string;
  setSelectedTab: (value: string) => void;
  isMobile: boolean;
}

export function ServiceNavigation({ selectedTab, setSelectedTab, isMobile }: ServiceNavigationProps) {
  if (isMobile) {
    return (
      <Breadcrumb>
        <BreadcrumbList className="flex-wrap">
          {serviceTypes.map((service, index) => (
            <div key={service.value} className="flex items-center">
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {selectedTab === service.value ? (
                  <BreadcrumbPage className="flex items-center gap-1">
                    <service.icon className="h-4 w-4" />
                    {service.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink 
                    asChild 
                    className="flex items-center gap-1"
                    onClick={() => setSelectedTab(service.value)}
                  >
                    <button>
                      <service.icon className="h-4 w-4" />
                      {service.label}
                    </button>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <TabsList className="grid w-full max-w-3xl grid-cols-2 md:grid-cols-4">
      <TabsTrigger value="accommodations">Accommodations</TabsTrigger>
      <TabsTrigger value="transportation">Transportation</TabsTrigger>
      <TabsTrigger value="attractions">Attractions</TabsTrigger>
      <TabsTrigger value="meals">Meals</TabsTrigger>
    </TabsList>
  );
}