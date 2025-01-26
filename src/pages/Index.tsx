import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServicesGrid } from "@/components/ServicesGrid";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("accommodations");

  const handleServiceSelect = (service: any) => {
    toast({
      title: "Service Selected",
      description: `You selected ${service.name}. Booking functionality coming soon!`,
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Welcome to TripSynergy</h1>
      
      <Tabs defaultValue="accommodations" className="w-full" onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="accommodations">Accommodations</TabsTrigger>
          <TabsTrigger value="transportation">Transportation</TabsTrigger>
          <TabsTrigger value="attractions">Attractions</TabsTrigger>
          <TabsTrigger value="meals">Meals</TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="accommodations">
            <ServicesGrid type="accommodations" onSelect={handleServiceSelect} />
          </TabsContent>
          <TabsContent value="transportation">
            <ServicesGrid type="transportation" onSelect={handleServiceSelect} />
          </TabsContent>
          <TabsContent value="attractions">
            <ServicesGrid type="attractions" onSelect={handleServiceSelect} />
          </TabsContent>
          <TabsContent value="meals">
            <ServicesGrid type="meals" onSelect={handleServiceSelect} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Index;