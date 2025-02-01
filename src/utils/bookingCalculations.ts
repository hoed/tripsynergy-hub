interface ServicePrice {
  name: string;
  price: number;
  type: string;
}

export const calculateAccommodationPrice = (
  accommodation: { name: string; price_per_night: number } | null,
  startDate: string,
  endDate: string
): ServicePrice | null => {
  if (!accommodation) return null;
  
  const days = Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return {
    name: accommodation.name,
    price: accommodation.price_per_night * days,
    type: 'Accommodation'
  };
};

export const calculatePerPersonPrice = (
  service: { name?: string; type?: string; price_per_person: number } | null,
  numberOfPeople: number,
  serviceType: string
): ServicePrice | null => {
  if (!service) return null;
  
  return {
    name: service.name || service.type || '',
    price: service.price_per_person * numberOfPeople,
    type: serviceType
  };
};