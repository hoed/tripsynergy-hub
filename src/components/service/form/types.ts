export interface ServiceFormData {
  name: string;
  type: string;
  description: string;
  price: number;
  location: string;
  rooms?: number;
  persons?: number;
  days?: number;
}