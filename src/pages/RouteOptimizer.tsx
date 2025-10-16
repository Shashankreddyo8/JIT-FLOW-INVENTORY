import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { MapPin, TruckIcon, Clock, DollarSign, Leaf, Navigation } from "lucide-react";
import { formatINR } from "@/lib/indianLocalization";

const RouteOptimizer = () => {
  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState<any>(null);
  const [formData, setFormData] = useState({
    originAddress: '',
    originPincode: '',
    destinationAddress: '',
    destinationPincode: '',
    courierPreference: ''
  });

  const handleOptimizeRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('route-planner', {
        body: {
          origin: {
            address: formData.originAddress,
            pincode: formData.originPincode
          },
          destination: {
            address: formData.destinationAddress,
            pincode: formData.destinationPincode
          },
          courierPreference: formData.courierPreference || null
        }
      });

      if (error) throw error;

      setRouteData(data);
      toast.success('Route optimized successfully!');
      
      // Reset form
      setFormData({
        originAddress: '',
        originPincode: '',
        destinationAddress: '',
        destinationPincode: '',
        courierPreference: ''
      });
    } catch (error: any) {
      console.error('Route optimization error:', error);
      toast.error(error.message || 'Failed to optimize route');
    } finally {
      setLoading(false);
    }
  };

  const INDIAN_COURIERS = [
    'Delhivery',
    'Blue Dart',
    'DTDC',
    'Ecom Express',
    'India Post',
    'FedEx',
    'DHL'
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Route Optimizer for Indian Logistics
          </h1>
          <p className="text-muted-foreground mt-1">
            Calculate optimal delivery routes across India with AI-powered logistics planning
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Route Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOptimizeRoute} className="space-y-4">
                <div className="space-y-2">
                  <Label>Origin Address</Label>
                  <Input
                    placeholder="Warehouse address"
                    required
                    value={formData.originAddress}
                    onChange={(e) => setFormData({...formData, originAddress: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Origin Pincode</Label>
                  <Input
                    placeholder="110001"
                    pattern="[1-9][0-9]{5}"
                    required
                    value={formData.originPincode}
                    onChange={(e) => setFormData({...formData, originPincode: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Destination Address</Label>
                  <Input
                    placeholder="Delivery address"
                    required
                    value={formData.destinationAddress}
                    onChange={(e) => setFormData({...formData, destinationAddress: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Destination Pincode</Label>
                  <Input
                    placeholder="400001"
                    pattern="[1-9][0-9]{5}"
                    required
                    value={formData.destinationPincode}
                    onChange={(e) => setFormData({...formData, destinationPincode: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Preferred Courier (Optional)</Label>
                  <Select value={formData.courierPreference} onValueChange={(v) => setFormData({...formData, courierPreference: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Courier" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_COURIERS.map((courier) => (
                        <SelectItem key={courier} value={courier}>{courier}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-primary-glow"
                  disabled={loading}
                >
                  {loading ? (
                    <>Optimizing Route...</>
                  ) : (
                    <>
                      <Navigation className="mr-2 h-4 w-4" />
                      Optimize Route
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>Optimized Route</CardTitle>
            </CardHeader>
            <CardContent>
              {!routeData ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter route details to see optimization results</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TruckIcon className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">Distance</span>
                      </div>
                      <div className="text-2xl font-bold">{routeData.distance_km} km</div>
                    </div>

                    <div className="bg-secondary/10 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-secondary" />
                        <span className="text-sm text-muted-foreground">Time</span>
                      </div>
                      <div className="text-2xl font-bold">{routeData.estimated_time_hours}h</div>
                    </div>

                    <div className="bg-success/10 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-success" />
                        <span className="text-sm text-muted-foreground">Cost</span>
                      </div>
                      <div className="text-2xl font-bold">{formatINR(routeData.cost_estimate)}</div>
                    </div>

                    <div className="bg-warning/10 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Leaf className="h-4 w-4 text-warning" />
                        <span className="text-sm text-muted-foreground">CO₂</span>
                      </div>
                      <div className="text-2xl font-bold">{routeData.carbon_emissions} kg</div>
                    </div>
                  </div>

                  {/* Recommended Courier */}
                  <div className="border-l-4 border-primary pl-4 py-2">
                    <div className="font-semibold">Recommended Courier</div>
                    <div className="text-2xl text-primary">{routeData.recommended_courier}</div>
                  </div>

                  {/* Route Description */}
                  <div>
                    <div className="font-semibold mb-2">Route Details</div>
                    <p className="text-sm text-muted-foreground">{routeData.route_description}</p>
                  </div>

                  {/* Waypoints */}
                  {routeData.route_waypoints && routeData.route_waypoints.length > 0 && (
                    <div>
                      <div className="font-semibold mb-2">Via</div>
                      <div className="flex flex-wrap gap-2">
                        {routeData.route_waypoints.map((city: string, index: number) => (
                          <span key={index} className="bg-muted px-3 py-1 rounded-full text-sm">
                            {city}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weather Warnings */}
                  {routeData.weather_warnings && routeData.weather_warnings.length > 0 && (
                    <div className="bg-warning/10 border border-warning/20 p-4 rounded-lg">
                      <div className="font-semibold mb-2 text-warning">⚠️ Weather Alerts</div>
                      <ul className="text-sm space-y-1">
                        {routeData.weather_warnings.map((warning: string, index: number) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Alternative Routes */}
                  {routeData.alternative_routes && routeData.alternative_routes.length > 0 && (
                    <div>
                      <div className="font-semibold mb-2">Alternative Options</div>
                      <div className="space-y-2">
                        {routeData.alternative_routes.map((alt: any, index: number) => (
                          <div key={index} className="bg-muted/50 p-3 rounded-lg text-sm">
                            <div className="font-medium">{alt.courier}</div>
                            <div className="text-muted-foreground">
                              {alt.distance_km}km • {alt.estimated_time_hours}h • {formatINR(alt.cost_estimate)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="border-info/20 bg-gradient-to-r from-info/5 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Navigation className="h-8 w-8 text-info flex-shrink-0" />
              <div>
                <h3 className="font-semibold">AI-Powered Indian Logistics</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Our route optimizer considers NH routes, state highways, traffic patterns in major metros,
                  toll plazas, monsoon delays, and festival season logistics across India. 
                  Compare multiple courier services for cost and speed optimization.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RouteOptimizer;