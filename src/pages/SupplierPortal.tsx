import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Package, TruckIcon, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { formatINR, formatIndianDate } from "@/lib/indianLocalization";

const SupplierPortal = () => {
  const [supplierData, setSupplierData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fulfillmentStatus, setFulfillmentStatus] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetchSupplierData();
  }, []);

  const fetchSupplierData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get supplier portal access
      const { data: access } = await supabase
        .from('supplier_portal_access')
        .select('*, suppliers(*)')
        .eq('user_id', user.id)
        .single();

      if (access) {
        setSupplierData(access);

        // Fetch orders for this supplier
        const { data: supplierOrders } = await supabase
          .from('orders')
          .select('*, order_items(*, inventory_items(*))')
          .eq('supplier_id', access.supplier_id)
          .order('created_at', { ascending: false });

        setOrders(supplierOrders || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load supplier data');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Order status updated');
      fetchSupplierData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <Package className="h-4 w-4" />;
      case 'in_transit': return <TruckIcon className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/20 text-warning';
      case 'confirmed': return 'bg-info/20 text-info';
      case 'in_transit': return 'bg-primary/20 text-primary';
      case 'delivered': return 'bg-success/20 text-success';
      default: return 'bg-muted';
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!supplierData) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-background via-muted/20 to-background">
        <Card className="max-w-md mx-auto mt-20">
          <CardHeader>
            <CardTitle>Access Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You don't have supplier portal access. Please contact the administrator.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Supplier Portal
            </h1>
            <p className="text-muted-foreground mt-1">
              {supplierData.suppliers.name} • GST: {supplierData.suppliers.gst_number || 'N/A'}
            </p>
          </div>
        </div>

        {/* Stats */}
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
                {orders.filter(o => o.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
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
                {formatINR(orders.reduce((sum, o) => sum + (Number(o.total_with_gst) || 0), 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </CardContent>
          </Card>
        </div>

        {/* Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Orders</CardTitle>
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
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{order.status}</span>
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Order Date: {formatIndianDate(order.created_at)}</div>
                          <div>Expected Delivery: {order.expected_delivery_date ? formatIndianDate(order.expected_delivery_date) : 'TBD'}</div>
                          <div>Amount (excl. GST): {formatINR(Number(order.total_amount))}</div>
                          <div>GST: {formatINR(Number(order.gst_amount) || 0)}</div>
                          <div className="font-semibold">Total (incl. GST): {formatINR(Number(order.total_with_gst) || Number(order.total_amount))}</div>
                        </div>
                        
                        {/* Order Items */}
                        <div className="mt-4">
                          <div className="text-sm font-semibold mb-2">Items:</div>
                          <div className="space-y-2">
                            {order.order_items?.map((item: any) => (
                              <div key={item.id} className="flex justify-between text-sm bg-muted/30 p-2 rounded">
                                <span>{item.inventory_items?.name}</span>
                                <span>Qty: {item.quantity} × {formatINR(Number(item.unit_price))}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {order.status === 'pending' && (
                          <Button size="sm" onClick={() => updateOrderStatus(order.id, 'confirmed')}>
                            Confirm Order
                          </Button>
                        )}
                        {order.status === 'confirmed' && (
                          <Button size="sm" onClick={() => updateOrderStatus(order.id, 'in_transit')}>
                            Mark Shipped
                          </Button>
                        )}
                        {order.status === 'in_transit' && (
                          <Button size="sm" variant="outline">
                            Track Shipment
                          </Button>
                        )}
                      </div>
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

export default SupplierPortal;