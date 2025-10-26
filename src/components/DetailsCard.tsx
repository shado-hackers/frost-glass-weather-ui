import { WeatherData } from '@/types/weather';
import { getUVLabel } from '@/utils/weatherUtils';
import { Umbrella, Sun, Thermometer, Cloud, Eye, Droplet } from 'lucide-react';

interface DetailsCardProps {
  data: WeatherData;
}

export const DetailsCard = ({ data }: DetailsCardProps) => {
  const { current } = data;
  const uvData = getUVLabel(current.uv);

  const details = [
    {
      icon: Umbrella,
      label: 'Precipitation',
      value: `${current.precip_mm}mm`,
      percentage: `${Math.min(100, current.precip_mm * 10)}%`,
      color: 'text-blue-300',
    },
    {
      icon: Sun,
      label: 'UV Index',
      value: current.uv.toString(),
      description: uvData.label,
      color: uvData.color,
    },
    {
      icon: Thermometer,
      label: 'Dew Point',
      value: `${Math.round(current.temp_c - ((100 - current.humidity) / 5))}°`,
      description: '',
      color: 'text-cyan-300',
    },
    {
      icon: Cloud,
      label: 'Cloud Cover',
      value: `${current.cloud}%`,
      description: '',
      color: 'text-gray-300',
    },
    {
      icon: Eye,
      label: 'Visibility',
      value: `${current.vis_km} km`,
      description: '',
      color: 'text-green-300',
    },
    {
      icon: Droplet,
      label: 'Humidity',
      value: `${current.humidity}%`,
      description: '',
      color: 'text-blue-400',
    },
  ];

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6">
      <div className="mb-6">
        <h3 className="text-foreground/90 font-medium text-base sm:text-lg">Details</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {details.map((detail, index) => (
          <div
            key={detail.label}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 animate-scale-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start gap-3">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center flex-shrink-0">
                <detail.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${detail.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm text-foreground/60 mb-1">{detail.label}</div>
                <div className="text-xl sm:text-2xl font-bold text-foreground mb-0.5 truncate">
                  {detail.value}
                </div>
                {detail.description && (
                  <div className={`text-xs sm:text-sm ${detail.color}`}>
                    {detail.description}
                  </div>
                )}
                {detail.percentage && (
                  <div className="text-xs sm:text-sm text-foreground/60">
                    {detail.percentage}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
