import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function AdditionalServiceForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerPerson, setPricePerPerson] = useState("");
  const [days, setDays] = useState("1");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('additional_services')
        .insert([
          {
            name,
            description,
            price_per_person: parseFloat(pricePerPerson),
            days: parseInt(days),
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Additional service added successfully",
      });

      // Reset form
      setName("");
      setDescription("");
      setPricePerPerson("");
      setDays("1");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
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
          <div>
            <Input
              type="number"
              placeholder="Price per Person"
              value={pricePerPerson}
              onChange={(e) => setPricePerPerson(e.target.value)}
              required
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder="Number of Days"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              required
              min="1"
            />
          </div>
          <Button type="submit" className="w-full">
            Add Service
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}