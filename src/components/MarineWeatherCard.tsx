import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Waves, Navigation, Wind, Thermometer, ChevronDown, ChevronUp } from 'lucide-react';
import { WeatherData } from '@/types/weather';
import { toast } from 'sonner';

interface MarineWeatherCardProps {
  data: WeatherData;
}

interface MarineData {
  wave_height: number | null;
  wave_direction: number | null;
  wave_period: number | null;
  wind_wave_height: number | null;
  wind_wave_direction: number | null;
  wind_wave_period: number | null;
  sea_surface_temperature: number | null;
}

const degreesToCardinal = (degrees: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

export const MarineWeatherCard = ({ data }: MarineWeatherCardProps) => {
  const [marineData, setMarineData] = useState<MarineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchMarineData();
  }, [data.location.lat, data.location.lon]);

  const fetchMarineData = async () => {
    setLoading(true);
    try {
      const { lat, lon } = data.location;
      const params = "wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_direction,wind_wave_period,sea_surface_temperature";
      const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}&hourly=${params}&timezone=auto`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch marine data');
      
      const result = await response.json();
      
      if (result.hourly) {
        const now = new Date();
        let currentIndex = result.hourly.time.findIndex((timeStr: string) => new Date(timeStr) > now) - 1;
        if (currentIndex < 0) currentIndex = 0;
        
        setMarineData({
          wave_height: result.hourly.wave_height?.[currentIndex] ?? null,
          wave_direction: result.hourly.wave_direction?.[currentIndex] ?? null,
          wave_period: result.hourly.wave_period?.[currentIndex] ?? null,
          wind_wave_height: result.hourly.wind_wave_height?.[currentIndex] ?? null,
          wind_wave_direction: result.hourly.wind_wave_direction?.[currentIndex] ?? null,
          wind_wave_period: result.hourly.wind_wave_period?.[currentIndex] ?? null,
          sea_surface_temperature: result.hourly.sea_surface_temperature?.[currentIndex] ?? null,
        });
      }
    } catch (error) {
      console.error('Marine data error:', error);
      toast.error('Marine data unavailable for this location');
      setMarineData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card border-white/20 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-white">
            <Waves className="h-5 w-5 text-blue-400" />
            Marine Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!marineData) return null;

  const hasData = Object.values(marineData).some(val => val !== null);
  if (!hasData) return null;

  return (
    <Card className="glass-card border-white/20 overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader 
        className="pb-3 cursor-pointer active:scale-[0.99] transition-transform"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between text-base sm:text-lg text-white">
          <div className="flex items-center gap-2">
            <Waves className="h-5 w-5 text-blue-400" />
            Marine Conditions
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-white/70 transition-transform" />
          ) : (
            <ChevronDown className="h-5 w-5 text-white/70 transition-transform" />
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div 
          className={`grid gap-3 transition-all duration-500 ease-in-out origin-top ${
            isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-2">
              {/* Wave Height */}
              {marineData.wave_height !== null && (
                <div className="bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-white/20 transition-all duration-300 hover:bg-white/15 hover:border-blue-400/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Waves className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-white/70">Wave Height</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-semibold text-blue-400">
                    {marineData.wave_height.toFixed(1)}
                    <span className="text-sm ml-1">m</span>
                  </div>
                </div>
              )}

              {/* Wave Direction */}
              {marineData.wave_direction !== null && (
                <div className="bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-white/20 transition-all duration-300 hover:bg-white/15 hover:border-indigo-400/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs text-white/70">Wave Dir</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-semibold text-indigo-400">
                    {marineData.wave_direction.toFixed(0)}°
                    <span className="text-sm ml-1">({degreesToCardinal(marineData.wave_direction)})</span>
                  </div>
                </div>
              )}

              {/* Wave Period */}
              {marineData.wave_period !== null && (
                <div className="bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-white/20 transition-all duration-300 hover:bg-white/15 hover:border-cyan-400/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Waves className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs text-white/70">Wave Period</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-semibold text-cyan-400">
                    {marineData.wave_period.toFixed(1)}
                    <span className="text-sm ml-1">s</span>
                  </div>
                </div>
              )}

              {/* Wind Wave Height */}
              {marineData.wind_wave_height !== null && (
                <div className="bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-white/20 transition-all duration-300 hover:bg-white/15 hover:border-sky-400/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="h-4 w-4 text-sky-400" />
                    <span className="text-xs text-white/70">Wind Wave</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-semibold text-sky-400">
                    {marineData.wind_wave_height.toFixed(1)}
                    <span className="text-sm ml-1">m</span>
                  </div>
                </div>
              )}

              {/* Wind Wave Direction */}
              {marineData.wind_wave_direction !== null && (
                <div className="bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-white/20 transition-all duration-300 hover:bg-white/15 hover:border-purple-400/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="h-4 w-4 text-purple-400" />
                    <span className="text-xs text-white/70">Wind Dir</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-semibold text-purple-400">
                    {marineData.wind_wave_direction.toFixed(0)}°
                    <span className="text-sm ml-1">({degreesToCardinal(marineData.wind_wave_direction)})</span>
                  </div>
                </div>
              )}

              {/* Sea Temperature */}
              {marineData.sea_surface_temperature !== null && (
                <div className="bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-white/20 transition-all duration-300 hover:bg-white/15 hover:border-orange-400/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="h-4 w-4 text-orange-400" />
                    <span className="text-xs text-white/70">Sea Temp</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-semibold text-orange-400">
                    {marineData.sea_surface_temperature.toFixed(1)}
                    <span className="text-sm ml-1">°C</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview when collapsed */}
        {!isExpanded && (
          <div className="flex items-center justify-around py-2 animate-fade-in">
            {marineData.wave_height !== null && (
              <div className="text-center">
                <div className="text-xs text-white/60 mb-1">Waves</div>
                <div className="text-lg font-semibold text-blue-400">{marineData.wave_height.toFixed(1)}m</div>
              </div>
            )}
            {marineData.sea_surface_temperature !== null && (
              <div className="text-center">
                <div className="text-xs text-white/60 mb-1">Sea Temp</div>
                <div className="text-lg font-semibold text-orange-400">{marineData.sea_surface_temperature.toFixed(1)}°C</div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
