import { SummaryItem } from "./types";
import { calculateAccommodationPrice, calculatePerPersonPrice } from "@/utils/bookingCalculations";

export function useBookingCalculations() {
  const calculateTotalPrice = (items: SummaryItem[]) => {
    return items.reduce((acc, item) => acc + item.price, 0);
  };

  const calculateTotalWithProfit = (items: SummaryItem[]) => {
    return items.reduce((acc, item) => {
      const itemWithProfit = item.price * (1 + (item.profitPercentage || 0) / 100);
      return acc + itemWithProfit;
    }, 0);
  };

  const calculateItemPrice = (booking: any) => {
    if (booking.accommodations) {
      return calculateAccommodationPrice(
        booking.accommodations,
        booking.start_date,
        booking.end_date
      );
    }

    if (booking.transportation) {
      return calculatePerPersonPrice(
        booking.transportation,
        booking.number_of_people,
        'Transportation'
      );
    }

    if (booking.attractions) {
      return calculatePerPersonPrice(
        booking.attractions,
        booking.number_of_people,
        'Attraction'
      );
    }

    if (booking.meals) {
      return calculatePerPersonPrice(
        booking.meals,
        booking.number_of_people,
        'Meal'
      );
    }

    return null;
  };

  return {
    calculateTotalPrice,
    calculateTotalWithProfit,
    calculateItemPrice,
  };
}