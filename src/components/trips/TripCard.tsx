import { Edit, Trash2, DollarSign, Percent } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 mt-auto">
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