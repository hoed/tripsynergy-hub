import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { calculateAccommodationPrice, calculatePerPersonPrice } from "@/utils/bookingCalculations";

interface SummaryItem {
  name: string;
  price: number;
  type: string;
  bookingId?: string;
  profitPercentage?: number;
  startDate: string;
  endDate: string;
}

export function useBookingSummary() {
  const [summaryItems, setSummaryItems] = useState<SummaryItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [totalWithProfit, setTotalWithProfit] = useState<number>(0);
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const { user } = useAuth();
  const { toast } = useToast();

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

  const fetchBookingsAndCalculate = async () => {
    if (!user) return;

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        client_id,
        start_date,
        end_date,
        number_of_people,
        total_price,
        profit_percentage,
        accommodations (name, price_per_night),
        transportation (type, price_per_person),
        attractions (name, price_per_person),
        meals (name, price_per_person)
      `)
      .eq('client_id', user.id);

    if (error) {
      console.error('Error fetching bookings:', error);
      return;
    }

    if (!bookings || bookings.length === 0) {
      setSummaryItems([]);
      setTotalPrice(0);
      setTotalWithProfit(0);
      return;
    }

    const items: SummaryItem[] = [];
    let total = 0;

    bookings.forEach(booking => {
      let itemPrice = 0;
      let itemName = '';
      let itemType = '';
      
      if (booking.accommodations) {
        const accommodationPrice = calculateAccommodationPrice(
          booking.accommodations,
          booking.start_date,
          booking.end_date
        );
        if (accommodationPrice) {
          itemPrice = accommodationPrice.price;
          itemName = accommodationPrice.name;
          itemType = 'Accommodation';
        }
      }

      if (booking.transportation) {
        const transportationPrice = calculatePerPersonPrice(
          booking.transportation,
          booking.number_of_people,
          'Transportation'
        );
        if (transportationPrice) {
          itemPrice = transportationPrice.price;
          itemName = transportationPrice.name;
          itemType = 'Transportation';
        }
      }

      if (booking.attractions) {
        const attractionPrice = calculatePerPersonPrice(
          booking.attractions,
          booking.number_of_people,
          'Attraction'
        );
        if (attractionPrice) {
          itemPrice = attractionPrice.price;
          itemName = attractionPrice.name;
          itemType = 'Attraction';
        }
      }

      if (booking.meals) {
        const mealPrice = calculatePerPersonPrice(
          booking.meals,
          booking.number_of_people,
          'Meal'
        );
        if (mealPrice) {
          itemPrice = mealPrice.price;
          itemName = mealPrice.name;
          itemType = 'Meal';
        }
      }

      if (itemName) {
        items.push({
          name: itemName,
          price: itemPrice,
          type: itemType,
          bookingId: booking.id,
          profitPercentage: booking.profit_percentage,
          startDate: booking.start_date,
          endDate: booking.end_date
        });
        total += itemPrice;
      }
    });

    setSummaryItems(items);
    setTotalPrice(total);
    calculateTotalWithProfit(items);
  };

  const calculateTotalWithProfit = (items: SummaryItem[]) => {
    const totalWithProfit = items.reduce((acc, item) => {
      const itemWithProfit = item.price * (1 + (item.profitPercentage || 0) / 100);
      return acc + itemWithProfit;
    }, 0);
    setTotalWithProfit(totalWithProfit);
  };

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