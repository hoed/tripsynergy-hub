import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AdditionalServiceCardProps {
  tripId: string;
  onAdd: () => void;
}

export function AdditionalServiceCard({ tripId, onAdd }: AdditionalServiceCardProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState(0);
  const [units, setUnits] = useState(1);
  const [days, setDays] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const totalPrice = pricePerUnit * units * days;
      
      const { error } = await supabase
        .from("trip_additionals")
        .insert([{
          trip_id: tripId,
          name,
          description,
          price_per_unit: pricePerUnit,
          units,
          total_price: totalPrice,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Additional service added successfully",
      });

      setName("");
      setDescription("");
      setPricePerUnit(0);
      setUnits(1);
      setDays(1);
      onAdd();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Additional Service</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Service Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="number"
              placeholder="Price per unit"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(Number(e.target.value))}
              required
              min={0}
            />
            <Input
              type="number"
              placeholder="Number of units"
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
              required
              min={1}
            />
            <Input
              type="number"
              placeholder="Number of days"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              required
              min={1}
            />
          </div>
          <div className="text-right">
            <p className="mb-2 text-sm text-muted-foreground">
              Total: ${(pricePerUnit * units * days).toFixed(2)}
            </p>
            <Button type="submit">Add Service</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}