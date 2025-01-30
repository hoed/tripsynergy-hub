import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Menu } from "lucide-react";
import { ServicesGrid } from "@/components/ServicesGrid";
import { TripsGrid } from "@/components/TripsGrid";
import { ServiceManagementForm } from "@/components/ServiceManagementForm";
import { useAuth } from "@/components/AuthProvider";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const { signOut } = useAuth();
  const [selectedTab, setSelectedTab] = useState("accommodations");
  const [showServiceForm, setShowServiceForm] = useState(false);
  const isMobile = useIsMobile();

  const TabsListContent = () => (
    <TabsList className="grid w-full max-w-3xl grid-cols-2 md:grid-cols-5">
      <TabsTrigger value="accommodations">Accommodations</TabsTrigger>
      <TabsTrigger value="transportation">Transportation</TabsTrigger>
      <TabsTrigger value="attractions">Attractions</TabsTrigger>
      <TabsTrigger value="meals">Meals</TabsTrigger>
      <TabsTrigger value="trips">Trips</TabsTrigger>
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
      
      <Tabs defaultValue="accommodations" className="w-full" onValueChange={setSelectedTab}>
        <div className="flex justify-between items-center mb-4 overflow-x-auto">
          {isMobile ? (
            <div className="w-full">
              <TabsListContent />
            </div>
          ) : (
            <>
              <TabsListContent />
              {selectedTab !== "trips" && (
                <Button onClick={() => setShowServiceForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add {selectedTab.slice(0, -1)}
                </Button>
              )}
            </>
          )}
        </div>

        {isMobile && selectedTab !== "trips" && (
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
          <TabsContent value="trips">
            <TripsGrid />
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