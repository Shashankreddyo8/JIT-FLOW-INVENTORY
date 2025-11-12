import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, ShoppingCart, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useOrderStore, Order } from "@/lib/orderStore";

const Orders = () => {
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
  const [inventoryItems, setInventoryItems] = useState<any[]>([
    {
      id: "1",
      sku: "ELC-001",
      name: "Circuit Breaker 32A",
      description: "Miniature Circuit Breaker for electrical protection",
      category: "Electrical",
      current_quantity: 150,
      unit_cost: 450.00,
    },
    {
      id: "2",
      sku: "ELC-002",
      name: "Electrical Switch 16A",
      description: "Single pole electrical switch with LED indicator",
      category: "Electrical",
      current_quantity: 75,
      unit_cost: 180.00,
    },
    {
      id: "3",
      sku: "AUTO-001",
      name: "Brake Pad Set",
      description: "Ceramic brake pads for front wheels",
      category: "Automotive",
      current_quantity: 60,
      unit_cost: 2200.00,
    },
    {
      id: "4",
      sku: "CBL-001",
      name: "Power Cable 2.5 sqmm",
      description: "Copper power cable for electrical wiring",
      category: "Cables",
      current_quantity: 500,
      unit_cost: 85.00,
    },
    {
      id: "5",
      sku: "WR-001",
      name: "Copper Wire 1.0 sqmm",
      description: "Single core copper wire for electrical connections",
      category: "Wires",
      current_quantity: 600,
      unit_cost: 35.00,
    }
  ]);

  // Use shared order store
  const { orders, addOrder } = useOrderStore();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    order_number: "",
    supplier_id: "",
    expected_delivery_date: "",
    notes: "",
    items: [{ inventory_item_id: "", quantity: 0, unit_price: 0 }],
  });

  useEffect(() => {
    console.log('Orders component mounted with hardcoded data');
  }, []);


  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('Adding new order:', formData);

    try {
      const totalAmount = formData.items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      );

      // Find supplier name for the new order
      const selectedSupplier = suppliers.find(s => s.id === formData.supplier_id);
      
      // Create order items with inventory item names
      const orderItems = formData.items.map((item, index) => {
        const inventoryItem = inventoryItems.find(inv => inv.id === item.inventory_item_id);
        return {
          id: (orders.length * 10 + index + 1).toString(),
          inventory_item_id: item.inventory_item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price,
          inventory_items: { name: inventoryItem?.name || "Unknown Item" }
        };
      });

      // Add new order to the shared store
      const newOrder: Order = {
        id: (orders.length + 1).toString(),
        order_number: formData.order_number,
        supplier_id: formData.supplier_id,
        suppliers: { name: selectedSupplier?.name || "No Supplier" },
        status: "pending",
        total_amount: totalAmount,
        expected_delivery_date: formData.expected_delivery_date || null,
        notes: formData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        order_items: orderItems
      };

      addOrder(newOrder);
      toast.success("Order created successfully");
      setIsAddDialogOpen(false);
      setFormData({
        order_number: "",
        supplier_id: "",
        expected_delivery_date: "",
        notes: "",
        items: [{ inventory_item_id: "", quantity: 0, unit_price: 0 }],
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create order");
    } finally {
      setIsLoading(false);
    }
  };

  const addOrderItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { inventory_item_id: "", quantity: 0, unit_price: 0 }],
    });
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    const nextItem = { ...newItems[index], [field]: value } as any;

    // Auto-fill unit price when selecting an inventory item
    if (field === "inventory_item_id") {
      const inv = inventoryItems.find((i) => i.id === value);
      if (inv) {
        nextItem.unit_price = inv.unit_cost ?? nextItem.unit_price ?? 0;
        // Default quantity to 1 if empty
        if (!nextItem.quantity || isNaN(nextItem.quantity)) {
          nextItem.quantity = 1;
        }
      }
    }

    // Guard against NaN
    if (field === "quantity" && (isNaN(value) || value === null)) {
      nextItem.quantity = 0;
    }
    if (field === "unit_price" && (isNaN(value) || value === null)) {
      nextItem.unit_price = 0;
    }

    newItems[index] = nextItem;
    setFormData({ ...formData, items: newItems });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "default";
      case "cancelled":
        return "destructive";
      case "in_transit":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
          <p className="text-muted-foreground">Track and manage purchase orders</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-primary-glow">
              <Plus className="mr-2 h-4 w-4" />
              Create Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
              <DialogDescription>Enter the details for the new purchase order</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddOrder} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order_number">Order Number *</Label>
                  <Input
                    id="order_number"
                    value={formData.order_number}
                    onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
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
                <div className="space-y-2">
                  <Label htmlFor="expected_delivery">Expected Delivery Date</Label>
                  <Input
                    id="expected_delivery"
                    type="date"
                    value={formData.expected_delivery_date}
                    onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Order Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addOrderItem}>
                    <Plus className="mr-2 h-3 w-3" />
                    Add Item
                  </Button>
                </div>
                {formData.items.map((item, index) => {
                  const selected = inventoryItems.find(i => i.id === item.inventory_item_id);
                  const total = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
                  return (
                    <div key={index} className="grid grid-cols-3 gap-2 p-4 border rounded">
                      <Select
                        value={item.inventory_item_id}
                        onValueChange={(value) => updateOrderItem(index, "inventory_item_id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryItems.map((invItem) => (
                            <SelectItem key={invItem.id} value={invItem.id}>
                              {invItem.name} ({invItem.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Quantity"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, "quantity", parseInt(e.target.value))}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Unit Price"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) => updateOrderItem(index, "unit_price", parseFloat(e.target.value))}
                        />
                        <div className="flex items-center justify-end text-sm font-semibold">
                          ₹{total.toLocaleString()}
                        </div>
                      </div>
                      {selected && (
                        <div className="col-span-3 text-xs text-muted-foreground -mt-2">
                          Default price: ₹{(selected.unit_cost ?? 0).toLocaleString()} • Current line total: ₹{total.toLocaleString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Live order total */}
              <div className="flex items-center justify-end pr-1">
                <div className="text-sm text-muted-foreground mr-2">Order Total:</div>
                <div className="text-lg font-bold">
                  ₹{
                    formData.items.reduce((sum, it) => sum + ((Number(it.quantity)||0) * (Number(it.unit_price)||0)), 0).toLocaleString()
                  }
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Order"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{order.order_number}</CardTitle>
                      {order.isAutoGenerated && (
                        <Badge variant="secondary" className="text-xs">
                          Auto
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.suppliers?.name || "No supplier"}
                      {order.autoOrderReason && ` • ${order.autoOrderReason}`}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Amount</span>
                  <p className="font-semibold text-lg">₹{order.total_amount.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Items</span>
                  <p className="font-semibold">{order.order_items?.length || 0}</p>
                </div>
                {order.expected_delivery_date && (
                  <div>
                    <span className="text-muted-foreground">Expected Delivery</span>
                    <p className="font-semibold flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(order.expected_delivery_date), "MMM dd, yyyy")}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Created</span>
                  <p className="font-semibold">
                    {format(new Date(order.created_at), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
              {order.order_items && order.order_items.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Items:</p>
                  <div className="space-y-1">
                    {order.order_items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.inventory_items?.name}</span>
                        <span className="text-muted-foreground">
                          {item.quantity} × ₹{item.unit_price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No orders yet</p>
            <p className="text-sm text-muted-foreground mb-6">
              Get started by creating your first order
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Order
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Orders;
