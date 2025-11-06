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
      console.error('Weather API key not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Use WeatherAPI for accurate location search with coordinates
    const weatherResponse = await fetch(
      `https://api.weatherapi.com/v1/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}`
    );
    
    if (!weatherResponse.ok) {
      console.error('WeatherAPI search failed:', weatherResponse.status);
      return new Response(
        JSON.stringify({ error: 'Location search failed', results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const weatherResults = await weatherResponse.json();
    console.log(`WeatherAPI found ${weatherResults.length} results`);

    // Format results with accurate coordinates
    const results = weatherResults
      .slice(0, 8)
      .map((item: any, index: number) => ({
        id: item.id || index,
        name: item.name,
        region: item.region || '',
        country: item.country,
        lat: item.lat,
        lon: item.lon,
        url: item.url || ''
      }));

    return new Response(
      JSON.stringify({ results }),
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
