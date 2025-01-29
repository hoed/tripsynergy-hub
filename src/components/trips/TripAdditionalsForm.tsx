import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";

interface TripAdditionalFormData {
  name: string;
  description: string;
  price_per_unit: number;
  units: number;
}

interface TripAdditionalsFormProps {
  tripId: string;
  onSuccess: () => void;
}

export function TripAdditionalsForm({ tripId, onSuccess }: TripAdditionalsFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TripAdditionalFormData>({
    defaultValues: {
      name: "",
      description: "",
      price_per_unit: 0,
      units: 1,
    },
  });

  const onSubmit = async (data: TripAdditionalFormData) => {
    setIsSubmitting(true);

    try {
      const totalPrice = data.price_per_unit * data.units;

      const { error } = await supabase
        .from("trip_additionals")
        .insert([
          {
            trip_id: tripId,
            name: data.name,
            description: data.description,
            price_per_unit: data.price_per_unit,
            units: data.units,
            total_price: totalPrice,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Additional item added successfully!",
      });
      
      form.reset();
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price_per_unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price per Unit</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="units"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Units</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          <Plus className="h-4 w-4 mr-2" />
          {isSubmitting ? "Adding..." : "Add Additional Item"}
        </Button>
      </form>
    </Form>
  );
}