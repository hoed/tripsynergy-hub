import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Menu } from "lucide-react";
import { ServicesGrid } from "@/components/ServicesGrid";
import { ServiceManagementForm } from "@/components/ServiceManagementForm";
import { useAuth } from "@/components/AuthProvider";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BookingSummary } from "@/components/BookingSummary";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceNavigation } from "@/components/navigation/ServiceNavigation";
import { ServiceSummary } from "@/components/dashboard/ServiceSummary";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { signOut } = useAuth();
  const [selectedTab, setSelectedTab] = useState("accommodations");
  const [showServiceForm, setShowServiceForm] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const { data: summaryData } = useQuery({
    queryKey: ['services-summary'],
    queryFn: async () => {
      try {
        const [accommodations, transportation, attractions, meals, additionalServices] = await Promise.all([
          supabase.from('accommodations').select('*'),
          supabase.from('transportation').select('*'),
          supabase.from('attractions').select('*'),
          supabase.from('meals').select('*'),
          supabase.from('additional_services').select('*'), // Fixed typo here
        ]);

        if (accommodations.error) throw accommodations.error;
        if (transportation.error) throw transportation.error;
        if (attractions.error) throw attractions.error;
        if (meals.error) throw meals.error;
        if (additionalServices.error) throw additionalServices.error;

        return {
          accommodations: accommodations.data?.length || 0,
          transportation: transportation.data?.length || 0,
          attractions: attractions.data?.length || 0,
          meals: meals.data?.length || 0,
        };
      } catch (error) {
        console.error('Error fetching services summary:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch services summary"
        });
        return {
          accommodations: 0,
          transportation: 0,
          attractions: 0,
          meals: 0,
        };
      }
    },
  });

  const HeaderContent = () => (
    <div className="flex items-center gap-4">
      <ThemeToggle />
      <ProfileAvatar />
      <Button variant="outline" onClick={signOut}>
        Sign Out
      </Button>
    </div>
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

      {isMobile && <ServiceSummary summaryData={summaryData} />}

      <div className="mb-8">
        <BookingSummary />
      </div>
      
      <Tabs defaultValue="accommodations" className="w-full" onValueChange={setSelectedTab}>
        <div className="flex justify-between items-center mb-4 overflow-x-auto">
          <div className="w-full">
            <ServiceNavigation 
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              isMobile={isMobile}
            />
          </div>
          {!isMobile && (
            <Button onClick={() => setShowServiceForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add {selectedTab.slice(0, -1)}
            </Button>
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