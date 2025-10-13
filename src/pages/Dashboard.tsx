import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, TruckIcon, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    activeOrders: 0,
    totalSuppliers: 0,
  });
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [inventoryTrend, setInventoryTrend] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up realtime subscriptions
    const itemsChannel = supabase
      .channel('inventory-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_items' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    const ordersChannel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(itemsChannel);
      supabase.removeChannel(ordersChannel);
    };
  }, []);

  const fetchDashboardData = async () => {
    // Fetch inventory items
    const { data: items, error: itemsError } = await supabase
      .from("inventory_items")
      .select("*");

    if (!itemsError && items) {
      setStats(prev => ({ ...prev, totalItems: items.length }));
      
      const lowStock = items.filter(item => item.current_quantity <= item.reorder_point);
      setStats(prev => ({ ...prev, lowStockItems: lowStock.length }));
      setLowStockItems(lowStock.slice(0, 5));
      
      // Generate inventory trend data
      const trendData = items.slice(0, 6).map(item => ({
        name: item.name.substring(0, 10),
        current: item.current_quantity,
        reorder: item.reorder_point,
      }));
      setInventoryTrend(trendData);
    }

    // Fetch orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*, suppliers(name)")
      .order("created_at", { ascending: false });

    if (!ordersError && orders) {
      const active = orders.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'in_transit');
      setStats(prev => ({ ...prev, activeOrders: active.length }));
      setRecentOrders(orders.slice(0, 5));
    }

    // Fetch suppliers
    const { data: suppliers, error: suppliersError } = await supabase
      .from("suppliers")
      .select("*");

    if (!suppliersError && suppliers) {
      setStats(prev => ({ ...prev, totalSuppliers: suppliers.length }));
    }
  };

  const statCards = [
    {
      title: "Total Items",
      value: stats.totalItems,
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Active Orders",
      value: stats.activeOrders,
      icon: ShoppingCart,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Total Suppliers",
      value: stats.totalSuppliers,
      icon: TruckIcon,
      color: "text-info",
      bgColor: "bg-info/10",
    },
  ];

  const getStockStatus = (item: any) => {
    const percentage = (item.current_quantity / item.optimal_quantity) * 100;
    if (percentage <= 25) return { status: "Critical", color: "bg-destructive" };
    if (percentage <= 50) return { status: "Low", color: "bg-warning" };
    if (percentage <= 75) return { status: "Medium", color: "bg-info" };
    return { status: "Good", color: "bg-success" };
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time overview of your inventory and operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="current" fill="hsl(var(--primary))" name="Current Stock" />
                <Bar dataKey="reorder" fill="hsl(var(--secondary))" name="Reorder Point" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item) => {
                const { status, color } = getStockStatus(item);
                const percentage = (item.current_quantity / item.optimal_quantity) * 100;
                
                return (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.name}</span>
                      <span className={`text-xs px-2 py-1 rounded ${color} text-white`}>
                        {status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={percentage} className="flex-1" />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {item.current_quantity}/{item.optimal_quantity}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                All inventory levels are healthy
              </p>
            )}
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate("/inventory")}
            >
              View All Inventory
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/orders")}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.suppliers?.name || "No supplier"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${order.total_amount}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      order.status === 'delivered' ? 'bg-success/10 text-success' :
                      order.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                      'bg-info/10 text-info'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No orders yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
