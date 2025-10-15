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
    const { orderId, origin, destination, courierPreference } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const prompt = `You are an Indian logistics expert. Calculate the optimal delivery route considering Indian road networks, traffic patterns, and courier services.

Origin: ${origin.address}, Pincode: ${origin.pincode}
Destination: ${destination.address}, Pincode: ${destination.pincode}
Preferred Courier: ${courierPreference || 'Any'}

Indian Courier Services Available:
- Delhivery (Strong in North India)
- Blue Dart (Premium, major cities)
- DTDC (Pan-India coverage)
- Ecom Express (E-commerce focused)
- India Post (Rural reach)

Consider:
- NH (National Highway) routes
- State highway conditions
- Toll plazas
- Traffic congestion in metros (Delhi, Mumbai, Bangalore)
- Monsoon delays (June-September)
- Festival season rush

Provide route analysis in this JSON format:
{
  "recommended_courier": "string",
  "distance_km": number,
  "estimated_time_hours": number,
  "route_waypoints": ["city1", "city2"],
  "cost_estimate": number,
  "carbon_emissions": number,
  "route_description": "string",
  "alternative_routes": [
    {
      "courier": "string",
      "distance_km": number,
      "estimated_time_hours": number,
      "cost_estimate": number
    }
  ],
  "weather_warnings": ["warning1"],
  "optimal_departure_time": "string"
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
          { role: 'system', content: 'You are an expert in Indian logistics and supply chain route optimization.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI request failed:', await aiResponse.text());
      throw new Error('Route planning failed');
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0].message.content;
    
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    const routeData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (routeData && orderId) {
      // Store route in database
      await supabase.from('delivery_routes').insert({
        order_id: orderId,
        origin_address: origin.address,
        destination_address: destination.address,
        origin_pincode: origin.pincode,
        destination_pincode: destination.pincode,
        distance_km: routeData.distance_km,
        estimated_time_hours: routeData.estimated_time_hours,
        route_waypoints: routeData.route_waypoints,
        courier_service: routeData.recommended_courier,
        cost_estimate: routeData.cost_estimate,
        carbon_emissions: routeData.carbon_emissions,
        status: 'planned'
      });
    }

    return new Response(JSON.stringify(routeData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Route planner error:', error);
    return new Response(JSON.stringify({ error: 'Route planning failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});