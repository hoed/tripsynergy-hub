import { useState } from "react";
import { Edit, Trash2, DollarSign, Percent, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AdditionalServiceCard } from "./AdditionalServiceCard";
import { TripSummaryCard } from "./TripSummaryCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TripCardProps {
  trip: {
    id: string;
    title: string;
    description: string | null;
    start_date: string;
    end_date: string;
    status: string | null;
    profit_percentage: number | null;
    total_price: number | null;
  };
  onEdit: (trip: any) => void;
  onDelete: (id: string) => void;
}

export const TripCard = ({ trip, onEdit, onDelete }: TripCardProps) => {
  const [showAdditionalsDialog, setShowAdditionalsDialog] = useState(false);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: additionals } = useQuery({
    queryKey: ["trip-additionals", trip.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trip_additionals")
        .select("*")
        .eq("trip_id", trip.id);

      if (error) throw error;
      return data;
    },
  });

  const handleAdditionalsSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["trip-additionals", trip.id] });
    setShowAdditionalsDialog(false);
  };

  return (
    <Card className="flex flex-col">
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
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">Total Price:</span>{" "}
            {trip.total_price ? `$${trip.total_price.toFixed(2)}` : "N/A"}
          </div>
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4" />
            <span className="font-medium">Profit:</span>{" "}
            {trip.profit_percentage ? `${trip.profit_percentage}%` : "N/A"}
          </div>

          {additionals && additionals.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Additional Items:</h4>
              <ul className="space-y-2">
                {additionals.map((item) => (
                  <li key={item.id} className="flex justify-between items-center">
                    <span>{item.name}</span>
                    <span>${item.total_price.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 mt-auto">
        <Dialog open={showAdditionalsDialog} onOpenChange={setShowAdditionalsDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Additional Item</DialogTitle>
            </DialogHeader>
            <AdditionalServiceCard
              tripId={trip.id}
              onAdd={handleAdditionalsSuccess}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              View Summary
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Trip Summary</DialogTitle>
            </DialogHeader>
            <TripSummaryCard tripId={trip.id} />
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onEdit(trip)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDelete(trip.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};