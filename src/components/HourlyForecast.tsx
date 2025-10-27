import { WeatherData } from '@/types/weather';
import { formatToISTTime } from '@/utils/weatherUtils';
import { getWeatherIconImage } from '@/utils/weatherIcons';
import { Droplet } from 'lucide-react';

interface HourlyForecastProps {
  data: WeatherData;
}

// Helper function to get time period label
const getTimePeriodLabel = (hour: number): string | null => {
  if (hour >= 6 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 18) return 'Afternoon';
  if (hour >= 18 && hour < 24) return 'Evening';
  if (hour >= 0 && hour < 6) return 'Night';
  return null;
};

export const HourlyForecast = ({ data }: HourlyForecastProps) => {
  const currentHour = new Date().getHours();
  
  // Get 24 hours of forecast data, spanning multiple days if needed
  const hours = [];
  const totalHours = 24;
  
  for (let i = 0; i < totalHours; i++) {
    const targetHour = currentHour + i;
    const dayIndex = Math.floor(targetHour / 24);
    const hourIndex = targetHour % 24;
    
    if (dayIndex < data.forecast.forecastday.length) {
      const hour = data.forecast.forecastday[dayIndex].hour[hourIndex];
      if (hour) hours.push({ ...hour, actualHour: hourIndex });
    }
  }

  // Track when to show period labels
  let lastPeriod: string | null = null;

  return (
    <div className="bg-card/80 backdrop-blur-xl border border-border/30 rounded-3xl p-4 sm:p-6 animate-fade-in shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-foreground/90 font-medium text-sm sm:text-base">24-Hour Forecast</h3>
        <div className="text-xs sm:text-sm text-foreground/50 flex items-center gap-1">
          <span>Swipe</span>
          <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>

      <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide smooth-scroll pb-2 snap-x snap-mandatory gpu-accelerated">
        {hours.map((hour, index) => {
          const time = formatToISTTime(hour.time);
          const hourNum = parseInt(time.split(':')[0]);
          const isAM = time.includes('AM');
          const isDay = (isAM && hourNum >= 6) || (!isAM && hourNum < 8);
          
          // Determine current period and whether to show label
          const currentPeriod = getTimePeriodLabel(hour.actualHour);
          const showPeriodLabel = currentPeriod !== lastPeriod;
          if (showPeriodLabel) lastPeriod = currentPeriod;
          
          return (
            <div key={hour.time_epoch} className="flex flex-col snap-start">
              {/* Period Label */}
              {showPeriodLabel && currentPeriod && (
                <div className="text-xs sm:text-sm font-medium text-foreground/60 mb-2 px-1 whitespace-nowrap">
                  {currentPeriod}
                </div>
              )}
              
              {/* Hour Card */}
              <div
                className="relative overflow-hidden flex flex-col items-center gap-1.5 sm:gap-2 min-w-[65px] sm:min-w-[80px] p-2.5 sm:p-3 bg-gradient-to-br from-card/50 via-card/30 to-card/50 backdrop-blur-xl rounded-2xl border border-border/30 animate-scale-in gpu-accelerated hover:from-card/70 hover:via-card/50 hover:to-card/70 transition-all duration-300 shadow-lg"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Gradient lens effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none" />
                <div className="text-[10px] sm:text-sm text-foreground/80 whitespace-nowrap font-medium relative z-10">{time}</div>
                <img 
                  src={getWeatherIconImage(hour.condition.code, isDay)} 
                  alt={hour.condition.text}
                  className="w-9 h-9 sm:w-12 sm:h-12 weather-icon-animated object-contain relative z-10"
                />
                <div className="text-sm sm:text-lg font-semibold text-foreground relative z-10">
                  {Math.round(hour.temp_c)}°C
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-sm text-foreground/60 relative z-10">
                  <Droplet className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400" />
                  <span>{hour.humidity}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
