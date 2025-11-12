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

    console.log(`Searching for: ${query}`);

    if (!WEATHER_API_KEY) {
      console.error('Weather API key not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    let results: any[] = [];
    let weatherDirectResults: any[] = [];

    // ALWAYS try WeatherAPI direct search first for accurate results
    try {
      console.log('Searching WeatherAPI directly');
      const weatherResponse = await fetch(
        `https://api.weatherapi.com/v1/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}`
      );
      
      if (weatherResponse.ok) {
        const weatherData = await weatherResponse.json();
        if (Array.isArray(weatherData) && weatherData.length > 0) {
          weatherDirectResults = weatherData.map((item: any, index: number) => ({
            id: item.id || index,
            name: item.name,
            region: item.region || '',
            country: item.country,
            lat: item.lat || 0,
            lon: item.lon || 0,
            url: item.url || ''
          }));
          console.log(`WeatherAPI found ${weatherDirectResults.length} direct results`);
        }
      }
    } catch (error) {
      console.error('WeatherAPI direct search error:', error);
    }

    // Also try InfoQueries for additional suggestions
    try {
      const infoQueriesResponse = await fetch('https://infoqueries.com/api/aisearch', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          'origin': 'https://infoqueries.com',
          'referer': `https://infoqueries.com/searchai?q=${encodeURIComponent(query)}&type=0`,
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({
          q: `cities named ${query}`,
          type: '0'
        })
      });

      if (infoQueriesResponse.ok) {
        const aiData = await infoQueriesResponse.json();
        const aiContent = aiData?.result || aiData?.answer || '';
        
        if (aiContent) {
          console.log('InfoQueries response:', aiContent.substring(0, 200));
          // Multiple pattern matching for city extraction
          const patterns = [
            /([A-Z][a-zA-Z\s'-]+),\s*([A-Z][a-zA-Z\s'-]*),?\s*([A-Z][a-zA-Z\s]+)/g,
            /([A-Z][a-zA-Z\s'-]+)\s+in\s+([A-Z][a-zA-Z\s]+)/gi,
            /([A-Z][a-zA-Z\s'-]+)\s*\(([^)]+)\)/g
          ];
          
          for (const pattern of patterns) {
            const matches = aiContent.matchAll(pattern);
            for (const match of matches) {
              const cityName = match[1]?.trim();
              const location = match[2]?.trim() || match[3]?.trim();
              if (cityName && cityName.length > 1) {
                results.push({
                  name: cityName,
                  region: '',
                  country: location || ''
                });
              }
            }
          }
          
          if (results.length > 0) {
            console.log(`InfoQueries extracted ${results.length} city suggestions`);
          }
        }
      }
    } catch (error) {
      console.error('InfoQueries error:', error);
    }

    // Combine results - prioritize WeatherAPI direct results (fast + accurate)
    let allResults = [...weatherDirectResults];
    
    console.log(`Using ${weatherDirectResults.length} WeatherAPI results (fast and accurate)`);

    console.log(`Total results: ${allResults.length} (${weatherDirectResults.length} from WeatherAPI, ${allResults.length - weatherDirectResults.length} from InfoQueries)`);

    return new Response(
      JSON.stringify({ results: allResults }),
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
