import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const WEATHER_API_KEY = Deno.env.get('WEATHER_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Query must be at least 2 characters', results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`Searching for: ${query} using WeatherAPI`);

    if (!WEATHER_API_KEY) {
      console.error('WEATHER_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Weather API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Fetch from WeatherAPI only (much faster without rate-limited AI calls)
    const response = await fetch(
      `https://api.weatherapi.com/v1/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('WeatherAPI error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to search cities', results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const weatherApiResults = await response.json();
    console.log(`WeatherAPI found ${weatherApiResults.length} results`);

    // Limit to 8 results for faster display
    const finalResults = (Array.isArray(weatherApiResults) ? weatherApiResults : []).slice(0, 8);

    return new Response(
      JSON.stringify({ results: finalResults }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in city-search function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', results: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
