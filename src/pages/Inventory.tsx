import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Search, Package, TrendingUp, AlertCircle, Scan } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { HelpTooltip } from "@/components/HelpTooltip";

const Inventory = () => {
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
      total_orders: 25
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
      total_orders: 45
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
      total_orders: 78
    }
  ]);

  // Hardcoded inventory items
  const [items, setItems] = useState<any[]>([
    {
      id: "1",
      sku: "ELC-001",
      name: "Circuit Breaker 32A",
      description: "Miniature Circuit Breaker for electrical protection",
      category: "Electrical",
      current_quantity: 150,
      reorder_point: 30,
      optimal_quantity: 200,
      unit_cost: 450.00,
      barcode: "BC100000001",
      location: "Warehouse A - Electrical Section",
      hsn_code: "8535",
      gst_rate: 18.00,
      supplier_id: "1",
      suppliers: { name: "VASUMATHI ELECTRONIC" },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "2",
      sku: "ELC-002",
      name: "Electrical Switch 16A",
      description: "Single pole electrical switch with LED indicator",
      category: "Electrical",
      current_quantity: 75,
      reorder_point: 25,
      optimal_quantity: 150,
      unit_cost: 180.00,
      barcode: "BC100000002",
      location: "Warehouse A - Electrical Section",
      hsn_code: "8536",
      gst_rate: 18.00,
      supplier_id: "1",
      suppliers: { name: "VASUMATHI ELECTRONIC" },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "3",
      sku: "AUTO-001",
      name: "Brake Pad Set",
      description: "Ceramic brake pads for front wheels",
      category: "Automotive",
      current_quantity: 60,
      reorder_point: 20,
      optimal_quantity: 100,
      unit_cost: 2200.00,
      barcode: "BC200000001",
      location: "Warehouse B - Automotive Section",
      hsn_code: "8708",
      gst_rate: 28.00,
      supplier_id: "2",
      suppliers: { name: "TechParts Supply Co." },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "4",
      sku: "CBL-001",
      name: "Power Cable 2.5 sqmm",
      description: "Copper power cable for electrical wiring",
      category: "Cables",
      current_quantity: 500,
      reorder_point: 100,
      optimal_quantity: 800,
      unit_cost: 85.00,
      barcode: "BC300000001",
      location: "Warehouse C - Cable Section",
      hsn_code: "8544",
      gst_rate: 18.00,
      supplier_id: "3",
      suppliers: { name: "Global Components Ltd." },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "5",
      sku: "WR-001",
      name: "Copper Wire 1.0 sqmm",
      description: "Single core copper wire for electrical connections",
      category: "Wires",
      current_quantity: 600,
      reorder_point: 150,
      optimal_quantity: 1000,
      unit_cost: 35.00,
      barcode: "BC400000001",
      location: "Warehouse C - Wire Section",
      hsn_code: "8544",
      gst_rate: 18.00,
      supplier_id: "1",
      suppliers: { name: "VASUMATHI ELECTRONIC" },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    category: "",
    barcode: "",
    current_quantity: 0,
    reorder_point: 10,
    optimal_quantity: 100,
    unit_cost: 0,
    supplier_id: "",
    location: "",
  });

  useEffect(() => {
    console.log('Inventory component mounted with hardcoded data');
  }, []);


  const handleScan = (barcode: string) => {
    const foundItem = items.find(item => item.barcode === barcode);
    if (foundItem) {
      toast.success(`Found: ${foundItem.name}`);
      setSearchTerm(foundItem.name);
    } else {
      toast.info(`No item found with barcode: ${barcode}. Add it as a new item?`);
      setFormData({ ...formData, barcode });
      setIsAddDialogOpen(true);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('Adding new inventory item:', formData);

    // Find supplier name for the new item
    const selectedSupplier = suppliers.find(s => s.id === formData.supplier_id);
    
    // Add new item to the hardcoded array
    const newItem = {
      id: (items.length + 1).toString(),
      ...formData,
      hsn_code: "",
      gst_rate: 18.00,
      suppliers: { name: selectedSupplier?.name || "" },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setItems([...items, newItem]);
    toast.success("Item added successfully");
    setIsAddDialogOpen(false);
    setFormData({
      name: "",
      sku: "",
      description: "",
      category: "",
      barcode: "",
      current_quantity: 0,
      reorder_point: 10,
      optimal_quantity: 100,
      unit_cost: 0,
      supplier_id: "",
      location: "",
    });
    setIsLoading(false);
  };

  const getStockStatus = (item: any) => {
    const percentage = (item.current_quantity / item.optimal_quantity) * 100;
    if (percentage <= 25) return { label: "Critical", variant: "destructive" as const };
    if (percentage <= 50) return { label: "Low", variant: "secondary" as const };
    if (percentage <= 75) return { label: "Medium", variant: "outline" as const };
    return { label: "Good", variant: "default" as const };
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
            <HelpTooltip content="Manage your inventory items. Use barcode scanner for quick lookup or add new items manually." />
          </div>
          <p className="text-muted-foreground">Track and manage your inventory items</p>
        </div>
        <div className="flex gap-2">
          <BarcodeScanner onScan={handleScan} />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-primary-glow">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
              <DialogDescription>Enter the details of the new inventory item</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_quantity">Current Quantity *</Label>
                  <Input
                    id="current_quantity"
                    type="number"
                    min="0"
                    value={formData.current_quantity}
                    onChange={(e) => setFormData({ ...formData, current_quantity: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reorder_point">Reorder Point *</Label>
                  <Input
                    id="reorder_point"
                    type="number"
                    min="0"
                    value={formData.reorder_point}
                    onChange={(e) => setFormData({ ...formData, reorder_point: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="optimal_quantity">Optimal Quantity *</Label>
                  <Input
                    id="optimal_quantity"
                    type="number"
                    min="0"
                    value={formData.optimal_quantity}
                    onChange={(e) => setFormData({ ...formData, optimal_quantity: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit_cost">Unit Cost ($) *</Label>
                  <Input
                    id="unit_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Select
                    value={formData.supplier_id}
                    onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Item"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by name, SKU, or category..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          const status = getStockStatus(item);
          return (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">SKU:</span>
                  <span className="font-medium">{item.sku}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-semibold">{item.current_quantity} / {item.optimal_quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Unit Cost:</span>
                  <span className="font-medium">${item.unit_cost}</span>
                </div>
                {item.category && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">{item.category}</span>
                  </div>
                )}
                {item.suppliers && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Supplier:</span>
                    <span className="font-medium">{item.suppliers.name}</span>
                  </div>
                )}
                {item.current_quantity <= item.reorder_point && (
                  <div className="flex items-center gap-2 text-sm text-warning pt-2 border-t">
                    <AlertCircle className="h-4 w-4" />
                    <span>Below reorder point</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No inventory items found</p>
            <p className="text-sm text-muted-foreground mb-6">
              {searchTerm ? "Try adjusting your search" : "Get started by adding your first item"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Item
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Inventory;
