-- Fix RLS policies for development
-- Run this in your Supabase SQL editor to allow operations without authentication

-- Temporarily disable RLS for suppliers table for development
ALTER TABLE public.suppliers DISABLE ROW LEVEL SECURITY;

-- Or alternatively, create a more permissive policy
-- DROP POLICY IF EXISTS "All authenticated users can view suppliers" ON public.suppliers;
-- DROP POLICY IF EXISTS "Managers and admins can manage suppliers" ON public.suppliers;

-- CREATE POLICY "Allow all operations on suppliers" ON public.suppliers
-- FOR ALL USING (true);

-- Also disable RLS for inventory_items and orders for development
ALTER TABLE public.inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts DISABLE ROW LEVEL SECURITY;



