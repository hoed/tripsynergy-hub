import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormData } from "./types";

interface ServiceFormFieldsProps {
  form: UseFormReturn<ServiceFormData>;
  serviceType: "accommodations" | "transportation" | "attractions" | "meals";
  onPriceChange: (value: number) => void;
}

export function ServiceFormFields({ form, serviceType, onPriceChange }: ServiceFormFieldsProps) {
  return (
    <>
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
                  onPriceChange(parseFloat(e.target.value));
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
}