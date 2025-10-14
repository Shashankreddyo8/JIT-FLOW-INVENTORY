import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { inventoryItemId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch item and historical data
    const { data: item } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', inventoryItemId)
      .single();

    if (!item) {
      throw new Error('Item not found');
    }

    // Get historical orders
    const { data: orders } = await supabase
      .from('order_items')
      .select('quantity, created_at')
      .eq('inventory_item_id', inventoryItemId)
      .order('created_at', { ascending: false })
      .limit(30);

    const prompt = `Analyze this inventory item and predict demand for the next 30 days:
Item: ${item.name}
Current stock: ${item.current_quantity}
Reorder point: ${item.reorder_point}
Optimal quantity: ${item.optimal_quantity}
Recent orders: ${JSON.stringify(orders || [])}

Provide a JSON forecast with:
- forecastedDemand (integer for next 30 days)
- confidenceScore (0-1)
- trendAnalysis (string describing the trend)
- recommendation (string with actionable advice)`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an inventory forecasting expert. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('AI forecasting failed');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    const forecast = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      forecastedDemand: item.optimal_quantity,
      confidenceScore: 0.7,
      trendAnalysis: 'Steady demand pattern',
      recommendation: 'Maintain current stock levels'
    };

    // Save forecast to database
    await supabase.from('demand_forecasts').insert({
      inventory_item_id: inventoryItemId,
      forecasted_demand: forecast.forecastedDemand,
      confidence_score: forecast.confidenceScore,
      forecast_period: '30_days'
    });

    return new Response(JSON.stringify(forecast), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Forecast error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
