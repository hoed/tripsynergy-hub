import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { useBookingData } from "./booking/useBookingData";

export function useBookingSummary() {
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    summaryItems,
    totalPrice,
    totalWithProfit,
    fetchBookingsAndCalculate
  } = useBookingData(user?.id);

  useEffect(() => {
    const checkStaffStatus = async () => {
      if (!user) return;
      const { data: role, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }

      setIsStaff(role?.role === 'owner' || role?.role === 'operator');
    };
    checkStaffStatus();
  }, [user]);

  const handleProfitUpdate = async (bookingId: string, newProfit: number) => {
    const { error } = await supabase
      .from('bookings')
      .update({ profit_percentage: newProfit })
      .eq('id', bookingId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profit percentage",
      });
    } else {
      toast({
        title: "Success",
        description: "Profit percentage updated successfully",
      });
      fetchBookingsAndCalculate();
    }
  };

  const handleDeleteItem = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete item",
      });
    } else {
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      fetchBookingsAndCalculate();
    }
  };

  useEffect(() => {
    fetchBookingsAndCalculate();

    const channel = supabase
      .channel('booking-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          fetchBookingsAndCalculate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    summaryItems,
    totalPrice,
    totalWithProfit,
    isStaff,
    handleProfitUpdate,
    handleDeleteItem
  };
}