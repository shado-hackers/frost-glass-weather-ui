import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const WEATHER_API_KEY = Deno.env.get('WEATHER_API_KEY');
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');

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

    // Try OpenRouter for intelligent search if available
    if (OPENROUTER_API_KEY) {
      try {
        const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'openai/gpt-4o-mini',
            messages: [{
              role: 'user',
              content: `Find 5-8 real cities/locations matching "${query}". Return ONLY a JSON array like: [{"name":"CityName","region":"Region","country":"Country"}]. No explanations.`
            }],
            temperature: 0.2,
          })
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content;
          if (content) {
            try {
              const parsed = JSON.parse(content.match(/\[.*\]/s)?.[0] || '[]');
              results = Array.isArray(parsed) ? parsed.slice(0, 8) : [];
              console.log(`OpenRouter found ${results.length} suggestions`);
            } catch (e) {
              console.error('Failed to parse AI response:', e);
            }
          }
        }
      } catch (error) {
        console.error('OpenRouter error:', error);
      }
    }

    // Get coordinates from WeatherAPI for each suggestion
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

    // Fallback: Try WeatherAPI direct search
    if (results.length === 0) {
      console.log('Trying WeatherAPI direct search');
      const weatherResponse = await fetch(
        `https://api.weatherapi.com/v1/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}`
      );
      
      if (weatherResponse.ok) {
        const weatherData = await weatherResponse.json();
        if (Array.isArray(weatherData) && weatherData.length > 0) {
          results = weatherData.slice(0, 8).map((item: any, index: number) => ({
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
