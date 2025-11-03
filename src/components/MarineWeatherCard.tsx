import { useEffect, useState } from 'react';
import { WeatherData } from '@/types/weather';
import { Waves, Wind, Navigation, Droplets, MapPin, Compass } from 'lucide-react';

interface MarineWeatherCardProps {
  data: WeatherData;
}

interface MarineData {
  waveHeight: number | null;
  waveDirection: number | null;
  wavePeriod: number | null;
  windWaveHeight: number | null;
  windWaveDirection: number | null;
  windWavePeriod: number | null;
  swellHeight: number | null;
  swellDirection: number | null;
  swellPeriod: number | null;
  oceanCurrentVelocity: number | null;
  oceanCurrentDirection: number | null;
  seaTemp: number | null;
  location: {
    name: string;
    lat: number;
    lon: number;
  };
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
            waveHeight: marineResponse.current.wave_height ?? null,
            waveDirection: marineResponse.current.wave_direction ?? null,
            wavePeriod: marineResponse.current.wave_period ?? null,
            windWaveHeight: marineResponse.current.wind_wave_height ?? null,
            windWaveDirection: marineResponse.current.wind_wave_direction ?? null,
            windWavePeriod: marineResponse.current.wind_wave_period ?? null,
            swellHeight: marineResponse.current.swell_wave_height ?? null,
            swellDirection: marineResponse.current.swell_wave_direction ?? null,
            swellPeriod: marineResponse.current.swell_wave_period ?? null,
            oceanCurrentVelocity: marineResponse.current.ocean_current_velocity ?? null,
            oceanCurrentDirection: marineResponse.current.ocean_current_direction ?? null,
            seaTemp: marineResponse.current.sea_surface_temperature ?? null,
            location: {
              name: data.location.name,
              lat: data.location.lat,
              lon: data.location.lon
            }
          };
          
          // Always show the card
          setMarineData(newData);
        }
      } catch (error) {
        console.error('Error fetching marine weather:', error);
        setMarineData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMarineWeather();
  }, [data.location.lat, data.location.lon, data.location.name]);

  if (loading) {
    return (
      <div className="backdrop-blur-xl bg-card/95 rounded-3xl p-4 sm:p-6 border border-border/50 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-center h-48">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
            <Waves className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
          </div>
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

  const getWaveIntensity = (height: number | null) => {
    if (height === null) return 'calm';
    if (height < 0.5) return 'calm';
    if (height < 1.5) return 'moderate';
    if (height < 2.5) return 'rough';
    return 'very-rough';
  };

  const waveIntensity = getWaveIntensity(marineData.waveHeight);

  return (
    <div className="backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/90 to-secondary/10 rounded-3xl p-4 sm:p-6 border border-border/50 shadow-2xl animate-fade-in relative overflow-hidden">
      {/* Animated wave background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'hsl(var(--secondary))', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <path
            fill="url(#wave-gradient)"
            d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,133.3C672,117,768,107,864,122.7C960,139,1056,181,1152,186.7C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            className={`animate-pulse ${waveIntensity === 'calm' ? 'opacity-30' : waveIntensity === 'moderate' ? 'opacity-50' : 'opacity-70'}`}
          />
        </svg>
      </div>

      {/* Header with location */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/20 backdrop-blur-sm">
            <Waves className="w-6 h-6 sm:w-7 sm:h-7 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Marine Conditions
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{marineData.location.name}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Coordinates</p>
          <p className="text-xs font-mono text-foreground">{marineData.location.lat.toFixed(2)}°, {marineData.location.lon.toFixed(2)}°</p>
        </div>
      </div>

      {/* Main wave data grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 relative z-10">
        {/* Wave Height */}
        <div className="bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-sm rounded-2xl p-4 border border-border/30 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:scale-105">
          <div className="flex items-center gap-2 mb-2">
            <Waves className="w-4 h-4 text-primary animate-bounce" style={{ animationDuration: '2s' }} />
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Waves</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
            {marineData.waveHeight !== null ? `${marineData.waveHeight.toFixed(1)}m` : 'N/A'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total Height</p>
        </div>

        {/* Wave Direction */}
        <div className="bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-sm rounded-2xl p-4 border border-border/30 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:scale-105">
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-4 h-4 text-secondary" style={{ transform: marineData.waveDirection !== null ? `rotate(${marineData.waveDirection}deg)` : 'none' }} />
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Direction</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            {marineData.waveDirection !== null ? getDirectionLabel(marineData.waveDirection) : 'N/A'}
          </p>
          <p className="text-xs text-muted-foreground">{marineData.waveDirection !== null ? `${marineData.waveDirection}°` : '--'}</p>
        </div>

        {/* Wave Period */}
        <div className="bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-sm rounded-2xl p-4 border border-border/30 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:scale-105">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-4 h-4 text-accent" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Period</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            {marineData.wavePeriod !== null ? `${marineData.wavePeriod.toFixed(1)}s` : 'N/A'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Wave Frequency</p>
        </div>

        {/* Sea Temperature */}
        <div className="bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-sm rounded-2xl p-4 border border-border/30 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:scale-105">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-secondary" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Sea Temp</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            {marineData.seaTemp !== null ? `${marineData.seaTemp.toFixed(1)}°C` : 'N/A'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Surface Water</p>
        </div>

        {/* Wind Wave Height */}
        <div className="bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-sm rounded-2xl p-4 border border-border/30 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:scale-105">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Wind Waves</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            {marineData.windWaveHeight !== null ? `${marineData.windWaveHeight.toFixed(1)}m` : 'N/A'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Wind Generated</p>
        </div>

        {/* Wind Wave Direction */}
        <div className="bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-sm rounded-2xl p-4 border border-border/30 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:scale-105">
          <div className="flex items-center gap-2 mb-2">
            <Navigation className="w-4 h-4 text-secondary" style={{ transform: marineData.windWaveDirection !== null ? `rotate(${marineData.windWaveDirection}deg)` : 'none' }} />
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Wind Dir</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            {marineData.windWaveDirection !== null ? getDirectionLabel(marineData.windWaveDirection) : 'N/A'}
          </p>
          <p className="text-xs text-muted-foreground">{marineData.windWaveDirection !== null ? `${marineData.windWaveDirection}°` : '--'}</p>
        </div>

        {/* Wind Wave Period */}
        <div className="bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-sm rounded-2xl p-4 border border-border/30 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:scale-105">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-4 h-4 text-accent" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Wind Period</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            {marineData.windWavePeriod !== null ? `${marineData.windWavePeriod.toFixed(1)}s` : 'N/A'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Wind Wave Cycle</p>
        </div>

        {/* Swell Height */}
        <div className="bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-sm rounded-2xl p-4 border border-border/30 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:scale-105">
          <div className="flex items-center gap-2 mb-2">
            <Waves className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Swell</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            {marineData.swellHeight !== null ? `${marineData.swellHeight.toFixed(1)}m` : 'N/A'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Swell Height</p>
        </div>

        {/* Swell Direction */}
        <div className="bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-sm rounded-2xl p-4 border border-border/30 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:scale-105">
          <div className="flex items-center gap-2 mb-2">
            <Navigation className="w-4 h-4 text-secondary" style={{ transform: marineData.swellDirection !== null ? `rotate(${marineData.swellDirection}deg)` : 'none' }} />
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Swell Dir</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            {marineData.swellDirection !== null ? getDirectionLabel(marineData.swellDirection) : 'N/A'}
          </p>
          <p className="text-xs text-muted-foreground">{marineData.swellDirection !== null ? `${marineData.swellDirection}°` : '--'}</p>
        </div>

        {/* Swell Period */}
        <div className="bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-sm rounded-2xl p-4 border border-border/30 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:scale-105">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-4 h-4 text-accent" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Swell Period</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            {marineData.swellPeriod !== null ? `${marineData.swellPeriod.toFixed(1)}s` : 'N/A'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Swell Cycle</p>
        </div>

        {/* Ocean Current */}
        <div className="bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-sm rounded-2xl p-4 border border-border/30 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:scale-105 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-primary animate-pulse" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Current</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              {marineData.oceanCurrentVelocity !== null ? marineData.oceanCurrentVelocity.toFixed(2) : 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground">m/s</p>
          </div>
          {marineData.oceanCurrentDirection !== null ? (
            <p className="text-xs text-muted-foreground mt-1">
              {getDirectionLabel(marineData.oceanCurrentDirection)} ({marineData.oceanCurrentDirection}°)
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">Direction: --</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-border/30 relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Data from Open-Meteo Marine API
          </p>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            waveIntensity === 'calm' 
              ? 'bg-green-500/20 text-green-700 dark:text-green-400' 
              : waveIntensity === 'moderate'
              ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
              : waveIntensity === 'rough'
              ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400'
              : 'bg-red-500/20 text-red-700 dark:text-red-400'
          }`}>
            {waveIntensity === 'calm' ? '🌊 Calm' : waveIntensity === 'moderate' ? '🌊 Moderate' : waveIntensity === 'rough' ? '🌊 Rough' : '🌊 Very Rough'}
          </div>
        </div>
      </div>
    </div>
  );
};