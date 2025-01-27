import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface ServiceFormData {
  name?: string;
  type?: string;
  description: string;
  price: number;
  location?: string;
}

interface ServiceManagementFormProps {
  serviceType: "accommodations" | "transportation" | "attractions" | "meals";
  onSuccess: () => void;
}

export function ServiceManagementForm({ serviceType, onSuccess }: ServiceManagementFormProps) {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ServiceFormData>({
    defaultValues: {
      name: "",
      type: "",
      description: "",
      price: 0,
      location: "",
    },
  });

  const onSubmit = async (data: ServiceFormData) => {
    if (!session?.user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create services",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const serviceData = {
        ...data,
        created_by: session.user.id,
        ...(serviceType === "accommodations" 
          ? { price_per_night: data.price }
          : { price_per_person: data.price }
        ),
      };

      const { error } = await supabase
        .from(serviceType)
        .insert([serviceData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service created successfully!",
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
        {serviceType !== "transportation" && (
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
        )}

        {serviceType === "transportation" && (
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., Bus, Train, Plane" />
                </FormControl>
              </FormItem>
            )}
          />
        )}

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
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Price {serviceType === "accommodations" ? "(per night)" : "(per person)"}
              </FormLabel>
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

        {(serviceType === "accommodations" || serviceType === "attractions") && (
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Service"}
        </Button>
      </form>
    </Form>
  );
}