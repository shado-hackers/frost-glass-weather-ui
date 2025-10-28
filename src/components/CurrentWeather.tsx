import { WeatherData } from '@/types/weather';
import { getWeatherIconImage } from '@/utils/weatherIcons';
import { Droplet, Wind, Eye, Gauge } from 'lucide-react';

interface CurrentWeatherProps {
  data: WeatherData;
}

export const CurrentWeather = ({ data }: CurrentWeatherProps) => {
  const { current } = data;
  const currentHour = new Date().getHours();
  const isDay = currentHour >= 6 && currentHour < 20;

  return (
    <div className="text-center animate-fade-in px-2">
      <div className="mb-3">
        <h1 className="text-xl sm:text-2xl font-medium text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
          {current.condition.text}
        </h1>
      </div>

      <div className="text-7xl sm:text-8xl font-extralight mb-3 sm:mb-4 flex items-center justify-center gap-3 sm:gap-4">
        <img 
          src={getWeatherIconImage(current.condition.code, isDay)} 
          alt={current.condition.text}
          className="w-24 h-24 sm:w-32 sm:h-32 weather-icon-animated object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
        />
        <span className="text-white font-light drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
          {Math.round(current.temp_c)}°<span className="text-4xl sm:text-5xl">c</span>
        </span>
      </div>

      <div className="flex items-center justify-center flex-wrap gap-3 sm:gap-4 text-sm sm:text-base mb-2">
        <span className="flex items-center gap-1.5 whitespace-nowrap text-white/95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] font-medium">
          Feels like: {Math.round(current.feelslike_c)}°C
        </span>
        <span className="flex items-center gap-1.5 whitespace-nowrap text-blue-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] font-medium">
          <Droplet className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300 drop-shadow-md" />
          {Math.round(data.forecast.forecastday[0].day.mintemp_c)}°C
        </span>
        <span className="flex items-center gap-1.5 whitespace-nowrap text-orange-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] font-medium">
          <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-orange-400 shadow-lg shadow-orange-500/50" />
          </div>
          {Math.round(data.forecast.forecastday[0].day.maxtemp_c)}°C
        </span>
      </div>
    </div>
  );
};

export const WeatherDetails = ({ data }: CurrentWeatherProps) => {
  const { current } = data;

  const details = [
    {
      icon: Droplet,
      label: 'Precipitation',
      value: `${current.precip_mm}mm`,
      color: 'text-blue-300',
    },
    {
      icon: Droplet,
      label: 'Humidity',
      value: `${current.humidity}%`,
      color: 'text-cyan-300',
    },
    {
      icon: Wind,
      label: 'Wind',
      value: `${Math.round(current.wind_kph)} km/h`,
      color: 'text-gray-300',
    },
    {
      icon: Gauge,
      label: 'Pressure',
      value: `${current.pressure_mb} mb`,
      color: 'text-purple-300',
    },
    {
      icon: Eye,
      label: 'Visibility',
      value: `${current.vis_km} km`,
      color: 'text-green-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 animate-fade-in">
      {details.map((detail, index) => (
        <div
          key={detail.label}
          className="bg-card/60 backdrop-blur-lg border border-border/20 rounded-2xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 gpu-accelerated"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <detail.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${detail.color} flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <div className="text-xs sm:text-sm text-foreground/60">{detail.label}</div>
            <div className="text-base sm:text-lg font-semibold text-foreground truncate">{detail.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
