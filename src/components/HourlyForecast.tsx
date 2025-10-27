import { WeatherData } from '@/types/weather';
import { formatToISTTime } from '@/utils/weatherUtils';
import { getWeatherIconImage } from '@/utils/weatherIcons';
import { Droplet } from 'lucide-react';

interface HourlyForecastProps {
  data: WeatherData;
}

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
      if (hour) hours.push(hour);
    }
  }

  return (
    <div className="bg-card/80 backdrop-blur-xl border border-border/30 rounded-3xl p-4 sm:p-6 animate-fade-in shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-foreground/90 font-medium text-sm sm:text-base">Hourly Forecast</h3>
        <div className="text-xs sm:text-sm text-foreground/50 flex items-center gap-1">
          <span>Swipe</span>
          <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>

      <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide smooth-scroll pb-2 snap-x snap-mandatory gpu-accelerated">
        {hours.map((hour, index) => {
          const time = formatToISTTime(hour.time);
          const hourNum = parseInt(time.split(':')[0]);
          const isAM = time.includes('AM');
          const isDay = (isAM && hourNum >= 6) || (!isAM && hourNum < 8);
          
          return (
            <div
              key={hour.time_epoch}
              className="flex flex-col items-center gap-2 min-w-[70px] sm:min-w-[80px] p-3 bg-card/40 backdrop-blur-lg rounded-2xl border border-border/20 animate-scale-in snap-start gpu-accelerated hover:bg-card/60 transition-all"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="text-xs sm:text-sm text-foreground/80 whitespace-nowrap font-medium">{time}</div>
              <img 
                src={getWeatherIconImage(hour.condition.code, isDay)} 
                alt={hour.condition.text}
                className="w-10 h-10 sm:w-12 sm:h-12 weather-icon-animated object-contain"
              />
              <div className="text-base sm:text-lg font-semibold text-foreground">
                {Math.round(hour.temp_c)}°
              </div>
              <div className="flex items-center gap-1 text-xs sm:text-sm text-foreground/60">
                <Droplet className="w-3 h-3 text-blue-400" />
                <span>{hour.humidity}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
