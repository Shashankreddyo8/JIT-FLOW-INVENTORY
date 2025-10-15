import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Package, TruckIcon, MapPin, Phone, Mail } from "lucide-react";
import { formatINR, formatIndianDate } from "@/lib/indianLocalization";

const CustomerPortal = () => {
  const [customerData, setCustomerData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerData();

    // Realtime updates
    const channel = supabase
      .channel('customer-orders')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'customer_orders' 
      }, () => {
        fetchCustomerData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCustomerData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: access } = await supabase
        .from('customer_portal_access')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (access) {
        setCustomerData(access);

        const { data: customerOrders } = await supabase
          .from('customer_orders')
          .select('*')
          .eq('customer_id', access.id)
          .order('created_at', { ascending: false });

        setOrders(customerOrders || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!customerData) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-background via-muted/20 to-background">
        <Card className="max-w-md mx-auto mt-20">
          <CardHeader>
            <CardTitle>Access Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You don't have customer portal access. Please contact support.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: {[key: string]: string} = {
      pending: 'bg-warning/20 text-warning',
      confirmed: 'bg-info/20 text-info',
      processing: 'bg-primary/20 text-primary',
      shipped: 'bg-secondary/20 text-secondary',
      delivered: 'bg-success/20 text-success',
      cancelled: 'bg-destructive/20 text-destructive'
    };
    return colors[status] || 'bg-muted';
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Customer Portal
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome, {customerData.customer_name}
          </p>
        </div>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Your Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{customerData.customer_email}</span>
              </div>
              {customerData.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{customerData.phone}</span>
                </div>
              )}
              {customerData.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{customerData.address}</span>
                </div>
              )}
              {customerData.gst_number && (
                <div className="text-sm">
                  <span className="text-muted-foreground">GST:</span> {customerData.gst_number}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{orders.length}</div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {orders.filter(o => o.status === 'shipped').length}
              </div>
              <div className="text-sm text-muted-foreground">In Transit</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {orders.filter(o => o.status === 'delivered').length}
              </div>
              <div className="text-sm text-muted-foreground">Delivered</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {formatINR(orders.reduce((sum, o) => sum + Number(o.total_with_gst), 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{order.order_number}</span>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Order Date: {formatIndianDate(order.created_at)}</div>
                          {order.expected_delivery && (
                            <div>Expected Delivery: {formatIndianDate(order.expected_delivery)}</div>
                          )}
                          <div>Amount: {formatINR(Number(order.total_amount))}</div>
                          <div>GST ({order.gst_amount > 0 ? '18%' : '0%'}): {formatINR(Number(order.gst_amount))}</div>
                          <div className="font-semibold">Total: {formatINR(Number(order.total_with_gst))}</div>
                          {order.tracking_number && (
                            <div className="flex items-center gap-2 mt-2">
                              <TruckIcon className="h-4 w-4" />
                              <span>Tracking: {order.tracking_number}</span>
                              {order.courier_service && <span className="text-muted-foreground">({order.courier_service})</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      {(order.status === 'processing' || order.status === 'shipped') && (
                        <Button size="sm" variant="outline">
                          Track Order
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {orders.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No orders yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerPortal;