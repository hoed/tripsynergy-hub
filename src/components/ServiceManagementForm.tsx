import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { formatToIDR } from "@/utils/currency";

interface ServiceFormData {
  name: string;
  type: string;
  description: string;
  price: number;
  location: string;
  rooms?: number;
  persons?: number;
  days?: number;
}

interface ServiceManagementFormProps {
  serviceType: "accommodations" | "transportation" | "attractions" | "meals";
  onSuccess: () => void;
}

export function ServiceManagementForm({ serviceType, onSuccess }: ServiceManagementFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isStaff, setIsStaff] = useState(false);

  const form = useForm<ServiceFormData>({
    defaultValues: {
      name: "",
      type: "",
      description: "",
      price: 0,
      location: "",
      rooms: 1,
      persons: 1,
      days: 1,
    },
  });

  useEffect(() => {
    const checkStaffStatus = async () => {
      if (!user?.id) return;
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }

      setIsStaff(profile?.role === 'owner' || profile?.role === 'operator');
    };

    checkStaffStatus();
  }, [user]);

  const calculateTotal = (data: ServiceFormData) => {
    let total = 0;
    if (serviceType === "accommodations") {
      // Each room accommodates 2 persons
      const numberOfPersons = (data.rooms || 1) * 2;
      total = data.price * (data.rooms || 1);
    } else if (serviceType === "transportation") {
      total = data.price * (data.persons || 1);
    } else if (serviceType === "attractions" || serviceType === "meals") {
      total = data.price * (data.persons || 1);
    }
    setTotalPrice(total);
    return total;
  };

  const onSubmit = async (data: ServiceFormData) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create services",
      });
      return;
    }

    if (!isStaff) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be a staff member to create services",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let serviceData;
      const total = calculateTotal(data);
      
      if (serviceType === "accommodations") {
        serviceData = {
          name: data.name,
          description: data.description,
          location: data.location,
          price_per_night: data.price,
          created_by: user.id,
        };
      } else if (serviceType === "transportation") {
        serviceData = {
          type: data.type,
          description: data.description,
          price_per_person: data.price,
          created_by: user.id,
        };
      } else {
        serviceData = {
          name: data.name,
          description: data.description,
          price_per_person: data.price,
          created_by: user.id,
          ...(serviceType === "attractions" ? { location: data.location } : {}),
        };
      }

      console.log("Inserting service data:", serviceData);
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
      console.error("Error creating service:", error);
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
                Price {serviceType === "accommodations" ? "(per room per night)" : "(per person)"}
              </FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => {
                    field.onChange(parseFloat(e.target.value));
                    calculateTotal({ ...form.getValues(), price: parseFloat(e.target.value) });
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {serviceType === "accommodations" && (
          <FormField
            control={form.control}
            name="rooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Rooms (each room fits 2 persons)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1}
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseInt(e.target.value));
                      calculateTotal({ ...form.getValues(), rooms: parseInt(e.target.value) });
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {serviceType === "transportation" && (
          <FormField
            control={form.control}
            name="days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Days</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1}
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseInt(e.target.value));
                      calculateTotal({ ...form.getValues(), days: parseInt(e.target.value) });
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {(serviceType === "attractions" || serviceType === "meals") && (
          <FormField
            control={form.control}
            name="persons"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Persons</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1}
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseInt(e.target.value));
                      calculateTotal({ ...form.getValues(), persons: parseInt(e.target.value) });
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

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

        <div className="text-lg font-semibold">
          Total Price: {formatToIDR(totalPrice)}
        </div>

        <Button type="submit" disabled={isSubmitting || !isStaff}>
          {isSubmitting ? "Creating..." : "Create Service"}
        </Button>
      </form>
    </Form>
  );
}