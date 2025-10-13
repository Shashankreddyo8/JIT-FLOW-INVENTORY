import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bell, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { format } from "date-fns";

const Alerts = () => {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel('alerts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => {
        fetchAlerts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from("alerts")
      .select("*, inventory_items(name)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch alerts");
    } else {
      setAlerts(data || []);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return AlertCircle;
      case "high": return AlertTriangle;
      default: return Info;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alerts & Notifications</h1>
        <p className="text-muted-foreground">Stay informed about critical inventory events</p>
      </div>

      <div className="grid gap-4">
        {alerts.map((alert) => {
          const Icon = getSeverityIcon(alert.severity);
          return (
            <Card key={alert.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{alert.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(alert.created_at), "MMM dd, yyyy 'at' HH:mm")}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getSeverityColor(alert.severity) as any}>{alert.severity}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{alert.message}</p>
                {alert.inventory_items && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Related item: {alert.inventory_items.name}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {alerts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bell className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No alerts</p>
            <p className="text-sm text-muted-foreground">All systems operating normally</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Alerts;
