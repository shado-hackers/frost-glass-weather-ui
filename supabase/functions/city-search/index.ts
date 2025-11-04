import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const WEATHER_API_KEY = Deno.env.get('WEATHER_API_KEY');
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to fetch from Gemini AI with retry logic
async function fetchGeminiResults(query: string, retryCount = 0): Promise<any[]> {
  if (!GEMINI_API_KEY) {
    console.log('Gemini API key not configured, skipping Gemini search');
    return [];
  }

  // Use gemini-2.5-flash instead of gemini-2.0-flash-exp for better rate limits
  const model = 'gemini-2.0-flash-exp';
  const maxRetries = 2;
  const baseDelay = 1000;

  try {
    console.log(`Fetching Gemini results for: ${query} (attempt ${retryCount + 1})`);
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
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

    // Handle rate limiting with exponential backoff
    if (geminiResponse.status === 429 && retryCount < maxRetries) {
      const delay = baseDelay * Math.pow(2, retryCount);
      console.log(`Rate limited by Gemini, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchGeminiResults(query, retryCount + 1);
    }

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errorText);
      return [];
    }
    
    const geminiData = await geminiResponse.json();
    const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    const jsonMatch = aiText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const locations = JSON.parse(jsonMatch[0]);
      const formattedResults = locations.map((item: any) => ({
        id: item.lat + item.lon,
        name: item.name,
        region: item.region || '',
        country: item.country,
        lat: item.lat,
        lon: item.lon,
        url: `${item.name}-${item.country}`
      }));
      console.log(`Gemini found ${formattedResults.length} locations`);
      return formattedResults;
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

    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Query must be at least 2 characters', results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`Searching for: ${query} using WeatherAPI and Gemini AI`);

    if (!WEATHER_API_KEY) {
      console.error('WEATHER_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Weather API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Fetch from both APIs concurrently
    const [weatherApiResults, geminiResults] = await Promise.all([
      fetch(`https://api.weatherapi.com/v1/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}`)
        .then(async res => {
          if (!res.ok) {
            const errorText = await res.text();
            console.error('WeatherAPI error:', res.status, errorText);
            return [];
          }
          const data = await res.json();
          console.log(`WeatherAPI found ${data.length} results`);
          return data;
        })
        .catch(err => {
          console.error('WeatherAPI fetch error:', err);
          return [];
        }),
      fetchGeminiResults(query)
    ]);

    // Combine all results
    const allResults = [
      ...(Array.isArray(weatherApiResults) ? weatherApiResults : []),
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
