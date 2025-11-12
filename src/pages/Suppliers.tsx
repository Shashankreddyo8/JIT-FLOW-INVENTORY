import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, TruckIcon, Star, Phone, Mail, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const Suppliers = () => {
  // Hardcoded suppliers data
  const [suppliers, setSuppliers] = useState<any[]>([
    {
      id: "1",
      name: "VASUMATHI ELECTRONIC",
      contact_person: "VASUNDHARA",
      email: "VASU890@GMAIL.COM",
      phone: "9877655",
      address: "EAST ANDHERI MUMBAI MAHARASTRA",
      rating: 4.5,
      average_delivery_days: 3,
      total_orders: 25,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      gst_number: "27AABCU9603R1Z5",
      pan_number: "AABCU9603R",
      state: "Maharashtra",
      pincode: "400069"
    },
    {
      id: "2",
      name: "TechParts Supply Co.",
      contact_person: "John Anderson",
      email: "john@techparts.com",
      phone: "+1-555-0101",
      address: "123 Industrial Blvd, Austin, TX",
      rating: 4.50,
      average_delivery_days: 7,
      total_orders: 45,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      gst_number: "",
      pan_number: "",
      state: "",
      pincode: ""
    },
    {
      id: "3",
      name: "Global Components Ltd.",
      contact_person: "Sarah Chen",
      email: "sarah@globalcomp.com",
      phone: "+1-555-0102",
      address: "456 Trade Ave, San Jose, CA",
      rating: 4.80,
      average_delivery_days: 5,
      total_orders: 78,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      gst_number: "",
      pan_number: "",
      state: "",
      pincode: ""
    },
    {
      id: "4",
      name: "FastShip Logistics",
      contact_person: "Mike Rodriguez",
      email: "mike@fastship.com",
      phone: "+1-555-0103",
      address: "789 Supply St, Chicago, IL",
      rating: 4.20,
      average_delivery_days: 9,
      total_orders: 32,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      gst_number: "",
      pan_number: "",
      state: "",
      pincode: ""
    }
  ]);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    console.log('Suppliers component mounted with hardcoded data');
  }, []);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('Adding new supplier:', formData);

    // Add new supplier to the hardcoded array
    const newSupplier = {
      id: (suppliers.length + 1).toString(),
      ...formData,
      rating: 4.0,
      average_delivery_days: 5,
      total_orders: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      gst_number: "",
      pan_number: "",
      state: "",
      pincode: ""
    };

    setSuppliers([...suppliers, newSupplier]);
    toast.success("Supplier added successfully");
    setIsAddDialogOpen(false);
    setFormData({
      name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
    });
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supplier Management</h1>
          <p className="text-muted-foreground">Manage and track supplier relationships</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-primary-glow">
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
              <DialogDescription>Enter the supplier's information</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Supplier"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>


      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <TruckIcon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{supplier.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {supplier.contact_person && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="font-medium">{supplier.contact_person}</span>
                </div>
              )}
              {supplier.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{supplier.email}</span>
                </div>
              )}
              {supplier.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{supplier.phone}</span>
                </div>
              )}
              {supplier.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="font-medium">{supplier.address}</span>
                </div>
              )}
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-semibold">{supplier.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Orders</span>
                  <span className="font-semibold">{supplier.total_orders}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg Delivery</span>
                  <span className="font-semibold">{supplier.average_delivery_days} days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {suppliers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <TruckIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No suppliers yet</p>
            <p className="text-sm text-muted-foreground mb-6">
              Add your first supplier to get started
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Supplier
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Suppliers;
