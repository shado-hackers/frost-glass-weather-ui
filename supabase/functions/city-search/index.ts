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

    console.log(`Searching for: ${query} using OpenRouter + WeatherAPI`);

    if (!WEATHER_API_KEY || !OPENROUTER_API_KEY) {
      console.error('API keys not configured');
      return new Response(
        JSON.stringify({ error: 'API keys not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Use OpenRouter with fast model for intelligent location search
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `Return only a JSON array of 5-8 most relevant city/location matches for: "${query}". Format: [{"name":"CityName","region":"Region","country":"Country"}]. Include major cities and common variations. Be concise.`
        }],
        temperature: 0.3,
      })
    });

    let aiResults = [];
    if (openRouterResponse.ok) {
      const aiData = await openRouterResponse.json();
      const content = aiData.choices?.[0]?.message?.content;
      if (content) {
        try {
          const parsed = JSON.parse(content.match(/\[.*\]/s)?.[0] || '[]');
          aiResults = Array.isArray(parsed) ? parsed : [];
          console.log(`OpenRouter found ${aiResults.length} results`);
        } catch (e) {
          console.error('Failed to parse AI response:', e);
        }
      }
    }

    // Fetch from WeatherAPI as backup
    const weatherResponse = await fetch(
      `https://api.weatherapi.com/v1/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}`
    );
    
    let weatherResults = [];
    if (weatherResponse.ok) {
      weatherResults = await weatherResponse.json();
      console.log(`WeatherAPI found ${weatherResults.length} results`);
    }

    // Merge and deduplicate results, prioritize AI results
    const combinedResults = [...aiResults, ...weatherResults]
      .filter((item, index, self) => 
        index === self.findIndex(t => t.name === item.name && t.country === item.country)
      )
      .slice(0, 8);

    const finalResults = combinedResults.length > 0 ? combinedResults : [];

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
