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

    // Try InfoQueries AI search for worldwide city discovery
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
          q: query,
          type: '0'
        })
      });

      if (infoQueriesResponse.ok) {
        const aiData = await infoQueriesResponse.json();
        const aiContent = aiData?.result || aiData?.answer || '';
        
        if (aiContent) {
          console.log('InfoQueries AI response received');
          // Extract city names from AI response
          const cityMatches = aiContent.match(/([A-Z][a-zA-Z\s'-]+),\s*([A-Z][a-zA-Z\s'-]*),?\s*([A-Z][a-zA-Z\s]+)/g);
          
          if (cityMatches && cityMatches.length > 0) {
            results = cityMatches.slice(0, 20).map((match: string) => {
              const parts = match.split(',').map(p => p.trim());
              return {
                name: parts[0] || query,
                region: parts[1] || '',
                country: parts[2] || parts[1] || ''
              };
            });
            console.log(`InfoQueries found ${results.length} city suggestions`);
          }
        }
      }
    } catch (error) {
      console.error('InfoQueries error:', error);
    }

    // Get coordinates from WeatherAPI for each suggestion (no limits)
    const resultsWithCoords = await Promise.all(
      results.map(async (city, index) => {
        try {
          const searchQuery = `${city.name}, ${city.country}`;
          const weatherResponse = await fetch(
            `https://api.weatherapi.com/v1/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(searchQuery)}`
          );
          
          if (weatherResponse.ok) {
            const weatherData = await weatherResponse.json();
            if (Array.isArray(weatherData) && weatherData.length > 0) {
              const match = weatherData[0];
              return {
                id: index,
                name: match.name || city.name,
                region: match.region || city.region || '',
                country: match.country || city.country,
                lat: match.lat || 0,
                lon: match.lon || 0,
                url: match.url || ''
              };
            }
          }
        } catch (e) {
          console.error(`Failed to get coords for ${city.name}:`, e);
        }
        
        // Return without coords if weather API fails
        return {
          id: index,
          name: city.name,
          region: city.region || '',
          country: city.country,
          lat: 0,
          lon: 0,
          url: ''
        };
      })
    );

    // Fallback: Try WeatherAPI direct search (no limits)
    if (results.length === 0) {
      console.log('Trying WeatherAPI direct search');
      const weatherResponse = await fetch(
        `https://api.weatherapi.com/v1/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}`
      );
      
      if (weatherResponse.ok) {
        const weatherData = await weatherResponse.json();
        if (Array.isArray(weatherData) && weatherData.length > 0) {
          results = weatherData.map((item: any, index: number) => ({
            id: item.id || index,
            name: item.name,
            region: item.region || '',
            country: item.country,
            lat: item.lat || 0,
            lon: item.lon || 0,
            url: item.url || ''
          }));
          console.log(`WeatherAPI direct found ${results.length} results`);
        }
      }
    }

    console.log(`Returning ${resultsWithCoords.length} results`);

    const finalResults = resultsWithCoords.length > 0 ? resultsWithCoords : results;
    console.log(`Final return: ${finalResults.length} results`);

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
