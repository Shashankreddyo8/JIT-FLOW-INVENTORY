import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useOrderStore, Order } from "@/lib/orderStore";
import { 
  Zap, 
  ShoppingCart, 
  Clock, 
  Settings, 
  AlertTriangle, 
  CheckCircle,
  Package,
  Calendar,
  TrendingUp,
  BarChart3,
  Play,
  Pause
} from "lucide-react";

const AutoOrders = () => {
  // Hardcoded data matching other pages
  const suppliers = [
    {
      id: "1",
      name: "VASUMATHI ELECTRONIC",
      rating: 4.5,
      average_delivery_days: 3,
      total_orders: 25
    },
    {
      id: "2", 
      name: "TechParts Supply Co.",
      rating: 4.50,
      average_delivery_days: 7,
      total_orders: 45
    },
    {
      id: "3",
      name: "Global Components Ltd.",
      rating: 4.80,
      average_delivery_days: 5,
      total_orders: 78
    }
  ];

  const inventoryItems = [
    {
      id: "1",
      sku: "ELC-001",
      name: "Circuit Breaker 32A",
      current_quantity: 150,
      reorder_point: 30,
      optimal_quantity: 200,
      unit_cost: 450.00,
      supplier_id: "1",
      suppliers: { name: "VASUMATHI ELECTRONIC" },
    },
    {
      id: "2",
      sku: "ELC-002", 
      name: "Electrical Switch 16A",
      current_quantity: 75,
      reorder_point: 25,
      optimal_quantity: 150,
      unit_cost: 180.00,
      supplier_id: "1",
      suppliers: { name: "VASUMATHI ELECTRONIC" },
    },
    {
      id: "3",
      sku: "AUTO-001",
      name: "Brake Pad Set",
      current_quantity: 60,
      reorder_point: 20,
      optimal_quantity: 100,
      unit_cost: 2200.00,
      supplier_id: "2",
      suppliers: { name: "TechParts Supply Co." },
    },
    {
      id: "4",
      sku: "CBL-001",
      name: "Power Cable 2.5 sqmm",
      current_quantity: 500,
      reorder_point: 100,
      optimal_quantity: 800,
      unit_cost: 85.00,
      supplier_id: "3",
      suppliers: { name: "Global Components Ltd." },
    },
    {
      id: "5",
      sku: "WR-001",
      name: "Copper Wire 1.0 sqmm",
      current_quantity: 600,
      reorder_point: 150,
      optimal_quantity: 1000,
      unit_cost: 35.00,
      supplier_id: "1",
      suppliers: { name: "VASUMATHI ELECTRONIC" },
    }
  ];

  const [autoOrderEnabled, setAutoOrderEnabled] = useState(true);
  const [reorderSettings, setReorderSettings] = useState({
    safetyStockMultiplier: 1.5,
    leadTimeBuffer: 2,
    minOrderAmount: 1000,
    autoApproveThreshold: 5000,
    checkInterval: 1, // minutes - changed to 1 minute for auto generation
  });
  const [autoOrderHistory, setAutoOrderHistory] = useState<any[]>([]);
  const [scheduledOrders, setScheduledOrders] = useState<any[]>([]);
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());
  const [autoOrderCount, setAutoOrderCount] = useState(0);
  
  // Use shared order store
  const { addOrder } = useOrderStore();

  // Check for items that need automatic reordering
  const checkLowStockItems = () => {
    return inventoryItems.filter(item => {
      const reorderPoint = item.reorder_point * reorderSettings.safetyStockMultiplier;
      return item.current_quantity <= reorderPoint;
    });
  };

  // Calculate optimal reorder quantity
  const calculateReorderQuantity = (item: any) => {
    const leadTime = item.suppliers?.average_delivery_days || 7;
    const dailyDemand = item.optimal_quantity / 30; // Simplified daily demand
    const safetyStock = item.reorder_point * reorderSettings.safetyStockMultiplier;
    const leadTimeDemand = dailyDemand * (leadTime + reorderSettings.leadTimeBuffer);
    
    return Math.ceil(Math.max(
      item.optimal_quantity - item.current_quantity + safetyStock,
      leadTimeDemand
    ));
  };

  // Create automatic order - always creates an order every minute
  const createAutoOrder = (forceCreate = false) => {
    // For demo purposes, always create an order every minute
    // Select random items to create orders for
    const randomItems = inventoryItems.slice(0, Math.floor(Math.random() * 3) + 1); // 1-3 random items
    
    if (!forceCreate && randomItems.length === 0) return;

    // Group items by supplier
    const ordersBySupplier: { [key: string]: any[] } = {};
    
    randomItems.forEach(item => {
      const supplierId = item.supplier_id || "1";
      if (!ordersBySupplier[supplierId]) {
        ordersBySupplier[supplierId] = [];
      }
      ordersBySupplier[supplierId].push({
        ...item,
        reorderQuantity: Math.floor(Math.random() * 50) + 10 // Random quantity for demo
      });
    });

    // Create orders for each supplier
    Object.entries(ordersBySupplier).forEach(([supplierId, supplierItems]) => {
      const supplier = suppliers.find(s => s.id === supplierId);
      if (!supplier) return;

      const totalAmount = supplierItems.reduce((sum, item) => 
        sum + (item.reorderQuantity * item.unit_cost), 0
      );
      
      const currentCount = autoOrderCount + 1;
      setAutoOrderCount(currentCount);

      const newOrder: Order = {
        id: `auto-${Date.now()}-${supplierId}`,
        order_number: `AUTO-${new Date().getFullYear()}-${String(currentCount).padStart(3, '0')}`,
        supplier_id: supplierId,
        suppliers: { name: supplier.name },
        status: totalAmount <= reorderSettings.autoApproveThreshold ? "pending" : "draft",
        total_amount: totalAmount,
        expected_delivery_date: new Date(Date.now() + (supplier.average_delivery_days * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        notes: `Automatic reorder generated every minute - ${new Date().toLocaleString()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        order_items: supplierItems.map(item => ({
          id: `${item.id}-${Date.now()}`,
          inventory_item_id: item.id,
          quantity: item.reorderQuantity,
          unit_price: item.unit_cost,
          total_price: item.reorderQuantity * item.unit_cost,
          inventory_items: { name: item.name }
        })),
        isAutoGenerated: true,
        autoOrderReason: "Scheduled auto order (every minute)"
      };

      // Add to shared order store
      addOrder(newOrder);
      
      // Add to local history
      setAutoOrderHistory(prev => [newOrder, ...prev.slice(0, 19)]); // Keep last 20
      setLastCheckTime(new Date());
      toast.success(`Auto order #${currentCount} created for ${supplier.name} - ₹${totalAmount.toLocaleString()}`, {
        description: `Generated at ${new Date().toLocaleTimeString()}`
      });
    });
  };

  // Manual trigger for automatic orders
  const handleManualAutoOrder = () => {
    createAutoOrder(true); // Force create an order manually
    toast.success("Manual auto order created!");
  };

  // Auto-generate orders every minute when enabled
  useEffect(() => {
    if (!autoOrderEnabled) return;

    console.log('Auto order system started - will generate orders every minute');
    
    const autoInterval = setInterval(() => {
      createAutoOrder(true); // Force create order every minute
      setLastCheckTime(new Date());
    }, 60 * 1000); // 1 minute in milliseconds

    return () => {
      clearInterval(autoInterval);
      console.log('Auto order system stopped');
    };
  }, [autoOrderEnabled, autoOrderCount]);

  const lowStockItems = checkLowStockItems();
  const pendingAutoOrders = autoOrderHistory.filter(order => order.status === "draft");
  const totalAutoOrders = autoOrderHistory.length;
  const totalAutoValue = autoOrderHistory.reduce((sum, order) => sum + order.total_amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automatic Orders</h1>
          <p className="text-muted-foreground">Intelligent order scheduling and automation</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={autoOrderEnabled ? "default" : "secondary"}>
            {autoOrderEnabled ? <Play className="h-3 w-3 mr-1" /> : <Pause className="h-3 w-3 mr-1" />}
            {autoOrderEnabled ? "Active" : "Paused"}
          </Badge>
        </div>
      </div>

      {/* Auto Order Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Total Auto Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAutoOrders}</div>
            <p className="text-xs text-muted-foreground">Since activation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Auto Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalAutoValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total savings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Items Need Reorder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Below reorder point</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-info" />
              Last Check
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lastCheckTime.toLocaleTimeString()}</div>
            <p className="text-xs text-muted-foreground">Auto monitoring</p>
          </CardContent>
        </Card>
      </div>

      {/* Auto Order Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Automation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-order">Enable Automatic Reordering</Label>
              <p className="text-sm text-muted-foreground">
                Automatically create orders when items reach low stock levels
              </p>
            </div>
            <Switch
              id="auto-order"
              checked={autoOrderEnabled}
              onCheckedChange={setAutoOrderEnabled}
            />
          </div>

          {autoOrderEnabled && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="safety-multiplier">Safety Stock Multiplier</Label>
                <Input
                  id="safety-multiplier"
                  type="number"
                  step="0.1"
                  min="1"
                  max="3"
                  value={reorderSettings.safetyStockMultiplier}
                  onChange={(e) => setReorderSettings(prev => ({
                    ...prev,
                    safetyStockMultiplier: parseFloat(e.target.value)
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead-buffer">Lead Time Buffer (days)</Label>
                <Input
                  id="lead-buffer"
                  type="number"
                  min="0"
                  max="30"
                  value={reorderSettings.leadTimeBuffer}
                  onChange={(e) => setReorderSettings(prev => ({
                    ...prev,
                    leadTimeBuffer: parseInt(e.target.value)
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="check-interval">Check Interval (minutes)</Label>
                <Select
                  value={reorderSettings.checkInterval.toString()}
                  onValueChange={(value) => setReorderSettings(prev => ({
                    ...prev,
                    checkInterval: parseInt(value)
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 minute (Demo Mode)</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                    <SelectItem value="1440">24 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="auto-approve">Auto Approve Threshold (₹)</Label>
                <Input
                  id="auto-approve"
                  type="number"
                  min="0"
                  value={reorderSettings.autoApproveThreshold}
                  onChange={(e) => setReorderSettings(prev => ({
                    ...prev,
                    autoApproveThreshold: parseInt(e.target.value)
                  }))}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Items Requiring Reorder
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockItems.length > 0 ? (
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Current: {item.current_quantity} | Reorder Point: {item.reorder_point} | 
                      Suggested Qty: {calculateReorderQuantity(item)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supplier: {item.suppliers?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">Low Stock</Badge>
                    <p className="text-sm font-semibold mt-1">
                      ₹{(calculateReorderQuantity(item) * item.unit_cost).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              <Button onClick={handleManualAutoOrder} className="w-full">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Create Auto Orders Now
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <p className="text-lg font-medium">All items are well stocked!</p>
              <p className="text-sm text-muted-foreground">No automatic reorders needed</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto Order History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-info" />
            Auto Order History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {autoOrderHistory.length > 0 ? (
            <div className="space-y-3">
              {autoOrderHistory.slice(0, 10).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{order.order_number}</p>
                      <Badge variant="secondary" className="text-xs">Auto</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.suppliers?.name} • {order.order_items?.length} items
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{order.total_amount.toLocaleString()}</p>
                    <Badge variant={order.status === "pending" ? "default" : "secondary"}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No automatic orders created yet</p>
              <p className="text-xs text-muted-foreground mt-2">
                Enable automatic reordering to see orders here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoOrders;



