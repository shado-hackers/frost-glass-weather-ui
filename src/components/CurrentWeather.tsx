import { WeatherData } from '@/types/weather';
import { getWeatherIcon } from '@/utils/weatherUtils';
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
      <div className="mb-2">
        <h1 className="text-xl sm:text-2xl font-light text-foreground/90">{current.condition.text}</h1>
      </div>

      <div className="text-6xl sm:text-8xl font-extralight text-foreground mb-2 sm:mb-4 flex items-center justify-center gap-2">
        <span className="weather-icon-animated text-5xl sm:text-7xl">{getWeatherIcon(current.condition.code, isDay)}</span>
        <span>{Math.round(current.temp_c)}°<span className="text-4xl sm:text-5xl">c</span></span>
      </div>

      <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-4 text-xs sm:text-base text-foreground/80 mb-2">
        <span className="flex items-center gap-1 whitespace-nowrap">
          Feels like: {Math.round(current.feelslike_c)}°
        </span>
        <span className="flex items-center gap-1 whitespace-nowrap">
          <Droplet className="w-3 h-3 sm:w-4 sm:h-4 text-blue-300" />
          {Math.round(data.forecast.forecastday[0].day.mintemp_c)}°
        </span>
        <span className="flex items-center gap-1 whitespace-nowrap">
          <div className="w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-400" />
          </div>
          {Math.round(data.forecast.forecastday[0].day.maxtemp_c)}°
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
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3"
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
