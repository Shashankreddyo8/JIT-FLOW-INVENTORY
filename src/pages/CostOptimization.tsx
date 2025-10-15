import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { TrendingDown, Sparkles, Package, CheckCircle, XCircle } from "lucide-react";
import { formatINR } from "@/lib/indianLocalization";

const CostOptimization = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('cost_optimization_recommendations')
        .select('*')
        .order('generated_at', { ascending: false });

      setRecommendations(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    setGenerating(true);
    try {
      const { error } = await supabase.functions.invoke('cost-optimizer');

      if (error) throw error;

      toast.success('Cost optimization analysis complete!');
      await fetchRecommendations();
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate recommendations');
    } finally {
      setGenerating(false);
    }
  };

  const applyRecommendation = async (recId: string) => {
    try {
      const { error } = await supabase
        .from('cost_optimization_recommendations')
        .update({ status: 'applied', applied_at: new Date().toISOString() })
        .eq('id', recId);

      if (error) throw error;

      toast.success('Recommendation marked as applied');
      fetchRecommendations();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const rejectRecommendation = async (recId: string) => {
    try {
      const { error } = await supabase
        .from('cost_optimization_recommendations')
        .update({ status: 'rejected' })
        .eq('id', recId);

      if (error) throw error;

      toast.success('Recommendation rejected');
      fetchRecommendations();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getRecommendationTypeColor = (type: string) => {
    const colors: {[key: string]: string} = {
      bulk_discount: 'bg-success/20 text-success',
      alternate_supplier: 'bg-primary/20 text-primary',
      reorder_optimization: 'bg-info/20 text-info',
      gst_optimization: 'bg-warning/20 text-warning'
    };
    return colors[type] || 'bg-muted';
  };

  const totalPotentialSavings = recommendations
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + Number(r.savings_amount), 0);

  const appliedSavings = recommendations
    .filter(r => r.status === 'applied')
    .reduce((sum, r) => sum + Number(r.savings_amount), 0);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
              Cost Optimization AI
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered cost-saving recommendations for Indian supply chain
            </p>
          </div>
          <Button 
            onClick={generateRecommendations}
            disabled={generating}
            className="bg-gradient-to-r from-success to-primary"
          >
            {generating ? (
              <>Generating...</>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate New Analysis
              </>
            )}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-success/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-success">
                    {formatINR(totalPotentialSavings)}
                  </div>
                  <div className="text-sm text-muted-foreground">Potential Savings</div>
                </div>
                <TrendingDown className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {formatINR(appliedSavings)}
                  </div>
                  <div className="text-sm text-muted-foreground">Realized Savings</div>
                </div>
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-info/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {recommendations.filter(r => r.status === 'pending').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending Actions</div>
                </div>
                <Package className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations List */}
        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recommendations yet. Generate a new analysis to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <Card key={rec.id} className={rec.status !== 'pending' ? 'opacity-60' : ''}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getRecommendationTypeColor(rec.recommendation_type)}>
                              {rec.recommendation_type.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Badge variant={rec.status === 'pending' ? 'outline' : rec.status === 'applied' ? 'default' : 'destructive'}>
                              {rec.status}
                            </Badge>
                          </div>

                          <div className="mb-3">
                            <div className="font-semibold text-lg mb-1">
                              {rec.details?.description || 'Cost optimization opportunity'}
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">
                                Current: {formatINR(Number(rec.current_cost))}
                              </span>
                              <span className="text-muted-foreground">
                                Potential: {formatINR(Number(rec.potential_cost))}
                              </span>
                              <span className="text-success font-semibold">
                                Save: {formatINR(Number(rec.savings_amount))} ({rec.savings_percentage}%)
                              </span>
                            </div>
                          </div>

                          {rec.details?.action_steps && (
                            <div className="bg-muted/30 p-3 rounded-lg mb-2">
                              <div className="text-sm font-semibold mb-2">Action Steps:</div>
                              <ol className="text-sm space-y-1 list-decimal list-inside">
                                {rec.details.action_steps.map((step: string, idx: number) => (
                                  <li key={idx}>{step}</li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {rec.details?.implementation_timeline && (
                            <div className="text-sm text-muted-foreground">
                              Timeline: {rec.details.implementation_timeline}
                            </div>
                          )}
                        </div>

                        {rec.status === 'pending' && (
                          <div className="flex flex-col gap-2">
                            <Button size="sm" onClick={() => applyRecommendation(rec.id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Apply
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => rejectRecommendation(rec.id)}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-info/20 bg-gradient-to-r from-info/5 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Sparkles className="h-8 w-8 text-info flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Indian Market-Optimized AI</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Our AI analyzes your inventory data considering Indian GST rates (5%, 12%, 18%, 28%),
                  interstate vs intrastate costs, bulk discounts common in Indian markets, monsoon season considerations,
                  and festival season patterns to provide actionable cost-saving recommendations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CostOptimization;