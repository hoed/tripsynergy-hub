import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormData } from "./types";

interface ServiceQuantityFieldsProps {
  form: UseFormReturn<ServiceFormData>;
  serviceType: "accommodations" | "transportation" | "attractions" | "meals";
  onQuantityChange: (value: number) => void;
}

export function ServiceQuantityFields({ form, serviceType, onQuantityChange }: ServiceQuantityFieldsProps) {
  return (
    <>
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
                    onQuantityChange(parseInt(e.target.value));
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
                    onQuantityChange(parseInt(e.target.value));
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
                    onQuantityChange(parseInt(e.target.value));
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}
    </>
  );
}