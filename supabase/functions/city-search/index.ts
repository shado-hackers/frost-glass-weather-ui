import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const WEATHER_API_KEY = Deno.env.get('WEATHER_API_KEY') || '96400e6204fd4ef095123146252610';
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyBsKdhrTjWEg9LRH9pFDRf4giYYyvqTbdo';

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

    if (!query || query.length < 1) {
      return new Response(
        JSON.stringify({ error: 'Query too short' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Try WeatherAPI first
    const weatherResponse = await fetch(
      `https://api.weatherapi.com/v1/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}`
    );

    if (weatherResponse.ok) {
      const data = await weatherResponse.json();
      if (data && data.length > 0) {
        return new Response(
          JSON.stringify({ results: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fallback to Gemini AI for hard-to-find locations
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Find the latitude and longitude for: "${query}". Return ONLY a JSON array with this format: [{"name":"City Name","country":"Country","lat":number,"lon":number}]. If multiple matches, return up to 5. If no match, return empty array.`
            }]
          }]
        })
      }
    );

    if (geminiResponse.ok) {
      const geminiData = await geminiResponse.json();
      const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

      const jsonMatch = aiText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const locations = JSON.parse(jsonMatch[0]);
        
        if (locations && locations.length > 0) {
          const convertedData = locations.map((item: any) => ({
            id: item.lat + item.lon,
            name: item.name,
            region: '',
            country: item.country,
            lat: item.lat,
            lon: item.lon,
            url: `${item.name}-${item.country}`
          }));

          return new Response(
            JSON.stringify({ results: convertedData }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    return new Response(
      JSON.stringify({ results: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in city-search function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
