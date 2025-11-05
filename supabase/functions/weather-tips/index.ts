import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { location, temperature, condition, humidity, cloudiness, precipitation } = await req.json();

    if (!OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`Generating weather tips for ${location}`);

    const prompt = `Based on these weather conditions for ${location}:
- Temperature: ${temperature}°C
- Condition: ${condition}
- Humidity: ${humidity}%
- Cloud Cover: ${cloudiness}%
- Precipitation: ${precipitation}mm

Provide a JSON response with:
1. "healthTips": 2-3 short health tips (array of strings)
2. "clothingRecommendation": Brief clothing suggestion (string)
3. "precipitationType": Type of precipitation (Rain/Snow/None) (string)
4. "areaCoverage": Coverage description (Scattered/Widespread/Isolated/None) (string)

Return ONLY valid JSON, no markdown formatting.`;

    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-exp:free',
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate weather tips' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content || '';
    console.log('OpenRouter response:', aiText);

    // Extract JSON from response
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const tips = JSON.parse(jsonMatch[0]);
      return new Response(
        JSON.stringify(tips),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback response
    return new Response(
      JSON.stringify({
        healthTips: ['Stay hydrated', 'Check weather updates regularly'],
        clothingRecommendation: 'Dress according to temperature',
        precipitationType: precipitation > 0 ? 'Rain' : 'None',
        areaCoverage: precipitation > 5 ? 'Widespread' : precipitation > 0 ? 'Scattered' : 'None'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in weather-tips function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
