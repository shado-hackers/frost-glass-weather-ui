import { WeatherData } from '@/types/weather';
import { formatDate, getWeatherIcon } from '@/utils/weatherUtils';
import { ChevronRight } from 'lucide-react';

interface DailyForecastProps {
  data: WeatherData;
}

export const DailyForecast = ({ data }: DailyForecastProps) => {
  const days = data.forecast.forecastday.slice(0, 7);

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-foreground/90 font-medium">Daily Forecast</h3>
        <button className="text-secondary text-sm hover:text-secondary/80 transition-colors">
          15 Days →
        </button>
      </div>

      <div className="space-y-3">
        {days.map((day, index) => {
          const isDay = true; // Default to day icons for daily forecast
          
          return (
            <div
              key={day.date_epoch}
              className="flex items-center gap-4 py-2 group hover:bg-white/5 rounded-xl transition-all px-2 -mx-2 animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex-1">
                <div className="text-foreground font-medium">{formatDate(day.date)}</div>
                <div className="text-sm text-foreground/60">{day.date.split('-').slice(1).join('/')}</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-3xl">{getWeatherIcon(day.day.condition.code, isDay)}</div>
                <div className="text-foreground/80 min-w-[120px]">{day.day.condition.text}</div>
              </div>

              <div className="flex items-center gap-2 text-foreground">
                <span className="text-blue-300 font-semibold">{Math.round(day.day.mintemp_c)}°</span>
                <span className="text-orange-400 font-semibold">{Math.round(day.day.maxtemp_c)}°</span>
                <ChevronRight className="w-5 h-5 text-foreground/40 group-hover:text-foreground/60 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
