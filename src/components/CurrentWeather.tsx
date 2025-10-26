import { WeatherData } from '@/types/weather';
import { Droplet, Wind, Eye, Gauge } from 'lucide-react';

interface CurrentWeatherProps {
  data: WeatherData;
}

export const CurrentWeather = ({ data }: CurrentWeatherProps) => {
  const { current, location } = data;

  return (
    <div className="text-center animate-fade-in">
      <div className="mb-2">
        <h1 className="text-2xl font-light text-foreground/90">{current.condition.text}</h1>
      </div>

      <div className="text-8xl font-extralight text-foreground mb-4">
        {Math.round(current.temp_c)}°<span className="text-5xl">c</span>
      </div>

      <div className="flex items-center justify-center gap-4 text-foreground/80 mb-2">
        <span className="flex items-center gap-1">
          Feels like®: {Math.round(current.feelslike_c)}°
        </span>
        <span className="flex items-center gap-1">
          <Droplet className="w-4 h-4 text-blue-300" />
          {data.forecast.forecastday[0].day.mintemp_c}°
        </span>
        <span className="flex items-center gap-1">
          <div className="w-4 h-4 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-orange-400" />
          </div>
          {data.forecast.forecastday[0].day.maxtemp_c}°
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
    <div className="grid grid-cols-2 gap-3 animate-fade-in">
      {details.map((detail, index) => (
        <div
          key={detail.label}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center gap-3"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <detail.icon className={`w-6 h-6 ${detail.color} flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-foreground/60">{detail.label}</div>
            <div className="text-lg font-semibold text-foreground">{detail.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
