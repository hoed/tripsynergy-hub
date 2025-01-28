import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { TripForm } from "./trips/TripForm";
import { TripCard } from "./trips/TripCard";

type TripFormData = {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
};

export const TripsGrid = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: trips, isLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("*");

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

  const createTripMutation = useMutation({
    mutationFn: async (data: TripFormData) => {
      const { error } = await supabase.from("trips").insert({
        ...data,
        created_by: session?.user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast({
        title: "Trip created successfully",
      });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error creating trip",
        description: error.message,
      });
    },
  });

  const updateTripMutation = useMutation({
    mutationFn: async (data: TripFormData & { id: string }) => {
      const { error } = await supabase
        .from("trips")
        .update(data)
        .eq("id", data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast({
        title: "Trip updated successfully",
      });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error updating trip",
        description: error.message,
      });
    },
  });

  const deleteTripMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("trips").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast({
        title: "Trip deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error deleting trip",
        description: error.message,
      });
    },
  });

  const handleSubmit = (data: TripFormData) => {
    if (selectedTrip) {
      updateTripMutation.mutate({ ...data, id: selectedTrip.id });
    } else {
      createTripMutation.mutate(data);
    }
  };

  const handleEdit = (trip: any) => {
    setSelectedTrip(trip);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
      deleteTripMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div>Loading trips...</div>;
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setSelectedTrip(null);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Trip
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedTrip ? "Edit Trip" : "Create Trip"}
              </DialogTitle>
              <DialogDescription>
                Fill in the details for your trip.
              </DialogDescription>
            </DialogHeader>
            <TripForm
              defaultValues={selectedTrip}
              onSubmit={handleSubmit}
              submitLabel={selectedTrip ? "Update" : "Create"}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trips?.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};