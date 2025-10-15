-- Add portal access types enum
CREATE TYPE public.portal_role AS ENUM ('supplier', 'customer');

-- Supplier Portal Access Table
CREATE TABLE public.supplier_portal_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  access_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(supplier_id, email)
);

-- Customer Portal Access Table
CREATE TABLE public.customer_portal_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  is_active BOOLEAN DEFAULT true,
  phone TEXT,
  address TEXT,
  gst_number TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Customer Orders (for portal tracking)
CREATE TABLE public.customer_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customer_portal_access(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount NUMERIC(15,2) NOT NULL,
  gst_amount NUMERIC(15,2) DEFAULT 0,
  total_with_gst NUMERIC(15,2) NOT NULL,
  items JSONB NOT NULL,
  shipping_address TEXT NOT NULL,
  expected_delivery DATE,
  actual_delivery DATE,
  tracking_number TEXT,
  courier_service TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Waste Analytics Table
CREATE TABLE public.waste_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  waste_quantity NUMERIC(10,2) NOT NULL,
  waste_reason TEXT NOT NULL,
  waste_type TEXT NOT NULL CHECK (waste_type IN ('expired', 'damaged', 'obsolete', 'excess')),
  carbon_footprint NUMERIC(10,2),
  recyclable BOOLEAN DEFAULT false,
  disposal_cost NUMERIC(10,2),
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sustainability Metrics Table
CREATE TABLE public.sustainability_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC(10,2) NOT NULL,
  measurement_unit TEXT NOT NULL,
  certification TEXT,
  assessed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Delivery Routes Table
CREATE TABLE public.delivery_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_order_id UUID REFERENCES public.customer_orders(id) ON DELETE CASCADE,
  origin_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  origin_pincode TEXT NOT NULL,
  destination_pincode TEXT NOT NULL,
  distance_km NUMERIC(10,2),
  estimated_time_hours NUMERIC(5,2),
  route_waypoints JSONB,
  courier_service TEXT NOT NULL,
  cost_estimate NUMERIC(10,2),
  carbon_emissions NUMERIC(10,2),
  status TEXT DEFAULT 'planned',
  actual_delivery_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Cost Optimization Recommendations Table
CREATE TABLE public.cost_optimization_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL,
  current_cost NUMERIC(10,2) NOT NULL,
  potential_cost NUMERIC(10,2) NOT NULL,
  savings_amount NUMERIC(10,2) NOT NULL,
  savings_percentage NUMERIC(5,2) NOT NULL,
  details JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  applied_at TIMESTAMP WITH TIME ZONE
);

-- Add GST and Indian localization fields to existing tables
ALTER TABLE public.suppliers 
  ADD COLUMN IF NOT EXISTS gst_number TEXT,
  ADD COLUMN IF NOT EXISTS pan_number TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS pincode TEXT;

ALTER TABLE public.inventory_items
  ADD COLUMN IF NOT EXISTS hsn_code TEXT,
  ADD COLUMN IF NOT EXISTS gst_rate NUMERIC(5,2) DEFAULT 18.00;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS gst_amount NUMERIC(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_with_gst NUMERIC(15,2);

-- Enable RLS
ALTER TABLE public.supplier_portal_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_portal_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sustainability_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_optimization_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Supplier Portal
CREATE POLICY "Suppliers can view own portal access"
ON public.supplier_portal_access FOR SELECT
USING (user_id = auth.uid() OR email = auth.jwt()->>'email');

CREATE POLICY "Admins can manage supplier portal access"
ON public.supplier_portal_access FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- RLS Policies for Customer Portal
CREATE POLICY "Customers can view own portal access"
ON public.customer_portal_access FOR SELECT
USING (user_id = auth.uid() OR customer_email = auth.jwt()->>'email');

CREATE POLICY "Admins can manage customer portal access"
ON public.customer_portal_access FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- RLS Policies for Customer Orders
CREATE POLICY "Customers can view own orders"
ON public.customer_orders FOR SELECT
USING (customer_id IN (
  SELECT id FROM public.customer_portal_access WHERE user_id = auth.uid()
));

CREATE POLICY "Managers can manage all customer orders"
ON public.customer_orders FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- RLS Policies for Waste Analytics
CREATE POLICY "All authenticated users can view waste analytics"
ON public.waste_analytics FOR SELECT
USING (true);

CREATE POLICY "Managers can manage waste analytics"
ON public.waste_analytics FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- RLS Policies for Sustainability Metrics
CREATE POLICY "All authenticated users can view sustainability metrics"
ON public.sustainability_metrics FOR SELECT
USING (true);

CREATE POLICY "Managers can manage sustainability metrics"
ON public.sustainability_metrics FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- RLS Policies for Delivery Routes
CREATE POLICY "All authenticated users can view delivery routes"
ON public.delivery_routes FOR SELECT
USING (true);

CREATE POLICY "Managers can manage delivery routes"
ON public.delivery_routes FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- RLS Policies for Cost Optimization
CREATE POLICY "All authenticated users can view cost recommendations"
ON public.cost_optimization_recommendations FOR SELECT
USING (true);

CREATE POLICY "Managers can manage cost recommendations"
ON public.cost_optimization_recommendations FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Create indexes for performance
CREATE INDEX idx_supplier_portal_supplier ON public.supplier_portal_access(supplier_id);
CREATE INDEX idx_customer_orders_customer ON public.customer_orders(customer_id);
CREATE INDEX idx_waste_analytics_item ON public.waste_analytics(inventory_item_id);
CREATE INDEX idx_sustainability_supplier ON public.sustainability_metrics(supplier_id);
CREATE INDEX idx_delivery_routes_order ON public.delivery_routes(order_id);
CREATE INDEX idx_cost_opt_item ON public.cost_optimization_recommendations(inventory_item_id);

-- Update timestamp trigger for customer_orders
CREATE TRIGGER update_customer_orders_updated_at
BEFORE UPDATE ON public.customer_orders
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to calculate GST
CREATE OR REPLACE FUNCTION public.calculate_gst(base_amount NUMERIC, gst_rate NUMERIC DEFAULT 18.00)
RETURNS TABLE(gst_amount NUMERIC, total_with_gst NUMERIC)
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT 
    ROUND(base_amount * gst_rate / 100, 2) AS gst_amount,
    ROUND(base_amount + (base_amount * gst_rate / 100), 2) AS total_with_gst;
$$;

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.waste_analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_routes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cost_optimization_recommendations;