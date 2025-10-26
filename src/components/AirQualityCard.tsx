import { WeatherData } from '@/types/weather';
import { getAQILabel } from '@/utils/weatherUtils';
import { Info } from 'lucide-react';

interface AirQualityCardProps {
  data: WeatherData;
}

const getAQIEmoji = (index: number): string => {
  if (index === 1) return '😊';
  if (index === 2) return '😐';
  if (index === 3) return '😷';
  if (index === 4) return '😨';
  if (index === 5) return '🤢';
  return '☠️';
};

const getAQIDescription = (index: number): string => {
  if (index === 1) return 'Air quality is satisfactory, and air pollution poses little or no risk.';
  if (index === 2) return 'Air quality is acceptable. However, there may be a risk for some people.';
  if (index === 3) return 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.';
  if (index === 4) return 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.';
  if (index === 5) return 'Health alert: The risk of health effects is increased for everyone.';
  return 'Health warning of emergency conditions: everyone is more likely to be affected.';
};

const getPollutantLevel = (value: number, type: string): { label: string; color: string } => {
  // Simplified pollutant level logic
  if (type === 'pm2_5') {
    if (value <= 12) return { label: 'Good', color: 'text-green-400' };
    if (value <= 35) return { label: 'Moderate', color: 'text-yellow-400' };
    if (value <= 55) return { label: 'Unhealthy for sensitive groups', color: 'text-orange-400' };
    return { label: 'Unhealthy', color: 'text-red-400' };
  }
  
  if (type === 'pm10') {
    if (value <= 54) return { label: 'Good', color: 'text-green-400' };
    if (value <= 154) return { label: 'Moderate', color: 'text-yellow-400' };
    return { label: 'Unhealthy', color: 'text-orange-400' };
  }
  
  return { label: 'Good', color: 'text-green-400' };
};

export const AirQualityCard = ({ data }: AirQualityCardProps) => {
  const airQuality = data.current.air_quality;
  
  if (!airQuality) {
    return null;
  }

  const aqiData = getAQILabel(airQuality.us_epa_index);
  const pm25Data = getPollutantLevel(airQuality.pm2_5, 'pm2_5');
  const pm10Data = getPollutantLevel(airQuality.pm10, 'pm10');

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6">
      <div className="mb-6">
        <h3 className="text-foreground/90 font-medium text-base sm:text-lg">Air Quality</h3>
      </div>

      <div className="flex items-start gap-4 mb-6">
        {/* AQI Icon */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl w-24 h-24 flex items-center justify-center text-5xl flex-shrink-0">
          {getAQIEmoji(airQuality.us_epa_index)}
        </div>

        {/* AQI Number and Status */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl sm:text-6xl font-bold text-foreground">
              {Math.round(airQuality.pm2_5)}
            </span>
            <div className={`${aqiData.color} bg-orange-500/20 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap`}>
              {aqiData.label}
            </div>
            <button className="ml-auto">
              <Info className="w-5 h-5 text-foreground/60" />
            </button>
          </div>
          
          <p className="text-sm text-foreground/70 leading-relaxed">
            {getAQIDescription(airQuality.us_epa_index)}
          </p>
        </div>
      </div>

      {/* AQI Scale */}
      <div className="mb-6">
        <div className="h-2 rounded-full overflow-hidden flex">
          <div className="flex-1 bg-green-500"></div>
          <div className="flex-1 bg-yellow-500"></div>
          <div className="flex-1 bg-orange-500"></div>
          <div className="flex-1 bg-red-500"></div>
          <div className="flex-1 bg-purple-500"></div>
          <div className="flex-1 bg-red-900"></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-foreground/60">
          <span>Good</span>
          <span>Hazardous</span>
        </div>
      </div>

      {/* Pollutants Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-foreground/60 text-sm">PM</span>
            <span className="text-foreground/60 text-xs">2.5</span>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {Math.round(airQuality.pm2_5)}
          </div>
          <div className={`text-sm ${pm25Data.color}`}>
            {pm25Data.label}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-foreground/60 text-sm">PM</span>
            <span className="text-foreground/60 text-xs">10</span>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {Math.round(airQuality.pm10)}
          </div>
          <div className={`text-sm ${pm10Data.color}`}>
            {pm10Data.label}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
          <div className="text-foreground/60 text-sm mb-1">CO</div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {Math.round(airQuality.co || 0)}
          </div>
          <div className="text-sm text-green-400">Good</div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-foreground/60 text-sm">NO</span>
            <span className="text-foreground/60 text-xs">2</span>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {Math.round(airQuality.no2 || 0)}
          </div>
          <div className="text-sm text-green-400">Good</div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-foreground/60 text-sm">SO</span>
            <span className="text-foreground/60 text-xs">2</span>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {Math.round(airQuality.so2 || 0)}
          </div>
          <div className="text-sm text-green-400">Good</div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-foreground/60 text-sm">O</span>
            <span className="text-foreground/60 text-xs">3</span>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {Math.round(airQuality.o3 || 0)}
          </div>
          <div className="text-sm text-green-400">Good</div>
        </div>
      </div>
    </div>
  );
};
