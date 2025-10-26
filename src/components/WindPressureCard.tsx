import { WeatherData } from '@/types/weather';
import { Wind, Gauge, Navigation } from 'lucide-react';

interface WindPressureCardProps {
  data: WeatherData;
}

const getBeaufortScale = (windKph: number): { scale: number; description: string } => {
  const windMph = windKph * 0.621371;
  
  if (windMph < 1) return { scale: 0, description: 'Calm' };
  if (windMph < 4) return { scale: 1, description: 'Light air' };
  if (windMph < 8) return { scale: 2, description: 'Light breeze' };
  if (windMph < 13) return { scale: 3, description: 'Gentle breeze' };
  if (windMph < 18) return { scale: 4, description: 'Moderate breeze' };
  if (windMph < 25) return { scale: 5, description: 'Fresh breeze' };
  if (windMph < 31) return { scale: 6, description: 'Strong breeze' };
  if (windMph < 39) return { scale: 7, description: 'Near gale' };
  if (windMph < 47) return { scale: 8, description: 'Gale' };
  if (windMph < 55) return { scale: 9, description: 'Strong gale' };
  if (windMph < 64) return { scale: 10, description: 'Storm' };
  if (windMph < 73) return { scale: 11, description: 'Violent storm' };
  return { scale: 12, description: 'Hurricane' };
};

export const WindPressureCard = ({ data }: WindPressureCardProps) => {
  const { current } = data;
  const beaufort = getBeaufortScale(current.wind_kph);
  const windMph = (current.wind_kph * 0.621371).toFixed(1);

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-foreground/90 font-medium text-base sm:text-lg">Wind & Pressure</h3>
      </div>

      {/* Wind Speed Display */}
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center flex-shrink-0">
          <Wind className="w-12 h-12 sm:w-14 sm:h-14 text-foreground/80" />
        </div>

        <div>
          <div className="text-4xl sm:text-5xl font-bold text-foreground mb-1">
            {windMph}<span className="text-2xl">mph</span>
          </div>
          <div className="text-foreground/70 text-sm sm:text-base">
            {beaufort.scale} {beaufort.description}
          </div>
        </div>
      </div>

      {/* Pressure and Direction */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center flex-shrink-0">
            <Gauge className="w-6 h-6 sm:w-7 sm:h-7 text-foreground/80" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground truncate">
              {current.pressure_mb}
            </div>
            <div className="text-xs sm:text-sm text-foreground/60">mbar</div>
            <div className="text-xs sm:text-sm text-foreground/60">Pressure</div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center gap-3">
          <div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center flex-shrink-0"
            style={{ transform: `rotate(${current.wind_degree}deg)` }}
          >
            <Navigation className="w-6 h-6 sm:w-7 sm:h-7 text-foreground/80" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {current.wind_dir}
            </div>
            <div className="text-xs sm:text-sm text-foreground/60">Wind direction</div>
          </div>
        </div>
      </div>
    </div>
  );
};
