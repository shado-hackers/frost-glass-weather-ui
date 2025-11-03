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
    if (!data.results) return [];
    
    return data.results.map((item: any) => ({
      id: item.id,
      name: item.name,
      region: item.admin1 || '',
      country: item.country || '',
      lat: item.latitude,
      lon: item.longitude,
      url: `${item.name}-${item.country}`
    }));
  } catch (error) {
    console.error('Open-Meteo error:', error);
    return [];
  }
}

// Helper to fetch from Gemini AI
async function fetchGeminiResults(query: string) {
  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Find the latitude and longitude for: "${query}". Return ONLY a JSON array with this format: [{"name":"City Name","region":"Region/State","country":"Country","lat":number,"lon":number}]. If multiple matches, return up to 5. If no match, return empty array.`
            }]
          }]
        })
      }
    );

    if (!geminiResponse.ok) return [];
    
    const geminiData = await geminiResponse.json();
    const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const jsonMatch = aiText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const locations = JSON.parse(jsonMatch[0]);
      return locations.map((item: any) => ({
        id: item.lat + item.lon,
        name: item.name,
        region: item.region || '',
        country: item.country,
        lat: item.lat,
        lon: item.lon,
        url: `${item.name}-${item.country}`
      }));
    }
    return [];
  } catch (error) {
    console.error('Gemini AI error:', error);
    return [];
  }
}

// Helper to deduplicate results based on proximity
function deduplicateLocations(locations: any[]) {
  const unique: any[] = [];
  const threshold = 0.1; // ~11km
  
  for (const loc of locations) {
    const isDuplicate = unique.some(existing => {
      const latDiff = Math.abs(existing.lat - loc.lat);
      const lonDiff = Math.abs(existing.lon - loc.lon);
      return latDiff < threshold && lonDiff < threshold;
    });
    
    if (!isDuplicate) {
      unique.push(loc);
    }
  }
  
  return unique;
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

    console.log(`Searching for: ${query} across all APIs`);

    // Fetch from all three APIs concurrently for better results
    const [weatherApiResults, openMeteoResults, geminiResults] = await Promise.all([
      fetch(`https://api.weatherapi.com/v1/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}`)
        .then(res => res.ok ? res.json() : [])
        .catch(err => {
          console.error('WeatherAPI error:', err);
          return [];
        }),
      fetchOpenMeteoResults(query),
      fetchGeminiResults(query)
    ]);

    // Combine and deduplicate all results
    const allResults = [
      ...(Array.isArray(weatherApiResults) ? weatherApiResults : []),
      ...openMeteoResults,
      ...geminiResults
    ];

    const uniqueResults = deduplicateLocations(allResults);
    
    // Limit to 15 results
    const finalResults = uniqueResults.slice(0, 15);

    console.log(`Found ${finalResults.length} unique locations from ${allResults.length} total results`);

    return new Response(
      JSON.stringify({ results: finalResults }),
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
