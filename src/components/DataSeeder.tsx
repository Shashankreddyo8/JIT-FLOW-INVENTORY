import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Database, Loader2, Zap } from "lucide-react";

const DataSeeder = () => {
  const [isLoading, setIsLoading] = useState(false);

  const suppliers = [
    {
      name: 'ElectroMax Industries',
      contact_person: 'Rajesh Kumar',
      email: 'rajesh@electromax.com',
      phone: '+91-9876543210',
      address: 'Industrial Area, Sector 15, Gurgaon, Haryana',
      rating: 4.5,
      average_delivery_days: 3,
      gst_number: '07AABCU9603R1Z5',
      pan_number: 'AABCU9603R',
      state: 'Haryana',
      pincode: '122001'
    },
    {
      name: 'AutoParts Direct',
      contact_person: 'Priya Sharma',
      email: 'priya@autopartsdirect.com',
      phone: '+91-9876543211',
      address: 'Auto Hub, Phase 2, Chennai, Tamil Nadu',
      rating: 4.2,
      average_delivery_days: 5,
      gst_number: '33AABCU9603R1Z6',
      pan_number: 'AABCU9603S',
      state: 'Tamil Nadu',
      pincode: '600001'
    },
    {
      name: 'CableWorld Solutions',
      contact_person: 'Amit Patel',
      email: 'amit@cableworld.com',
      phone: '+91-9876543212',
      address: 'Wire Park, MIDC, Pune, Maharashtra',
      rating: 4.7,
      average_delivery_days: 2,
      gst_number: '27AABCU9603R1Z7',
      pan_number: 'AABCU9603T',
      state: 'Maharashtra',
      pincode: '411001'
    },
    {
      name: 'WireTech Enterprises',
      contact_person: 'Suresh Reddy',
      email: 'suresh@wiretech.com',
      phone: '+91-9876543213',
      address: 'Tech Park, HITEC City, Hyderabad, Telangana',
      rating: 4.3,
      average_delivery_days: 4,
      gst_number: '36AABCU9603R1Z8',
      pan_number: 'AABCU9603U',
      state: 'Telangana',
      pincode: '500001'
    }
  ];

  const inventoryItems = [
    // Electrical Components
    {
      sku: 'ELC-001',
      name: 'Circuit Breaker 32A',
      description: 'Miniature Circuit Breaker for electrical protection',
      category: 'Electrical',
      current_quantity: 150,
      reorder_point: 30,
      optimal_quantity: 200,
      unit_cost: 450.00,
      barcode: 'BC100000001',
      location: 'Warehouse A - Electrical Section',
      hsn_code: '8535',
      gst_rate: 18.00
    },
    {
      sku: 'ELC-002',
      name: 'Electrical Switch 16A',
      description: 'Single pole electrical switch with LED indicator',
      category: 'Electrical',
      current_quantity: 75,
      reorder_point: 25,
      optimal_quantity: 150,
      unit_cost: 180.00,
      barcode: 'BC100000002',
      location: 'Warehouse A - Electrical Section',
      hsn_code: '8536',
      gst_rate: 18.00
    },
    {
      sku: 'ELC-003',
      name: 'MCB Box 12 Way',
      description: 'Distribution board with 12 miniature circuit breakers',
      category: 'Electrical',
      current_quantity: 45,
      reorder_point: 15,
      optimal_quantity: 80,
      unit_cost: 1200.00,
      barcode: 'BC100000003',
      location: 'Warehouse A - Electrical Section',
      hsn_code: '8537',
      gst_rate: 18.00
    },
    {
      sku: 'ELC-004',
      name: 'Electrical Socket 16A',
      description: '3-pin electrical socket with safety shutter',
      category: 'Electrical',
      current_quantity: 200,
      reorder_point: 50,
      optimal_quantity: 300,
      unit_cost: 120.00,
      barcode: 'BC100000004',
      location: 'Warehouse A - Electrical Section',
      hsn_code: '8536',
      gst_rate: 18.00
    },
    {
      sku: 'ELC-005',
      name: 'LED Panel Light 36W',
      description: 'Energy efficient LED panel light for commercial use',
      category: 'Electrical',
      current_quantity: 90,
      reorder_point: 20,
      optimal_quantity: 150,
      unit_cost: 850.00,
      barcode: 'BC100000005',
      location: 'Warehouse A - Lighting Section',
      hsn_code: '8539',
      gst_rate: 18.00
    },

    // Automotive Components
    {
      sku: 'AUTO-001',
      name: 'Brake Pad Set',
      description: 'Ceramic brake pads for front wheels',
      category: 'Automotive',
      current_quantity: 60,
      reorder_point: 20,
      optimal_quantity: 100,
      unit_cost: 2200.00,
      barcode: 'BC200000001',
      location: 'Warehouse B - Automotive Section',
      hsn_code: '8708',
      gst_rate: 28.00
    },
    {
      sku: 'AUTO-002',
      name: 'Oil Filter',
      description: 'High performance engine oil filter',
      category: 'Automotive',
      current_quantity: 120,
      reorder_point: 30,
      optimal_quantity: 200,
      unit_cost: 450.00,
      barcode: 'BC200000002',
      location: 'Warehouse B - Automotive Section',
      hsn_code: '8421',
      gst_rate: 28.00
    },
    {
      sku: 'AUTO-003',
      name: 'Spark Plug Set',
      description: 'Iridium spark plugs for better performance',
      category: 'Automotive',
      current_quantity: 80,
      reorder_point: 25,
      optimal_quantity: 150,
      unit_cost: 180.00,
      barcode: 'BC200000003',
      location: 'Warehouse B - Automotive Section',
      hsn_code: '8511',
      gst_rate: 28.00
    },
    {
      sku: 'AUTO-004',
      name: 'Air Filter',
      description: 'High flow air filter for better engine breathing',
      category: 'Automotive',
      current_quantity: 100,
      reorder_point: 30,
      optimal_quantity: 180,
      unit_cost: 650.00,
      barcode: 'BC200000004',
      location: 'Warehouse B - Automotive Section',
      hsn_code: '8421',
      gst_rate: 28.00
    },
    {
      sku: 'AUTO-005',
      name: 'Timing Belt Kit',
      description: 'Complete timing belt replacement kit',
      category: 'Automotive',
      current_quantity: 25,
      reorder_point: 10,
      optimal_quantity: 50,
      unit_cost: 3200.00,
      barcode: 'BC200000005',
      location: 'Warehouse B - Automotive Section',
      hsn_code: '4010',
      gst_rate: 28.00
    },

    // Cables
    {
      sku: 'CBL-001',
      name: 'Power Cable 2.5 sqmm',
      description: 'Copper power cable for electrical wiring',
      category: 'Cables',
      current_quantity: 500,
      reorder_point: 100,
      optimal_quantity: 800,
      unit_cost: 85.00,
      barcode: 'BC300000001',
      location: 'Warehouse C - Cable Section',
      hsn_code: '8544',
      gst_rate: 18.00
    },
    {
      sku: 'CBL-002',
      name: 'Ethernet Cable Cat6',
      description: 'Category 6 ethernet cable for networking',
      category: 'Cables',
      current_quantity: 300,
      reorder_point: 75,
      optimal_quantity: 500,
      unit_cost: 25.00,
      barcode: 'BC300000002',
      location: 'Warehouse C - Cable Section',
      hsn_code: '8544',
      gst_rate: 18.00
    },
    {
      sku: 'CBL-003',
      name: 'Coaxial Cable RG6',
      description: 'Coaxial cable for TV and internet connections',
      category: 'Cables',
      current_quantity: 400,
      reorder_point: 80,
      optimal_quantity: 600,
      unit_cost: 45.00,
      barcode: 'BC300000003',
      location: 'Warehouse C - Cable Section',
      hsn_code: '8544',
      gst_rate: 18.00
    },
    {
      sku: 'CBL-004',
      name: 'Control Cable 1.5 sqmm',
      description: 'Multi-core control cable for automation',
      category: 'Cables',
      current_quantity: 250,
      reorder_point: 50,
      optimal_quantity: 400,
      unit_cost: 65.00,
      barcode: 'BC300000004',
      location: 'Warehouse C - Cable Section',
      hsn_code: '8544',
      gst_rate: 18.00
    },

    // Wires
    {
      sku: 'WR-001',
      name: 'Copper Wire 1.0 sqmm',
      description: 'Single core copper wire for electrical connections',
      category: 'Wires',
      current_quantity: 600,
      reorder_point: 150,
      optimal_quantity: 1000,
      unit_cost: 35.00,
      barcode: 'BC400000001',
      location: 'Warehouse C - Wire Section',
      hsn_code: '8544',
      gst_rate: 18.00
    },
    {
      sku: 'WR-002',
      name: 'Aluminum Wire 4.0 sqmm',
      description: 'Aluminum wire for overhead electrical lines',
      category: 'Wires',
      current_quantity: 200,
      reorder_point: 50,
      optimal_quantity: 350,
      unit_cost: 55.00,
      barcode: 'BC400000002',
      location: 'Warehouse C - Wire Section',
      hsn_code: '8544',
      gst_rate: 18.00
    },
    {
      sku: 'WR-003',
      name: 'Flexible Wire 0.75 sqmm',
      description: 'Flexible copper wire for appliances',
      category: 'Wires',
      current_quantity: 350,
      reorder_point: 75,
      optimal_quantity: 500,
      unit_cost: 28.00,
      barcode: 'BC400000003',
      location: 'Warehouse C - Wire Section',
      hsn_code: '8544',
      gst_rate: 18.00
    },
    {
      sku: 'WR-004',
      name: 'Grounding Wire 6.0 sqmm',
      description: 'Green grounding wire for electrical safety',
      category: 'Wires',
      current_quantity: 180,
      reorder_point: 40,
      optimal_quantity: 300,
      unit_cost: 75.00,
      barcode: 'BC400000004',
      location: 'Warehouse C - Wire Section',
      hsn_code: '8544',
      gst_rate: 18.00
    }
  ];

  const seedData = async () => {
    setIsLoading(true);
    
    try {
      console.log('🌱 Starting data seeding...');

      // Insert suppliers first
      console.log('📦 Inserting suppliers...');
      const { data: supplierData, error: supplierError } = await supabase
        .from('suppliers')
        .insert(suppliers)
        .select();

      if (supplierError) {
        console.error('Error inserting suppliers:', supplierError);
        toast.error('Failed to insert suppliers');
        return;
      }

      console.log(`✅ Inserted ${supplierData.length} suppliers`);

      // Insert inventory items with supplier references
      console.log('🔧 Inserting inventory items...');
      const inventoryWithSuppliers = inventoryItems.map((item, index) => ({
        ...item,
        supplier_id: supplierData[index % supplierData.length].id
      }));

      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory_items')
        .insert(inventoryWithSuppliers)
        .select();

      if (inventoryError) {
        console.error('Error inserting inventory items:', inventoryError);
        toast.error('Failed to insert inventory items');
        return;
      }

      console.log(`✅ Inserted ${inventoryData.length} inventory items`);

      toast.success(`Successfully seeded ${supplierData.length} suppliers and ${inventoryData.length} inventory items!`);
      console.log('🎉 Data seeding completed successfully!');

    } catch (error) {
      console.error('Error during data seeding:', error);
      toast.error('Failed to seed data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Seeder
        </CardTitle>
        <CardDescription>
          Add sample inventory data for electrical, automotive, cables, and wire components
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">What will be added:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 4 Suppliers (ElectroMax, AutoParts Direct, CableWorld, WireTech)</li>
            <li>• 18 Inventory Items across 4 categories:</li>
            <li>  - 5 Electrical components (circuit breakers, switches, sockets, LED lights)</li>
            <li>  - 5 Automotive parts (brake pads, oil filters, spark plugs, air filters)</li>
            <li>  - 4 Cable types (power, ethernet, coaxial, control cables)</li>
            <li>  - 4 Wire types (copper, aluminum, flexible, grounding wires)</li>
          </ul>
        </div>
        
        <Button 
          onClick={seedData} 
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary to-primary-glow"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Seeding Data...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Seed Inventory Data
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          This will add realistic sample data to your inventory system. 
          Refresh the page after seeding to see the new data.
        </p>
      </CardContent>
    </Card>
  );
};

export default DataSeeder;
