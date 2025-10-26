import { WeatherData } from '@/types/weather';
import { getWeatherIconImage } from '@/utils/weatherIcons';
import { Droplet } from 'lucide-react';

interface DailyForecastProps {
  data: WeatherData;
}

export const DailyForecast = ({ data }: DailyForecastProps) => {
  const days = data.forecast.forecastday.slice(0, 7);

  const getDayLabel = (dateStr: string, index: number) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-foreground/90 font-medium text-sm sm:text-base">7-Day Forecast</h3>
      </div>

      <div className="space-y-1">
        {days.map((day, index) => {
          const isDay = true;
          const hasRain = day.day.totalprecip_mm > 0;
          
          return (
            <div
              key={day.date_epoch}
              className="flex items-center gap-2 sm:gap-3 py-3 group hover:bg-white/5 rounded-xl transition-all px-2 -mx-2 animate-slide-up cursor-pointer"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Day and Date */}
              <div className="flex flex-col min-w-[60px] sm:min-w-[70px]">
                <div className="text-foreground font-medium text-sm sm:text-base">
                  {getDayLabel(day.date, index)}
                </div>
                <div className="text-xs text-foreground/50">
                  {getShortDate(day.date)}
                </div>
              </div>

              {/* Weather Icon - Animated */}
              <div className="flex items-center justify-center min-w-[60px] sm:min-w-[70px]">
                <img 
                  src={getWeatherIconImage(day.day.condition.code, isDay)} 
                  alt={day.day.condition.text}
                  className="w-10 h-10 sm:w-12 sm:h-12 weather-icon-animated object-contain"
                />
              </div>

              {/* Condition and Rain */}
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-foreground/80 text-sm sm:text-base truncate">
                    {day.day.condition.text}
                  </div>
                  {hasRain && (
                    <div className="text-xs text-blue-400 flex items-center gap-1">
                      <Droplet className="w-3 h-3" />
                      <span>{Math.round(day.day.avghumidity)}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Temperatures */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-blue-300 font-semibold text-base sm:text-lg min-w-[35px] text-right">
                  {Math.round(day.day.mintemp_c)}°
                </span>
                <span className="text-orange-400 font-semibold text-base sm:text-lg min-w-[35px] text-right">
                  {Math.round(day.day.maxtemp_c)}°
                </span>
                <svg 
                  className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/40 group-hover:text-foreground/60 group-hover:translate-x-1 transition-all" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
