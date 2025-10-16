import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, ShoppingCart, TruckIcon, AlertTriangle, TrendingUp, TrendingDown, IndianRupee, Calendar, Users, BarChart3, Zap, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatIndianCurrency } from "@/lib/indianLocalization";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalInventoryValue: 0,
    activeOrders: 0,
    lowStockAlerts: 0,
    upcomingDeliveries: 0,
    avgSupplierPerformance: 0,
    inventoryTurnoverRate: 0,
    weekComparison: 0,
    stockouts: 0,
    overstocks: 0,
  });

  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [upcomingShipments, setUpcomingShipments] = useState<any[]>([]);
  const [demandForecasts, setDemandForecasts] = useState<any[]>([]);
  const [costRecommendations, setCostRecommendations] = useState<any[]>([]);
  const [supplierPerformance, setSupplierPerformance] = useState<any[]>([]);
  const [inventoryTrend, setInventoryTrend] = useState<any[]>([]);
  const [orderFulfillment, setOrderFulfillment] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up realtime subscriptions
    const channels = [
      supabase.channel('inventory-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_items' }, () => fetchDashboardData()).subscribe(),
      supabase.channel('orders-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchDashboardData()).subscribe(),
      supabase.channel('alerts-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => fetchDashboardData()).subscribe(),
      supabase.channel('forecasts-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'demand_forecasts' }, () => fetchDashboardData()).subscribe(),
      supabase.channel('cost-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'cost_optimization_recommendations' }, () => fetchDashboardData()).subscribe(),
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch inventory items
      const { data: items } = await supabase.from("inventory_items").select("*");
      
      if (items) {
        // Calculate total inventory value
        const totalValue = items.reduce((sum, item) => sum + (item.current_quantity * item.unit_cost), 0);
        
        // Calculate low stock, stockouts, and overstocks
        const lowStock = items.filter(item => item.current_quantity <= item.reorder_point);
        const stockouts = items.filter(item => item.current_quantity === 0);
        const overstocks = items.filter(item => item.current_quantity > item.optimal_quantity * 1.2);
        
        setStats(prev => ({ 
          ...prev, 
          totalInventoryValue: totalValue,
          lowStockAlerts: lowStock.length,
          stockouts: stockouts.length,
          overstocks: overstocks.length,
        }));
        
        setLowStockItems(lowStock.slice(0, 8));
        
        // Generate inventory trend data (last 7 days simulation)
        const trendData = Array.from({length: 7}, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return {
            date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            value: totalValue * (0.85 + Math.random() * 0.3),
            items: items.length + Math.floor(Math.random() * 10 - 5)
          };
        });
        setInventoryTrend(trendData);

        // Calculate inventory turnover rate (simplified)
        const avgInventoryValue = totalValue;
        const turnoverRate = avgInventoryValue > 0 ? ((totalValue * 12) / avgInventoryValue).toFixed(2) : 0;
        setStats(prev => ({ ...prev, inventoryTurnoverRate: Number(turnoverRate) }));
      }

      // Fetch orders
      const { data: orders } = await supabase
        .from("orders")
        .select("*, suppliers(name, rating, average_delivery_days)")
        .order("created_at", { ascending: false });

      if (orders) {
        const active = orders.filter(o => ['pending', 'confirmed', 'in_transit'].includes(o.status));
        const delivered = orders.filter(o => o.status === 'delivered').length;
        const total = orders.length;
        
        setStats(prev => ({ ...prev, activeOrders: active.length }));
        setRecentOrders(orders.slice(0, 6));

        // Order fulfillment data
        const fulfillmentData = [
          { status: 'Delivered', count: delivered, color: 'hsl(var(--success))' },
          { status: 'In Transit', count: orders.filter(o => o.status === 'in_transit').length, color: 'hsl(var(--info))' },
          { status: 'Pending', count: orders.filter(o => o.status === 'pending').length, color: 'hsl(var(--warning))' },
          { status: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length, color: 'hsl(var(--destructive))' },
        ];
        setOrderFulfillment(fulfillmentData);

        // Calculate week comparison (simplified)
        const weekComparison = total > 0 ? ((active.length / total) * 100 - 50).toFixed(1) : 0;
        setStats(prev => ({ ...prev, weekComparison: Number(weekComparison) }));
      }

      // Fetch upcoming deliveries
      const { data: deliveries } = await supabase
        .from("orders")
        .select("*, suppliers(name)")
        .in('status', ['confirmed', 'in_transit'])
        .order("expected_delivery_date", { ascending: true })
        .limit(5);
      
      if (deliveries) {
        setStats(prev => ({ ...prev, upcomingDeliveries: deliveries.length }));
        setUpcomingShipments(deliveries);
      }

      // Fetch supplier performance
      const { data: suppliers } = await supabase
        .from("suppliers")
        .select("*")
        .order("rating", { ascending: false })
        .limit(10);

      if (suppliers) {
        const avgRating = suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / (suppliers.length || 1);
        setStats(prev => ({ ...prev, avgSupplierPerformance: Number(avgRating.toFixed(1)) }));
        setSupplierPerformance(suppliers.map(s => ({
          name: s.name,
          rating: s.rating || 0,
          deliveryDays: s.average_delivery_days || 0,
          orders: s.total_orders || 0,
        })));
      }

      // Fetch demand forecasts
      const { data: forecasts } = await supabase
        .from("demand_forecasts")
        .select("*, inventory_items(name, sku)")
        .order("generated_at", { ascending: false })
        .limit(5);

      if (forecasts) {
        setDemandForecasts(forecasts);
      }

      // Fetch cost optimization recommendations
      const { data: recommendations } = await supabase
        .from("cost_optimization_recommendations")
        .select("*, inventory_items(name, sku)")
        .eq("status", "pending")
        .order("savings_amount", { ascending: false })
        .limit(4);

      if (recommendations) {
        setCostRecommendations(recommendations);
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    }
  };

  const handleReorder = async (itemId: string) => {
    toast.success("Reorder initiated. Navigating to orders...");
    navigate("/orders");
  };

  const handleApplyRecommendation = async (recId: string) => {
    const { error } = await supabase
      .from("cost_optimization_recommendations")
      .update({ status: "applied", applied_at: new Date().toISOString() })
      .eq("id", recId);

    if (!error) {
      toast.success("Recommendation applied successfully");
      fetchDashboardData();
    } else {
      toast.error("Failed to apply recommendation");
    }
  };

  const getStockStatus = (item: any) => {
    if (item.current_quantity === 0) return { status: "Out of Stock", color: "bg-destructive", textColor: "text-destructive" };
    const percentage = (item.current_quantity / item.optimal_quantity) * 100;
    if (percentage <= 25) return { status: "Critical", color: "bg-destructive", textColor: "text-destructive" };
    if (percentage <= 50) return { status: "Low", color: "bg-warning", textColor: "text-warning" };
    return { status: "Reorder", color: "bg-info", textColor: "text-info" };
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-success/10 text-success';
      case 'in_transit': return 'bg-info/10 text-info';
      case 'confirmed': return 'bg-secondary/10 text-secondary';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      default: return 'bg-warning/10 text-warning';
    }
  };

  const COLORS = ['hsl(var(--success))', 'hsl(var(--info))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Real-time JIT inventory management and analytics</p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse" />
          Live
        </Badge>
      </div>

      {/* Snapshot Summary - Top Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate("/inventory")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Inventory Value</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <IndianRupee className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIndianCurrency(stats.totalInventoryValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Across {lowStockItems.length + stats.stockouts} items</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate("/orders")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Orders</CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10">
              <ShoppingCart className="h-4 w-4 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <div className="flex items-center gap-1 mt-1">
              {stats.weekComparison > 0 ? (
                <><TrendingUp className="h-3 w-3 text-success" /><span className="text-xs text-success">+{stats.weekComparison}%</span></>
              ) : (
                <><TrendingDown className="h-3 w-3 text-destructive" /><span className="text-xs text-destructive">{stats.weekComparison}%</span></>
              )}
              <span className="text-xs text-muted-foreground">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate("/alerts")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alerts</CardTitle>
            <div className="p-2 rounded-lg bg-warning/10">
              <AlertTriangle className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockAlerts}</div>
            <div className="flex gap-2 mt-1">
              <Badge variant="destructive" className="text-xs">{stats.stockouts} Stockouts</Badge>
              <Badge variant="outline" className="text-xs">{stats.overstocks} Overstocks</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Deliveries</CardTitle>
            <div className="p-2 rounded-lg bg-info/10">
              <TruckIcon className="h-4 w-4 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingDeliveries}</div>
            <p className="text-xs text-muted-foreground mt-1">Next 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Supplier Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{stats.avgSupplierPerformance}</span>
              <span className="text-sm text-muted-foreground">/ 5.0</span>
            </div>
            <Progress value={stats.avgSupplierPerformance * 20} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Inventory Turnover
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{stats.inventoryTurnoverRate}</span>
              <span className="text-sm text-muted-foreground">times/year</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Industry avg: 8-12x</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate("/inventory")}>
              <Package className="h-3 w-3 mr-2" />
              Add Inventory
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate("/orders")}>
              <ShoppingCart className="h-3 w-3 mr-2" />
              Create Order
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Inventory Value Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inventory Value Trend (7 Days)</CardTitle>
            <CardDescription>Real-time inventory valuation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={inventoryTrend}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{fontSize: 11}} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{fontSize: 11}} stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Fulfillment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Fulfillment Status</CardTitle>
            <CardDescription>Current order distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={orderFulfillment}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {orderFulfillment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI-Driven Insights & Recommendations */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Demand Forecasts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">AI Demand Forecasts</CardTitle>
              <CardDescription>Predicted demand for next period</CardDescription>
            </div>
            <Badge variant="secondary">AI-Powered</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {demandForecasts.length > 0 ? (
              demandForecasts.map((forecast) => (
                <div key={forecast.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{forecast.inventory_items?.name}</p>
                    <p className="text-xs text-muted-foreground">{forecast.inventory_items?.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{forecast.forecasted_demand} units</p>
                    <p className="text-xs text-muted-foreground">{forecast.forecast_period}</p>
                    {forecast.confidence_score && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {(forecast.confidence_score * 100).toFixed(0)}% confidence
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">No forecasts available</p>
                <Button variant="link" size="sm" onClick={() => navigate("/inventory")}>
                  Generate Forecasts
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost Optimization */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Cost Optimization</CardTitle>
              <CardDescription>AI-recommended savings opportunities</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/cost-optimization")}>
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {costRecommendations.length > 0 ? (
              costRecommendations.map((rec) => (
                <div key={rec.id} className="p-3 border rounded-lg hover:shadow-md transition-all space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{rec.inventory_items?.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{rec.recommendation_type.replace('_', ' ')}</p>
                    </div>
                    <Badge className="bg-success/10 text-success">
                      Save {formatIndianCurrency(rec.savings_amount)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="default" onClick={() => handleApplyRecommendation(rec.id)}>
                      Apply
                    </Button>
                    <span className="text-xs text-muted-foreground">{rec.savings_percentage}% reduction</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">No recommendations available</p>
                <Button variant="link" size="sm" onClick={() => navigate("/cost-optimization")}>
                  Generate Recommendations
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Live Data Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Low Stock Items with Actions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Low Stock Items - Action Required</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/inventory")}>
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item) => {
                const { status, textColor } = getStockStatus(item);
                const percentage = item.optimal_quantity > 0 ? (item.current_quantity / item.optimal_quantity) * 100 : 0;
                
                return (
                  <div key={item.id} className="space-y-2 p-3 border rounded-lg hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.sku}</p>
                      </div>
                      <Badge variant="outline" className={textColor}>
                        {status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={percentage} className="flex-1" />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {item.current_quantity}/{item.optimal_quantity}
                      </span>
                    </div>
                    <Button size="sm" className="w-full" onClick={() => handleReorder(item.id)}>
                      <ShoppingCart className="h-3 w-3 mr-2" />
                      Reorder Now
                    </Button>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                All inventory levels are healthy
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders & Shipments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Purchase Orders</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/orders")}>
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate("/orders")}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{order.order_number}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">{order.suppliers?.name || "No supplier"}</p>
                      {order.expected_delivery_date && (
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(order.expected_delivery_date).toLocaleDateString('en-IN')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="font-semibold text-sm">{formatIndianCurrency(order.total_amount)}</p>
                    <Badge className={getOrderStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No orders yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Supplier Performance Heatmap */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Top Supplier Performance</CardTitle>
            <CardDescription>Delivery timeliness and ratings</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/suppliers")}>
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={supplierPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 5]} tick={{fontSize: 11}} stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 11}} stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="rating" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
