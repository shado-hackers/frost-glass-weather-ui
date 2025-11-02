import { useEffect, useState } from 'react';
import { WeatherData } from '@/types/weather';
import { Waves, Wind, Navigation } from 'lucide-react';

interface MarineWeatherCardProps {
  data: WeatherData;
}

interface MarineData {
  waveHeight: number | null;
  waveDirection: number | null;
  wavePeriod: number | null;
  swellHeight: number | null;
  swellDirection: number | null;
  swellPeriod: number | null;
  windWaveHeight: number | null;
  windWaveDirection: number | null;
  windWavePeriod: number | null;
  oceanCurrentVelocity: number | null;
  oceanCurrentDirection: number | null;
  maxWaveHeight?: number | null;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const MarineWeatherCard = ({ data }: MarineWeatherCardProps) => {
  const [marineData, setMarineData] = useState<MarineData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarineWeather = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/marine-weather`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            lat: data.location.lat,
            lon: data.location.lon
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch marine weather');
        }

        const marineResponse = await response.json();
        
        if (marineResponse.current) {
          const newData = {
            waveHeight: marineResponse.current.wave_height || null,
            waveDirection: marineResponse.current.wave_direction || null,
            wavePeriod: marineResponse.current.wave_period || null,
            swellHeight: marineResponse.current.swell_wave_height || null,
            swellDirection: marineResponse.current.swell_wave_direction || null,
            swellPeriod: marineResponse.current.swell_wave_period || null,
            windWaveHeight: marineResponse.current.wind_wave_height || null,
            windWaveDirection: marineResponse.current.wind_wave_direction || null,
            windWavePeriod: marineResponse.current.wind_wave_period || null,
            oceanCurrentVelocity: marineResponse.current.ocean_current_velocity || null,
            oceanCurrentDirection: marineResponse.current.ocean_current_direction || null,
            maxWaveHeight: marineResponse.daily?.wave_height_max?.[0] || null,
          };
          
          // Only set data if at least one value is not null
          if (Object.values(newData).some(val => val !== null)) {
            setMarineData(newData);
          } else {
            setMarineData(null);
          }
        }
      } catch (error) {
        console.error('Error fetching marine weather:', error);
        setMarineData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMarineWeather();
  }, [data.location.lat, data.location.lon]);

  if (loading) {
    return (
      <div className="backdrop-blur-xl bg-card/95 rounded-3xl p-4 sm:p-6 border border-border/50 shadow-2xl">
        <div className="flex items-center justify-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!marineData) {
    return null;
  }

  const getDirectionLabel = (degrees: number | null) => {
    if (degrees === null) return 'N/A';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  return (
    <div className="backdrop-blur-xl bg-card/95 rounded-3xl p-4 sm:p-6 border border-border/50 shadow-2xl animate-fade-in">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Waves className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        <h3 className="text-base sm:text-lg font-semibold text-foreground">Marine Conditions</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Wave Height */}
        {marineData.waveHeight !== null && (
          <div className="bg-background/50 rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Waves className="w-4 h-4 text-blue-400" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Wave Height</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {marineData.waveHeight.toFixed(1)}m
            </p>
            {marineData.maxWaveHeight && (
              <p className="text-xs text-muted-foreground mt-1">
                Max today: {marineData.maxWaveHeight.toFixed(1)}m
              </p>
            )}
          </div>
        )}

        {/* Wave Direction */}
        {marineData.waveDirection !== null && (
          <div className="bg-background/50 rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="w-4 h-4 text-blue-400" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Wave Dir</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {getDirectionLabel(marineData.waveDirection)}
            </p>
            <p className="text-xs text-muted-foreground">{marineData.waveDirection}°</p>
          </div>
        )}

        {/* Wave Period */}
        {marineData.wavePeriod !== null && (
          <div className="bg-background/50 rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-4 h-4 text-cyan-400" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Wave Period</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {marineData.wavePeriod.toFixed(1)}s
            </p>
          </div>
        )}

        {/* Swell Height */}
        {marineData.swellHeight !== null && (
          <div className="bg-background/50 rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Waves className="w-4 h-4 text-teal-400" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Swell Height</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {marineData.swellHeight.toFixed(1)}m
            </p>
          </div>
        )}

        {/* Swell Direction */}
        {marineData.swellDirection !== null && (
          <div className="bg-background/50 rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="w-4 h-4 text-teal-400" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Swell Dir</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {getDirectionLabel(marineData.swellDirection)}
            </p>
            <p className="text-xs text-muted-foreground">{marineData.swellDirection}°</p>
          </div>
        )}

        {/* Swell Period */}
        {marineData.swellPeriod !== null && (
          <div className="bg-background/50 rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-4 h-4 text-teal-400" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Swell Period</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {marineData.swellPeriod.toFixed(1)}s
            </p>
          </div>
        )}

        {/* Wind Wave Height */}
        {marineData.windWaveHeight !== null && (
          <div className="bg-background/50 rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-4 h-4 text-sky-400" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Wind Wave</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {marineData.windWaveHeight.toFixed(1)}m
            </p>
          </div>
        )}

        {/* Wind Wave Direction */}
        {marineData.windWaveDirection !== null && (
          <div className="bg-background/50 rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="w-4 h-4 text-sky-400" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Wind Wave Dir</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {getDirectionLabel(marineData.windWaveDirection)}
            </p>
          </div>
        )}

        {/* Ocean Current Velocity */}
        {marineData.oceanCurrentVelocity !== null && (
          <div className="bg-background/50 rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Waves className="w-4 h-4 text-indigo-400" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Speed</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {marineData.oceanCurrentVelocity.toFixed(2)} m/s
            </p>
          </div>
        )}

        {/* Ocean Current Direction */}
        {marineData.oceanCurrentDirection !== null && (
          <div className="bg-background/50 rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="w-4 h-4 text-indigo-400" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Dir</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {getDirectionLabel(marineData.oceanCurrentDirection)}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border/30">
        <p className="text-xs text-muted-foreground text-center">
          Data from Open-Meteo Marine API
        </p>
      </div>
    </div>
  );
};
