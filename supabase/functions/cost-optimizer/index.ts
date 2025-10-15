import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch inventory items with supplier data
    const { data: items, error: itemsError } = await supabase
      .from('inventory_items')
      .select(`
        *,
        suppliers (
          id,
          name,
          rating,
          total_orders,
          average_delivery_days,
          gst_number,
          state
        )
      `);

    if (itemsError) throw itemsError;

    // Fetch recent orders for market price analysis
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (ordersError) throw ordersError;

    const prompt = `Analyze the following inventory and order data from an Indian manufacturing company to provide cost optimization recommendations:

Inventory Items: ${JSON.stringify(items, null, 2)}
Recent Orders: ${JSON.stringify(orders, null, 2)}

Consider Indian market factors:
- GST rates (5%, 12%, 18%, 28%)
- Interstate vs intrastate supplier costs
- Bulk purchase discounts common in Indian markets
- Monsoon season supply chain considerations
- Indian festival season demand patterns

Provide 5-10 actionable cost optimization recommendations in this exact JSON format:
{
  "recommendations": [
    {
      "inventory_item_id": "uuid",
      "item_name": "string",
      "recommendation_type": "bulk_discount|alternate_supplier|reorder_optimization|gst_optimization",
      "current_cost": number,
      "potential_cost": number,
      "savings_amount": number,
      "savings_percentage": number,
      "details": {
        "description": "string",
        "action_steps": ["step1", "step2"],
        "implementation_timeline": "string",
        "risk_level": "low|medium|high"
      }
    }
  ]
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert supply chain analyst specializing in Indian manufacturing and cost optimization.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI request failed:', await aiResponse.text());
      throw new Error('Cost analysis failed');
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0].message.content;
    
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    const recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : { recommendations: [] };

    // Store recommendations in database
    for (const rec of recommendations.recommendations) {
      await supabase.from('cost_optimization_recommendations').insert({
        inventory_item_id: rec.inventory_item_id,
        recommendation_type: rec.recommendation_type,
        current_cost: rec.current_cost,
        potential_cost: rec.potential_cost,
        savings_amount: rec.savings_amount,
        savings_percentage: rec.savings_percentage,
        details: rec.details,
        status: 'pending'
      });
    }

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Cost optimizer error:', error);
    return new Response(JSON.stringify({ error: 'Cost optimization analysis failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});