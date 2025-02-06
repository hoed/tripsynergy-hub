import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { formatToIDR } from "@/utils/currency";
import { ServiceFormFields } from "./service/form/ServiceFormFields";
import { ServiceQuantityFields } from "./service/form/ServiceQuantityFields";
import { useServiceForm } from "./service/form/useServiceForm";

interface ServiceManagementFormProps {
  serviceType: "accommodations" | "transportation" | "attractions" | "meals";
  onSuccess: () => void;
}

export function ServiceManagementForm({ serviceType, onSuccess }: ServiceManagementFormProps) {
  const { user } = useAuth();
  const { 
    form, 
    isSubmitting, 
    setIsSubmitting, 
    totalPrice, 
    isStaff,
    calculateTotal 
  } = useServiceForm(serviceType, onSuccess);

  const onSubmit = async (data: any) => {
    if (!user?.id || !isStaff) return;
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

      const { error } = await supabase
        .from(serviceType)
        .insert([serviceData]);

      if (error) throw error;

      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error("Error creating service:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ServiceFormFields
          form={form}
          serviceType={serviceType}
          onPriceChange={(price) => calculateTotal({ ...form.getValues(), price })}
        />
        
        <ServiceQuantityFields
          form={form}
          serviceType={serviceType}
          onQuantityChange={(quantity) => {
            const values = form.getValues();
            if (serviceType === "accommodations") {
              calculateTotal({ ...values, rooms: quantity });
            } else if (serviceType === "transportation") {
              calculateTotal({ ...values, days: quantity });
            } else {
              calculateTotal({ ...values, persons: quantity });
            }
          }}
        />

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