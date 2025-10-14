-- Add sample data for demonstration

-- Insert sample suppliers
INSERT INTO public.suppliers (name, contact_person, email, phone, address, rating, average_delivery_days, total_orders) VALUES
('TechParts Supply Co.', 'John Anderson', 'john@techparts.com', '+1-555-0101', '123 Industrial Blvd, Austin, TX', 4.5, 7, 45),
('Global Components Ltd.', 'Sarah Chen', 'sarah@globalcomp.com', '+1-555-0102', '456 Trade Ave, San Jose, CA', 4.8, 5, 78),
('FastShip Logistics', 'Mike Rodriguez', 'mike@fastship.com', '+1-555-0103', '789 Supply St, Chicago, IL', 4.2, 9, 32)
ON CONFLICT DO NOTHING;

-- Get supplier IDs for reference
DO $$
DECLARE
  supplier1_id uuid;
  supplier2_id uuid;
  supplier3_id uuid;
BEGIN
  SELECT id INTO supplier1_id FROM public.suppliers WHERE name = 'TechParts Supply Co.' LIMIT 1;
  SELECT id INTO supplier2_id FROM public.suppliers WHERE name = 'Global Components Ltd.' LIMIT 1;
  SELECT id INTO supplier3_id FROM public.suppliers WHERE name = 'FastShip Logistics' LIMIT 1;

  -- Insert sample inventory items
  INSERT INTO public.inventory_items (sku, name, description, category, barcode, current_quantity, reorder_point, optimal_quantity, unit_cost, location, supplier_id) VALUES
  ('CPU-001', 'Intel Core i7 Processor', 'High-performance processor for manufacturing equipment', 'Electronics', 'BC123456789', 45, 20, 100, 299.99, 'Warehouse A - Shelf 12', supplier1_id),
  ('MEM-002', 'DDR4 RAM 16GB', 'Memory modules for control systems', 'Electronics', 'BC234567890', 15, 30, 150, 89.99, 'Warehouse A - Shelf 15', supplier2_id),
  ('PWR-003', 'Industrial Power Supply 500W', 'Reliable power supply unit', 'Electronics', 'BC345678901', 78, 25, 120, 129.99, 'Warehouse B - Shelf 8', supplier1_id),
  ('SEN-004', 'Temperature Sensor Module', 'Precision temperature monitoring', 'Sensors', 'BC456789012', 120, 40, 200, 45.50, 'Warehouse C - Shelf 3', supplier3_id),
  ('MOT-005', 'Stepper Motor 24V', 'High-torque stepper motor', 'Motors', 'BC567890123', 8, 15, 80, 185.00, 'Warehouse B - Shelf 22', supplier2_id),
  ('CAB-006', 'Ethernet Cable Cat6 - 100ft', 'Network cable for industrial use', 'Cables', 'BC678901234', 200, 50, 300, 12.99, 'Warehouse A - Shelf 45', supplier3_id),
  ('BRD-007', 'Arduino Control Board', 'Microcontroller for automation', 'Electronics', 'BC789012345', 65, 30, 150, 35.00, 'Warehouse C - Shelf 7', supplier1_id),
  ('LED-008', 'Industrial LED Panel', 'High-brightness LED panel', 'Lighting', 'BC890123456', 92, 20, 100, 75.50, 'Warehouse B - Shelf 18', supplier2_id)
  ON CONFLICT DO NOTHING;
END $$;

-- Insert sample alerts for low-stock items
INSERT INTO public.alerts (type, title, message, severity, is_read) VALUES
('low_stock', 'Low Stock Alert', 'Stepper Motor 24V inventory is below reorder point', 'high', false),
('low_stock', 'Low Stock Alert', 'DDR4 RAM 16GB inventory is below reorder point', 'medium', false),
('forecast', 'Demand Forecast', 'High demand predicted for Temperature Sensor Module next month', 'medium', true)
ON CONFLICT DO NOTHING;
