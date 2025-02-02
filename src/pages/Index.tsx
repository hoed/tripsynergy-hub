import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Menu, Hotel, Bus, MapPin, Utensils } from "lucide-react";
import { ServicesGrid } from "@/components/ServicesGrid";
import { ServiceManagementForm } from "@/components/ServiceManagementForm";
import { useAuth } from "@/components/AuthProvider";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BookingSummary } from "@/components/BookingSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const Index = () => {
  const { signOut } = useAuth();
  const [selectedTab, setSelectedTab] = useState("accommodations");
  const [showServiceForm, setShowServiceForm] = useState(false);
  const isMobile = useIsMobile();

  const { data: summaryData } = useQuery({
    queryKey: ['services-summary'],
    queryFn: async () => {
      const [accommodations, transportation, attractions, meals] = await Promise.all([
        supabase.from('accommodations').select('*'),
        supabase.from('transportation').select('*'),
        supabase.from('attractions').select('*'),
        supabase.from('meals').select('*'),
      ]);

      return {
        accommodations: accommodations.data?.length || 0,
        transportation: transportation.data?.length || 0,
        attractions: attractions.data?.length || 0,
        meals: meals.data?.length || 0,
      };
    },
  });

  const summaryCards = [
    { title: 'Accommodations', count: summaryData?.accommodations || 0, icon: Hotel },
    { title: 'Transportation', count: summaryData?.transportation || 0, icon: Bus },
    { title: 'Attractions', count: summaryData?.attractions || 0, icon: MapPin },
    { title: 'Meals', count: summaryData?.meals || 0, icon: Utensils },
  ];

  const serviceTypes = [
    { value: "accommodations", label: "Accommodations", icon: Hotel },
    { value: "transportation", label: "Transportation", icon: Bus },
    { value: "attractions", label: "Attractions", icon: MapPin },
    { value: "meals", label: "Meals", icon: Utensils },
  ];

  const TabsListContent = () => (
    <TabsList className="grid w-full max-w-3xl grid-cols-2 md:grid-cols-4">
      <TabsTrigger value="accommodations">Accommodations</TabsTrigger>
      <TabsTrigger value="transportation">Transportation</TabsTrigger>
      <TabsTrigger value="attractions">Attractions</TabsTrigger>
      <TabsTrigger value="meals">Meals</TabsTrigger>
    </TabsList>
  );

  const HeaderContent = () => (
    <div className="flex items-center gap-4">
      <ThemeToggle />
      <ProfileAvatar />
      <Button variant="outline" onClick={signOut}>
        Sign Out
      </Button>
    </div>
  );

  const MobileNavigation = () => (
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-4xl font-bold">Be Your Tour Travel System</h1>
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 mt-8">
                <HeaderContent />
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <HeaderContent />
        )}
      </div>

      {isMobile && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          {summaryCards.map((card) => (
            <Card key={card.title} className="col-span-1">
              <CardHeader className="p-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <card.icon className="h-4 w-4" />
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold">{card.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mb-8">
        <BookingSummary />
      </div>
      
      <Tabs defaultValue="accommodations" className="w-full" onValueChange={setSelectedTab}>
        <div className="flex justify-between items-center mb-4 overflow-x-auto">
          {isMobile ? (
            <div className="w-full">
              <MobileNavigation />
            </div>
          ) : (
            <>
              <TabsListContent />
              <Button onClick={() => setShowServiceForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add {selectedTab.slice(0, -1)}
              </Button>
            </>
          )}
        </div>

        {isMobile && (
          <div className="mb-4">
            <Button className="w-full" onClick={() => setShowServiceForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add {selectedTab.slice(0, -1)}
            </Button>
          </div>
        )}

        <div className="mt-8">
          <TabsContent value="accommodations">
            <ServicesGrid type="accommodations" />
          </TabsContent>
          <TabsContent value="transportation">
            <ServicesGrid type="transportation" />
          </TabsContent>
          <TabsContent value="attractions">
            <ServicesGrid type="attractions" />
          </TabsContent>
          <TabsContent value="meals">
            <ServicesGrid type="meals" />
          </TabsContent>
        </div>
      </Tabs>

      <Dialog open={showServiceForm} onOpenChange={setShowServiceForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Add New {selectedTab.slice(0, -1)}
            </DialogTitle>
          </DialogHeader>
          <ServiceManagementForm
            serviceType={selectedTab as "accommodations" | "transportation" | "attractions" | "meals"}
            onSuccess={() => setShowServiceForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;