import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { useAuth } from "@/components/AuthProvider";

type TripFormData = {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
};

type Profile = {
  full_name: string;
  email: string;
};

type Participant = {
  id: string;
  user_id: string;
  role: string;
  profiles: Profile;
};

export const TripsGrid = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isParticipantsDialogOpen, setIsParticipantsDialogOpen] = useState(false);
  const [participantsEmail, setParticipantsEmail] = useState("");

  const form = useForm<TripFormData>({
    defaultValues: {
      title: "",
      description: "",
      start_date: "",
      end_date: "",
    },
  });

  const { data: trips, isLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select(`
          *,
          creator:created_by (
            role
          )
        `);

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

  const { data: participants } = useQuery({
    queryKey: ["participants", selectedTrip?.id],
    enabled: !!selectedTrip?.id && isParticipantsDialogOpen,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trip_participants")
        .select(`
          id,
          user_id,
          role,
          profiles:profiles!trip_participants_user_id_fkey (
            full_name,
            email
          )
        `)
        .eq("trip_id", selectedTrip.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching participants",
          description: error.message,
        });
        return [];
      }

      return data as Participant[];
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
      form.reset();
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
      form.reset();
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

  const addParticipantMutation = useMutation({
    mutationFn: async ({ tripId, email }: { tripId: string; email: string }) => {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (profileError) throw profileError;

      if (!profileData) {
        throw new Error("User not found");
      }

      const { error } = await supabase.from("trip_participants").insert({
        trip_id: tripId,
        user_id: profileData.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants"] });
      toast({
        title: "Participant added successfully",
      });
      setParticipantsEmail("");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error adding participant",
        description: error.message,
      });
    },
  });

  const removeParticipantMutation = useMutation({
    mutationFn: async (participantId: string) => {
      const { error } = await supabase
        .from("trip_participants")
        .delete()
        .eq("id", participantId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants"] });
      toast({
        title: "Participant removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error removing participant",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: TripFormData) => {
    if (selectedTrip) {
      updateTripMutation.mutate({ ...data, id: selectedTrip.id });
    } else {
      createTripMutation.mutate(data);
    }
  };

  const handleEdit = (trip: any) => {
    setSelectedTrip(trip);
    form.reset({
      title: trip.title,
      description: trip.description,
      start_date: trip.start_date,
      end_date: trip.end_date,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
      deleteTripMutation.mutate(id);
    }
  };

  const handleParticipantsClick = (trip: any) => {
    setSelectedTrip(trip);
    setIsParticipantsDialogOpen(true);
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTrip && participantsEmail) {
      addParticipantMutation.mutate({
        tripId: selectedTrip.id,
        email: participantsEmail,
      });
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
                form.reset();
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">
                    {selectedTrip ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog
        open={isParticipantsDialogOpen}
        onOpenChange={setIsParticipantsDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Participants</DialogTitle>
            <DialogDescription>
              Add or remove participants from this trip.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddParticipant} className="space-y-4">
            <FormItem>
              <FormLabel>Add Participant by Email</FormLabel>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={participantsEmail}
                  onChange={(e) => setParticipantsEmail(e.target.value)}
                  placeholder="Enter email address"
                />
                <Button type="submit">Add</Button>
              </div>
            </FormItem>
          </form>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Current Participants</h4>
            {participants?.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium">
                    {participant.profiles?.full_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {participant.profiles?.email}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeParticipantMutation.mutate(participant.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

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
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleParticipantsClick(trip)}
              >
                <Users className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleEdit(trip)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDelete(trip.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
