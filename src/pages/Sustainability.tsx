import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Leaf, Recycle, TrendingDown, Award, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Sustainability = () => {
  const [wasteData, setWasteData] = useState<any[]>([]);
  const [sustainabilityMetrics, setSustainabilityMetrics] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    inventory_item_id: '',
    waste_quantity: '',
    waste_reason: '',
    waste_type: 'damaged',
    carbon_footprint: '',
    recyclable: false,
    disposal_cost: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: waste } = await supabase
      .from('waste_analytics')
      .select('*, inventory_items(name)')
      .order('recorded_date', { ascending: false });

    const { data: metrics } = await supabase
      .from('sustainability_metrics')
      .select('*, suppliers(name)')
      .order('assessed_date', { ascending: false });

    setWasteData(waste || []);
    setSustainabilityMetrics(metrics || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from('waste_analytics').insert([{
      ...formData,
      waste_quantity: parseFloat(formData.waste_quantity),
      carbon_footprint: formData.carbon_footprint ? parseFloat(formData.carbon_footprint) : null,
      disposal_cost: formData.disposal_cost ? parseFloat(formData.disposal_cost) : null
    }]);

    if (error) {
      toast.error('Failed to record waste');
      return;
    }

    toast.success('Waste recorded successfully');
    setOpen(false);
    fetchData();
  };

  const wasteByType = wasteData.reduce((acc: any, item) => {
    acc[item.waste_type] = (acc[item.waste_type] || 0) + Number(item.waste_quantity);
    return acc;
  }, {});

  const wasteTypeData = Object.entries(wasteByType).map(([type, quantity]) => ({
    name: type,
    value: quantity
  }));

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  const totalWaste = wasteData.reduce((sum, item) => sum + Number(item.waste_quantity), 0);
  const recyclableWaste = wasteData.filter(item => item.recyclable).reduce((sum, item) => sum + Number(item.waste_quantity), 0);
  const totalCarbonFootprint = wasteData.reduce((sum, item) => sum + (Number(item.carbon_footprint) || 0), 0);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-success to-secondary bg-clip-text text-transparent">
              Sustainability & ESG Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Track waste reduction, carbon footprint, and supplier sustainability metrics
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-success to-secondary">
                <Plus className="mr-2 h-4 w-4" />
                Record Waste
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Waste Data</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Waste Quantity (kg)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={formData.waste_quantity}
                    onChange={(e) => setFormData({...formData, waste_quantity: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Waste Type</Label>
                  <Select value={formData.waste_type} onValueChange={(v) => setFormData({...formData, waste_type: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                      <SelectItem value="obsolete">Obsolete</SelectItem>
                      <SelectItem value="excess">Excess</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reason</Label>
                  <Input
                    required
                    value={formData.waste_reason}
                    onChange={(e) => setFormData({...formData, waste_reason: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Carbon Footprint (kg CO₂)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.carbon_footprint}
                    onChange={(e) => setFormData({...formData, carbon_footprint: e.target.value})}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.recyclable}
                    onChange={(e) => setFormData({...formData, recyclable: e.target.checked})}
                    className="h-4 w-4"
                  />
                  <Label>Recyclable Material</Label>
                </div>
                <Button type="submit" className="w-full">Record Waste</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-success/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{totalWaste.toFixed(2)} kg</div>
                  <div className="text-sm text-muted-foreground">Total Waste</div>
                </div>
                <TrendingDown className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-secondary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{recyclableWaste.toFixed(2)} kg</div>
                  <div className="text-sm text-muted-foreground">Recyclable</div>
                </div>
                <Recycle className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-info/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{((recyclableWaste / totalWaste) * 100 || 0).toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Recycle Rate</div>
                </div>
                <Award className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-warning/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{totalCarbonFootprint.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">kg CO₂</div>
                </div>
                <Leaf className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Waste by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={wasteTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}kg`}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {wasteTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supplier Sustainability Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sustainabilityMetrics.slice(0, 5).map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{metric.suppliers?.name || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">{metric.metric_type}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-semibold">{metric.metric_value}</div>
                        <div className="text-xs text-muted-foreground">{metric.measurement_unit}</div>
                      </div>
                      {metric.certification && (
                        <Award className="h-4 w-4 text-success" />
                      )}
                    </div>
                  </div>
                ))}
                {sustainabilityMetrics.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No sustainability metrics recorded yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Badge */}
        <Card className="border-success/20 bg-gradient-to-r from-success/5 to-secondary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Award className="h-12 w-12 text-success" />
              <div>
                <h3 className="font-semibold text-lg">ESG Compliance for Indian Manufacturing</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Tracking aligned with SEBI ESG reporting guidelines and Indian sustainability standards.
                  Recyclable waste rate: {((recyclableWaste / totalWaste) * 100 || 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Sustainability;