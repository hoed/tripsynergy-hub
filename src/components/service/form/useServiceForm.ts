import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ServiceFormData } from "./types";

export function useServiceForm(serviceType: string, onSuccess: () => void) {
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
      const { data: { user } } = await supabase.auth.getUser();
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
  }, []);

  const calculateTotal = (data: ServiceFormData) => {
    let total = 0;
    if (serviceType === "accommodations") {
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

  return {
    form,
    isSubmitting,
    setIsSubmitting,
    totalPrice,
    isStaff,
    calculateTotal,
  };
}