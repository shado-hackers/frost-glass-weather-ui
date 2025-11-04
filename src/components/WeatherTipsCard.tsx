import { useEffect, useState } from 'react';
import { WeatherData } from '@/types/weather';
import { Brain, Shirt, Cloud, Droplets, Loader2 } from 'lucide-react';

interface WeatherTipsCardProps {
  data: WeatherData;
}

interface WeatherTips {
  healthTips: string[];
  clothingRecommendation: string;
  precipitationType: string;
  areaCoverage: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const WeatherTipsCard = ({ data }: WeatherTipsCardProps) => {
  const [tips, setTips] = useState<WeatherTips | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeatherTips = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/weather-tips`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            location: `${data.location.name}, ${data.location.country}`,
            temperature: data.current.temp_c,
            condition: data.current.condition.text,
            humidity: data.current.humidity,
            cloudiness: data.current.cloud,
            precipitation: data.current.precip_mm
          })
        });

        if (response.ok) {
          const tipsData = await response.json();
          setTips(tipsData);
        }
      } catch (error) {
        console.error('Error fetching weather tips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherTips();
  }, [data]);

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-white/10 backdrop-blur-xl bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-pink-900/40 shadow-2xl animate-scale-in">
        <div className="p-6 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-300 animate-spin" />
        </div>
      </div>
    );
  }

  if (!tips) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 backdrop-blur-xl bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-pink-900/40 shadow-2xl animate-scale-in">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 animate-pulse-slow" />
      
      <div className="relative p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-300" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-white">AI Weather Insights</h2>
        </div>

        {/* Health Tips */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-blue-300" />
            </div>
            <h3 className="text-sm font-semibold text-blue-200">Health Tips</h3>
          </div>
          <ul className="space-y-2">
            {tips.healthTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-white/90">
                <span className="text-blue-400 mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Clothing Recommendation */}
        <div className="mb-5 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Shirt className="w-5 h-5 text-purple-300" />
            <h3 className="text-sm font-semibold text-purple-200">Clothing Recommendation</h3>
          </div>
          <p className="text-sm text-white/90 pl-7">{tips.clothingRecommendation}</p>
        </div>

        {/* Precipitation & Coverage Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Cloudiness */}
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Cloud className="w-4 h-4 text-cyan-300" />
              <h3 className="text-xs font-semibold text-cyan-200">Cloudiness</h3>
            </div>
            <p className="text-lg font-bold text-white">{data.current.cloud}%</p>
          </div>

          {/* Precipitation Type */}
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-blue-300" />
              <h3 className="text-xs font-semibold text-blue-200">Precip Type</h3>
            </div>
            <p className="text-sm font-semibold text-white">{tips.precipitationType}</p>
          </div>

          {/* Area Coverage */}
          <div className="col-span-2 p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Cloud className="w-4 h-4 text-purple-300" />
              <h3 className="text-xs font-semibold text-purple-200">Area Coverage</h3>
            </div>
            <p className="text-sm font-semibold text-white">{tips.areaCoverage}</p>
          </div>
        </div>

        {/* AI Badge */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-purple-300/70">
          <Brain className="w-3 h-3" />
          <span>Powered by Gemini AI</span>
        </div>
      </div>
    </div>
  );
};
