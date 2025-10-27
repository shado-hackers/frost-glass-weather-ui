import { WeatherData } from '@/types/weather';
import { getAQILabel, getUVLabel } from '@/utils/weatherUtils';
import { Sun, Sunrise, Sunset, Wind } from 'lucide-react';

interface AdditionalInfoProps {
  data: WeatherData;
}

export const AdditionalInfo = ({ data }: AdditionalInfoProps) => {
  const { current, forecast } = data;
  const today = forecast.forecastday[0];
  const aqiData = current.air_quality ? getAQILabel(current.air_quality.us_epa_index) : null;
  const uvData = getUVLabel(current.uv);

  const infoCards = [
    {
      icon: Sun,
      label: 'UV Index',
      value: current.uv.toString(),
      detail: uvData.label,
      color: uvData.color,
    },
    {
      icon: Wind,
      label: 'Air Quality',
      value: aqiData?.label || 'N/A',
      detail: current.air_quality ? `PM2.5: ${current.air_quality.pm2_5.toFixed(1)}` : '',
      color: aqiData?.color || 'text-foreground/60',
    },
    {
      icon: Sunrise,
      label: 'Sunrise',
      value: today.astro.sunrise,
      detail: '',
      color: 'text-orange-400',
    },
    {
      icon: Sunset,
      label: 'Sunset',
      value: today.astro.sunset,
      detail: '',
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 animate-fade-in">
      {infoCards.map((card, index) => (
        <div
          key={card.label}
          className="bg-card/60 backdrop-blur-lg border border-border/20 rounded-2xl p-3 sm:p-4 animate-scale-in gpu-accelerated"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <card.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.color} flex-shrink-0 mt-0.5 sm:mt-1`} />
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm text-foreground/60 mb-0.5 sm:mb-1">{card.label}</div>
              <div className="text-base sm:text-xl font-semibold text-foreground mb-0.5 truncate">{card.value}</div>
              {card.detail && (
                <div className="text-xs sm:text-sm text-foreground/60 truncate">{card.detail}</div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
