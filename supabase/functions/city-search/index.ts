import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const WEATHER_API_KEY = Deno.env.get('WEATHER_API_KEY') || '96400e6204fd4ef095123146252610';
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyBsKdhrTjWEg9LRH9pFDRf4giYYyvqTbdo';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to fetch from Open-Meteo Geocoding API
async function fetchOpenMeteoResults(query: string) {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) return [];
    
    // Transform Open-Meteo results to match our format
    return data.results.map((result: any, index: number) => ({
      id: 1000000 + index,
      name: result.name,
      region: result.admin1 || result.admin2 || '',
      country: result.country || '',
      lat: result.latitude,
      lon: result.longitude,
      url: `${result.name.toLowerCase().replace(/\s+/g, '-')}-${result.country.toLowerCase()}`
    }));
  } catch (error) {
    console.error('Open-Meteo geocoding error:', error);
    return [];
  }
}

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

    console.log(`Searching for: ${query}`);
    
    // Fetch from both WeatherAPI and Open-Meteo in parallel
    const [weatherApiResults, openMeteoResults] = await Promise.all([
      // WeatherAPI
      fetch(`https://api.weatherapi.com/v1/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}`)
        .then(res => res.ok ? res.json() : [])
        .catch(err => {
          console.error('WeatherAPI error:', err);
          return [];
        }),
      // Open-Meteo Geocoding
      fetchOpenMeteoResults(query)
    ]);
    
    console.log(`WeatherAPI: ${weatherApiResults.length || 0} results, Open-Meteo: ${openMeteoResults.length} results`);
    
    // Merge and deduplicate results based on location proximity
    const allResults = [...(weatherApiResults || []), ...openMeteoResults];
    const uniqueResults = [];
    const seen = new Set();
    
    for (const result of allResults) {
      // Create a unique key based on coordinates rounded to 2 decimal places
      const key = `${result.lat.toFixed(2)},${result.lon.toFixed(2)}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueResults.push(result);
      }
    }
    
    console.log(`Returning ${uniqueResults.length} unique results`);
    
    // Return merged results if we have any
    if (uniqueResults.length > 0) {
      return new Response(
        JSON.stringify({ results: uniqueResults.slice(0, 15) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
