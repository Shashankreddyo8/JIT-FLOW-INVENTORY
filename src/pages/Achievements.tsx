import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AchievementBadge } from "@/components/AchievementBadge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, TrendingUp } from "lucide-react";

const Achievements = () => {
  const [achievements, setAchievements] = useState({
    efficient_reordering: false,
    accurate_forecasting: false,
    supplier_excellence: false,
    inventory_master: false,
    quick_response: false,
    perfect_delivery: false,
  });
  
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    completedOrders: 0,
    totalSuppliers: 0,
  });

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    // Fetch stats to determine achievements
    const { data: items } = await supabase.from("inventory_items").select("*");
    const { data: orders } = await supabase.from("orders").select("*");
    const { data: suppliers } = await supabase.from("suppliers").select("*");
    const { data: alerts } = await supabase.from("alerts").select("*");

    if (items) {
      const lowStock = items.filter(item => item.current_quantity <= item.reorder_point);
      const hasOptimalStock = lowStock.length === 0 && items.length > 0;
      
      setStats(prev => ({
        ...prev,
        totalItems: items.length,
        lowStockItems: lowStock.length
      }));

      setAchievements(prev => ({
        ...prev,
        efficient_reordering: items.length >= 5 && lowStock.length <= 2,
        inventory_master: hasOptimalStock
      }));
    }

    if (orders) {
      const delivered = orders.filter(o => o.status === 'delivered');
      const onTime = delivered.filter(o => 
        o.actual_delivery_date && o.expected_delivery_date &&
        new Date(o.actual_delivery_date) <= new Date(o.expected_delivery_date)
      );

      setStats(prev => ({
        ...prev,
        completedOrders: delivered.length
      }));

      setAchievements(prev => ({
        ...prev,
        perfect_delivery: onTime.length >= 5 && onTime.length === delivered.length
      }));
    }

    if (suppliers) {
      const highRated = suppliers.filter(s => s.rating && s.rating >= 4);
      
      setStats(prev => ({
        ...prev,
        totalSuppliers: suppliers.length
      }));

      setAchievements(prev => ({
        ...prev,
        supplier_excellence: highRated.length >= 3
      }));
    }

    if (alerts) {
      const resolved = alerts.filter(a => a.is_read);
      
      setAchievements(prev => ({
        ...prev,
        quick_response: resolved.length >= 10
      }));
    }
  };

  const totalAchievements = Object.keys(achievements).length;
  const unlockedAchievements = Object.values(achievements).filter(Boolean).length;
  const progressPercentage = (unlockedAchievements / totalAchievements) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
        <p className="text-muted-foreground">
          Track your progress and unlock badges
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Your Progress</CardTitle>
                <CardDescription>
                  {unlockedAchievements} of {totalAchievements} achievements unlocked
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {Math.round(progressPercentage)}%
              </div>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-2" />
        </CardContent>
      </Card>

      {/* Current Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Current Performance</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold">{stats.totalItems}</div>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold">{stats.lowStockItems}</div>
              <p className="text-xs text-muted-foreground">Low Stock</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold">{stats.completedOrders}</div>
              <p className="text-xs text-muted-foreground">Completed Orders</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold">{stats.totalSuppliers}</div>
              <p className="text-xs text-muted-foreground">Suppliers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Badges */}
      <Card>
        <CardHeader>
          <CardTitle>All Achievements</CardTitle>
          <CardDescription>Complete tasks to unlock badges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {Object.entries(achievements).map(([type, unlocked]) => (
              <AchievementBadge
                key={type}
                type={type as any}
                unlocked={unlocked}
                size="lg"
                showLabel
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How to Unlock */}
      <Card>
        <CardHeader>
          <CardTitle>How to Unlock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <AchievementBadge type="efficient_reordering" unlocked={achievements.efficient_reordering} size="sm" />
            <div>
              <p className="font-medium text-sm">Efficient Reordering</p>
              <p className="text-xs text-muted-foreground">Manage 5+ items with ≤2 low-stock items</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <AchievementBadge type="inventory_master" unlocked={achievements.inventory_master} size="sm" />
            <div>
              <p className="font-medium text-sm">Inventory Master</p>
              <p className="text-xs text-muted-foreground">Maintain zero stockouts across all items</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <AchievementBadge type="supplier_excellence" unlocked={achievements.supplier_excellence} size="sm" />
            <div>
              <p className="font-medium text-sm">Supplier Excellence</p>
              <p className="text-xs text-muted-foreground">Work with 3+ suppliers rated 4+ stars</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <AchievementBadge type="perfect_delivery" unlocked={achievements.perfect_delivery} size="sm" />
            <div>
              <p className="font-medium text-sm">Perfect Delivery</p>
              <p className="text-xs text-muted-foreground">Complete 5+ orders all on-time</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <AchievementBadge type="quick_response" unlocked={achievements.quick_response} size="sm" />
            <div>
              <p className="font-medium text-sm">Quick Response</p>
              <p className="text-xs text-muted-foreground">Resolve 10+ alerts</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <AchievementBadge type="accurate_forecasting" unlocked={achievements.accurate_forecasting} size="sm" />
            <div>
              <p className="font-medium text-sm">Accurate Forecasting</p>
              <p className="text-xs text-muted-foreground">Use AI forecasting features regularly</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Achievements;
