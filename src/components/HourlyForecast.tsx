import { WeatherData } from '@/types/weather';
import { formatTime, getWeatherIcon } from '@/utils/weatherUtils';
import { Droplet } from 'lucide-react';

interface HourlyForecastProps {
  data: WeatherData;
}

export const HourlyForecast = ({ data }: HourlyForecastProps) => {
  const currentHour = new Date().getHours();
  const hours = data.forecast.forecastday[0].hour.slice(currentHour, currentHour + 6);

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-foreground/90 font-medium">Hourly Forecast</h3>
        <button className="text-secondary text-sm hover:text-secondary/80 transition-colors">
          72 Hours →
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {hours.map((hour, index) => {
          const time = formatTime(hour.time);
          const isDay = parseInt(time.split(':')[0]) >= 6 && parseInt(time.split(':')[0]) < 20;
          
          return (
            <div
              key={hour.time_epoch}
              className="flex flex-col items-center gap-2 min-w-[80px] animate-scale-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="text-sm text-foreground/80">{time}</div>
              <div className="text-3xl">{getWeatherIcon(hour.condition.code, isDay)}</div>
              <div className="text-lg font-semibold text-foreground">
                {Math.round(hour.temp_c)}°
              </div>
              <div className="flex items-center gap-1 text-sm text-foreground/60">
                <Droplet className="w-3 h-3 text-blue-300" />
                <span>{hour.humidity}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
