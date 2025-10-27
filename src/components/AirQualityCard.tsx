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
  if (type === 'pm2_5') {
    if (value <= 12) return { label: 'Good', color: 'text-green-500' };
    if (value <= 35) return { label: 'Moderate', color: 'text-yellow-500' };
    if (value <= 55) return { label: 'Unhealthy', color: 'text-orange-500' };
    return { label: 'Unhealthy', color: 'text-red-500' };
  }
  
  if (type === 'pm10') {
    if (value <= 54) return { label: 'Good', color: 'text-green-500' };
    if (value <= 154) return { label: 'Moderate', color: 'text-yellow-500' };
    return { label: 'Unhealthy', color: 'text-orange-500' };
  }
  
  if (type === 'co') {
    if (value <= 50) return { label: 'Good', color: 'text-green-500' };
    if (value <= 100) return { label: 'Moderate', color: 'text-yellow-500' };
    return { label: 'Unhealthy', color: 'text-orange-500' };
  }
  
  if (type === 'no2') {
    if (value <= 50) return { label: 'Good', color: 'text-green-500' };
    if (value <= 100) return { label: 'Moderate', color: 'text-yellow-500' };
    return { label: 'Unhealthy', color: 'text-orange-500' };
  }
  
  if (type === 'so2') {
    if (value <= 50) return { label: 'Good', color: 'text-green-500' };
    if (value <= 100) return { label: 'Moderate', color: 'text-yellow-500' };
    return { label: 'Unhealthy', color: 'text-orange-500' };
  }
  
  if (type === 'o3') {
    if (value <= 50) return { label: 'Good', color: 'text-green-500' };
    if (value <= 100) return { label: 'Moderate', color: 'text-yellow-500' };
    return { label: 'Unhealthy', color: 'text-orange-500' };
  }
  
  return { label: 'Good', color: 'text-green-500' };
};

export const AirQualityCard = ({ data }: AirQualityCardProps) => {
  const airQuality = data.current.air_quality;
  
  if (!airQuality) {
    return null;
  }

  // Use US EPA index, fallback to calculating from PM2.5
  const aqiIndex = airQuality.us_epa_index || Math.min(6, Math.ceil(airQuality.pm2_5 / 50) + 1);
  const aqiData = getAQILabel(aqiIndex);

  // Calculate position on scale (0-100%)
  const scalePosition = ((aqiIndex - 1) / 5) * 100;

  return (
    <div className="bg-card/80 backdrop-blur-xl border border-border/30 rounded-3xl p-6 sm:p-8 shadow-lg">
      {/* Title */}
      <h3 className="text-foreground/60 font-medium text-sm sm:text-base mb-6 tracking-wide">
        AIR QUALITY INDEX
      </h3>

      {/* Main AQI Status */}
      <div className="mb-6">
        <div className={`text-4xl sm:text-6xl font-bold mb-3 ${aqiData.label === 'Good' ? 'text-cyan-400' : aqiData.label === 'Moderate' ? 'text-yellow-400' : aqiData.label.includes('Unhealthy') ? 'text-orange-400' : 'text-red-400'}`}>
          {aqiData.label}
        </div>
        <p className="text-foreground/70 text-sm sm:text-base leading-relaxed">
          {getAQIDescription(aqiIndex)}
        </p>
      </div>

      {/* AQI Scale with Indicator */}
      <div className="mb-8 relative">
        <div className="h-1.5 rounded-full overflow-hidden flex mb-3">
          <div className="flex-1 bg-gradient-to-r from-cyan-400 to-green-400"></div>
          <div className="flex-1 bg-gradient-to-r from-green-400 to-yellow-400"></div>
          <div className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
          <div className="flex-1 bg-gradient-to-r from-orange-400 to-red-400"></div>
          <div className="flex-1 bg-gradient-to-r from-red-400 to-purple-400"></div>
          <div className="flex-1 bg-gradient-to-r from-purple-400 to-pink-600"></div>
        </div>
        
        {/* Triangle Indicator */}
        <div 
          className="absolute -top-2 transform -translate-x-1/2 transition-all duration-500"
          style={{ left: `${scalePosition}%` }}
        >
          <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-yellow-400"></div>
        </div>

        <div className="flex justify-between text-xs text-cyan-400 font-medium">
          <span>Good</span>
          <span className="text-pink-600">Dangerous</span>
        </div>
      </div>

      {/* Pollutants Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* PM 2.5 */}
        <div className="bg-card/60 backdrop-blur-lg rounded-2xl p-4 border border-border/20">
          <div className="text-foreground/60 text-xs sm:text-sm mb-2">PM 2.5</div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            {Math.round(airQuality.pm2_5)}
          </div>
          <div className="text-foreground/50 text-xs">ug/m3</div>
        </div>

        {/* PM 10 */}
        <div className="bg-card/60 backdrop-blur-lg rounded-2xl p-4 border border-border/20">
          <div className="text-foreground/60 text-xs sm:text-sm mb-2">PM 10</div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            {Math.round(airQuality.pm10)}
          </div>
          <div className="text-foreground/50 text-xs">ug/m3</div>
        </div>

        {/* CO2 */}
        <div className="bg-card/60 backdrop-blur-lg rounded-2xl p-4 border border-border/20">
          <div className="text-foreground/60 text-xs sm:text-sm mb-2">CO2</div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            {Math.round(airQuality.co || 0)}
          </div>
          <div className="text-foreground/50 text-xs">ug/m3</div>
        </div>

        {/* NH3 (using NO2 as fallback) */}
        <div className="bg-card/60 backdrop-blur-lg rounded-2xl p-4 border border-border/20">
          <div className="text-foreground/60 text-xs sm:text-sm mb-2">NH3</div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            {Math.round(airQuality.no2 || 0)}
          </div>
          <div className="text-foreground/50 text-xs">ug/m3</div>
        </div>

        {/* NO (using NO2/2 as approximation) */}
        <div className="bg-card/60 backdrop-blur-lg rounded-2xl p-4 border border-border/20">
          <div className="text-foreground/60 text-xs sm:text-sm mb-2">NO</div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            {Math.round((airQuality.no2 || 0) / 2)}
          </div>
          <div className="text-foreground/50 text-xs">ug/m3</div>
        </div>

        {/* NO2 */}
        <div className="bg-card/60 backdrop-blur-lg rounded-2xl p-4 border border-border/20">
          <div className="text-foreground/60 text-xs sm:text-sm mb-2">NO2</div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            {Math.round(airQuality.no2 || 0)}
          </div>
          <div className="text-foreground/50 text-xs">ug/m3</div>
        </div>

        {/* O3 */}
        <div className="bg-card/60 backdrop-blur-lg rounded-2xl p-4 border border-border/20">
          <div className="text-foreground/60 text-xs sm:text-sm mb-2">O3</div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            {Math.round(airQuality.o3 || 0)}
          </div>
          <div className="text-foreground/50 text-xs">ug/m3</div>
        </div>

        {/* SO2 */}
        <div className="bg-card/60 backdrop-blur-lg rounded-2xl p-4 border border-border/20">
          <div className="text-foreground/60 text-xs sm:text-sm mb-2">SO2</div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            {Math.round(airQuality.so2 || 0)}
          </div>
          <div className="text-foreground/50 text-xs">ug/m3</div>
        </div>
      </div>
    </div>
  );
};
