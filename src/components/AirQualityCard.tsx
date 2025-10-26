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
  const pm25Data = getPollutantLevel(airQuality.pm2_5, 'pm2_5');
  const pm10Data = getPollutantLevel(airQuality.pm10, 'pm10');
  const coData = getPollutantLevel(airQuality.co || 0, 'co');
  const no2Data = getPollutantLevel(airQuality.no2 || 0, 'no2');
  const so2Data = getPollutantLevel(airQuality.so2 || 0, 'so2');
  const o3Data = getPollutantLevel(airQuality.o3 || 0, 'o3');

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6">
      <div className="mb-6">
        <h3 className="text-foreground/90 font-medium text-base sm:text-lg">Air Quality</h3>
      </div>

      <div className="flex items-start gap-3 sm:gap-4 mb-6">
        {/* AQI Icon */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center text-4xl sm:text-5xl flex-shrink-0">
          {getAQIEmoji(airQuality.us_epa_index)}
        </div>

        {/* AQI Number and Status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <span className="text-4xl sm:text-6xl font-bold text-foreground">
              {aqiIndex}
            </span>
            <div className={`${aqiData.color} bg-opacity-90 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-white whitespace-nowrap`}>
              {aqiData.label}
            </div>
            <button className="ml-auto flex-shrink-0">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/60" />
            </button>
          </div>
          
          <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed">
            {getAQIDescription(aqiIndex)}
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
        {/* PM2.5 */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center flex-shrink-0">
            <div className="text-xs sm:text-sm text-foreground/80 font-medium">PM<sub className="text-[10px]">2.5</sub></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-2xl sm:text-3xl font-bold text-foreground truncate">
              {Math.round(airQuality.pm2_5)}
            </div>
            <div className={`text-xs sm:text-sm font-medium ${pm25Data.color}`}>
              {pm25Data.label}
            </div>
          </div>
        </div>

        {/* PM10 */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center flex-shrink-0">
            <div className="text-xs sm:text-sm text-foreground/80 font-medium">PM<sub className="text-[10px]">10</sub></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-2xl sm:text-3xl font-bold text-foreground truncate">
              {Math.round(airQuality.pm10)}
            </div>
            <div className={`text-xs sm:text-sm font-medium ${pm10Data.color}`}>
              {pm10Data.label}
            </div>
          </div>
        </div>

        {/* CO */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center flex-shrink-0">
            <div className="text-xs sm:text-sm text-foreground/80 font-medium">CO</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-2xl sm:text-3xl font-bold text-foreground truncate">
              {Math.round(airQuality.co || 0)}
            </div>
            <div className={`text-xs sm:text-sm font-medium ${coData.color}`}>
              {coData.label}
            </div>
          </div>
        </div>

        {/* NO2 */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center flex-shrink-0">
            <div className="text-xs sm:text-sm text-foreground/80 font-medium">NO<sub className="text-[10px]">2</sub></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-2xl sm:text-3xl font-bold text-foreground truncate">
              {Math.round(airQuality.no2 || 0)}
            </div>
            <div className={`text-xs sm:text-sm font-medium ${no2Data.color}`}>
              {no2Data.label}
            </div>
          </div>
        </div>

        {/* SO2 */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center flex-shrink-0">
            <div className="text-xs sm:text-sm text-foreground/80 font-medium">SO<sub className="text-[10px]">2</sub></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-2xl sm:text-3xl font-bold text-foreground truncate">
              {Math.round(airQuality.so2 || 0)}
            </div>
            <div className={`text-xs sm:text-sm font-medium ${so2Data.color}`}>
              {so2Data.label}
            </div>
          </div>
        </div>

        {/* O3 */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center flex-shrink-0">
            <div className="text-xs sm:text-sm text-foreground/80 font-medium">O<sub className="text-[10px]">3</sub></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-2xl sm:text-3xl font-bold text-foreground truncate">
              {Math.round(airQuality.o3 || 0)}
            </div>
            <div className={`text-xs sm:text-sm font-medium ${o3Data.color}`}>
              {o3Data.label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
