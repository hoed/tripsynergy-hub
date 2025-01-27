import { useQuery } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export const TripsGrid = () => {
  const { toast } = useToast();

  const { data: trips, isLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("*, profiles(role)");

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching trips",
          description: error.message,
        });
        return [];
      }

      return data;
    },
  });

  if (isLoading) {
    return <div>Loading trips...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {trips?.map((trip) => (
        <Card key={trip.id} className="flex flex-col">
          <CardHeader>
            <CardTitle>{trip.title}</CardTitle>
            <CardDescription>{trip.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Start Date:</span>{" "}
                {new Date(trip.start_date).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">End Date:</span>{" "}
                {new Date(trip.end_date).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                <span className="capitalize">{trip.status}</span>
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 mt-auto">
            <Button variant="outline" size="icon">
              <Users className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};