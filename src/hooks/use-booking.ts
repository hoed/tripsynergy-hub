import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { useBookingData } from "./booking/useBookingData";

export function useBookingSummary() {
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    summaryItems,
    totalPrice,
    totalWithProfit,
    fetchBookingsAndCalculate
  } = useBookingData(user?.id);

  const checkStaffStatus = useCallback(async () => {
    if (!user) {
      setIsStaff(false);
      return;
    }
    
    try {
      const { data: role, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;

      setIsStaff(role?.role === 'owner' || role?.role === 'operator');
    } catch (error) {
      console.error('Error in checkStaffStatus:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check staff status"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    checkStaffStatus();
  }, [checkStaffStatus]);

  const handleProfitUpdate = async (bookingId: string, newProfit: number) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ profit_percentage: newProfit })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profit percentage updated successfully",
      });
      fetchBookingsAndCalculate();
    } catch (error) {
      console.error('Error in handleProfitUpdate:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profit percentage"
      });
    }
  };

  const handleDeleteItem = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      fetchBookingsAndCalculate();
    } catch (error) {
      console.error('Error in handleDeleteItem:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete item"
      });
    }
  };

  return {
    summaryItems,
    totalPrice,
    totalWithProfit,
    isStaff,
    isLoading,
    handleProfitUpdate,
    handleDeleteItem
  };
}