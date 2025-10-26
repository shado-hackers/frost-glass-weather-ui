import { WeatherData } from '@/types/weather';
import { formatDate, getWeatherIcon } from '@/utils/weatherUtils';

interface DailyForecastProps {
  data: WeatherData;
}

export const DailyForecast = ({ data }: DailyForecastProps) => {
  const days = data.forecast.forecastday.slice(0, 7);

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6 animate-fade-in">
      <div className="mb-4">
        <h3 className="text-foreground/90 font-medium text-sm sm:text-base">7-Day Forecast</h3>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {days.map((day, index) => {
          const isDay = true;
          
          return (
            <div
              key={day.date_epoch}
              className="flex items-center gap-2 sm:gap-4 py-2 group hover:bg-white/5 rounded-xl transition-all px-2 -mx-2 animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex-1 min-w-0">
                <div className="text-foreground font-medium text-sm sm:text-base truncate">{formatDate(day.date)}</div>
                <div className="text-xs sm:text-sm text-foreground/60">{day.date.split('-').slice(1).join('/')}</div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <div className="text-2xl sm:text-3xl weather-icon-animated">{getWeatherIcon(day.day.condition.code, isDay)}</div>
                <div className="text-foreground/80 text-xs sm:text-base min-w-[80px] sm:min-w-[120px] truncate hidden sm:block">{day.day.condition.text}</div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 text-foreground flex-shrink-0">
                <span className="text-blue-300 font-semibold text-sm sm:text-base">{Math.round(day.day.mintemp_c)}°</span>
                <span className="text-orange-400 font-semibold text-sm sm:text-base">{Math.round(day.day.maxtemp_c)}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
