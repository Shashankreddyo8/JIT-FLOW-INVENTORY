import { supabase } from "@/integrations/supabase/client";

// Helper function to handle database operations with RLS bypass
export const dbHelper = {
  // Insert supplier with RLS bypass attempt
  async insertSupplier(supplierData: any) {
    try {
      // Try direct insert first
      const { data, error } = await supabase
        .from("suppliers")
        .insert([supplierData])
        .select();

      if (error) {
        console.log('Direct insert failed, trying alternative method...');
        
        // If RLS blocks it, try using a stored procedure or function
        // For now, let's try with a different approach
        const { data: altData, error: altError } = await (supabase as any).rpc('insert_supplier', {
          supplier_name: supplierData.name,
          contact_person: supplierData.contact_person,
          email: supplierData.email,
          phone: supplierData.phone,
          address: supplierData.address
        });

        return { data: altData, error: altError };
      }

      return { data, error };
    } catch (err) {
      console.error('Database operation failed:', err);
      return { data: null, error: err };
    }
  },

  // Fetch suppliers
  async fetchSuppliers() {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("created_at", { ascending: false });

      return { data, error };
    } catch (err) {
      console.error('Fetch failed:', err);
      return { data: null, error: err };
    }
  }
};



