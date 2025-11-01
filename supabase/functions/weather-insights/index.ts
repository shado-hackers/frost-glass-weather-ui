import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { weatherData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { current, location, forecast } = weatherData;
    
    // Create a comprehensive weather summary prompt
    const prompt = `Analyze the following weather data for ${location.name}, ${location.country} and provide a comprehensive, engaging weather summary:

Current Conditions:
- Temperature: ${current.temp_c}°C (feels like ${current.feelslike_c}°C)
- Condition: ${current.condition.text}
- Humidity: ${current.humidity}%
- Wind: ${current.wind_kph} km/h ${current.wind_dir}
- UV Index: ${current.uv}
- Visibility: ${current.vis_km} km
- Pressure: ${current.pressure_mb} mb

Today's Forecast:
- High: ${forecast.forecastday[0].day.maxtemp_c}°C
- Low: ${forecast.forecastday[0].day.mintemp_c}°C
- Chance of rain: ${forecast.forecastday[0].day.daily_chance_of_rain}%
- Condition: ${forecast.forecastday[0].day.condition.text}

Tomorrow's Forecast:
- High: ${forecast.forecastday[1]?.day.maxtemp_c}°C
- Low: ${forecast.forecastday[1]?.day.mintemp_c}°C
- Chance of rain: ${forecast.forecastday[1]?.day.daily_chance_of_rain}%

Provide a natural, conversational weather summary that:
1. Summarizes the current weather in a friendly tone
2. Highlights what to wear or bring today
3. Mentions any weather warnings or unusual conditions
4. Gives a brief outlook for tomorrow
5. Includes 2-3 specific, actionable tips for the day

Keep it under 150 words, engaging, and personable.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a friendly, knowledgeable weather expert who provides clear, actionable weather insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content;

    if (!summary) {
      throw new Error("No summary generated");
    }

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in weather-insights function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
