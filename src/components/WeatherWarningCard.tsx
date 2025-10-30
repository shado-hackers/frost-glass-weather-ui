import { WeatherData } from '@/types/weather';
import { AlertTriangle, CloudRain, CloudSnow, Wind, Zap, Navigation, Target, Flame, Droplets, CloudFog, Snowflake, CloudDrizzle, Mountain, Eye } from 'lucide-react';
import { useMemo } from 'react';

interface WeatherWarningCardProps {
  data: WeatherData;
}

interface WarningInfo {
  type: string;
  icon: React.ReactNode;
  severity: 'high' | 'medium' | 'low';
  message: string;
  bgGradient: string;
  iconBg: string;
}

export const WeatherWarningCard = ({ data }: WeatherWarningCardProps) => {
  const warningInfo = useMemo((): WarningInfo | null => {
    const condition = data.current.condition.text.toLowerCase();
    const windSpeed = data.current.wind_kph;
    const visibility = data.current.vis_km;
    const temp = data.current.temp_c;
    const feelsLike = data.current.feelslike_c;
    const precip = data.current.precip_mm;
    
    // Heavy Cyclonic Storm (very high wind speeds)
    if (windSpeed > 118) {
      return {
        type: '🌪️ Heavy Cyclonic Storm',
        icon: <Wind className="w-16 h-16 sm:w-20 sm:h-20" />,
        severity: 'high',
        message: `Severe cyclonic conditions with wind speeds of ${Math.round(windSpeed)} km/h. Stay indoors, secure all objects, and follow emergency guidelines.`,
        bgGradient: 'from-red-950/95 via-red-900/90 to-orange-950/95',
        iconBg: 'bg-red-900/70'
      };
    }
    
    // Cyclonic Storm (high wind speeds)
    if (windSpeed > 60 && windSpeed <= 118) {
      return {
        type: '🌀 Cyclonic Storm',
        icon: <Wind className="w-16 h-16 sm:w-20 sm:h-20" />,
        severity: 'high',
        message: `Strong cyclonic winds at ${Math.round(windSpeed)} km/h. Secure loose objects, stay indoors, and avoid coastal areas.`,
        bgGradient: 'from-orange-950/95 via-red-900/90 to-pink-950/95',
        iconBg: 'bg-orange-900/70'
      };
    }
    
    // Thunderstorm/Lightning/Squalls
    if (condition.includes('thunder') || condition.includes('storm') || condition.includes('squall') || condition.includes('lightning')) {
      return {
        type: '⚡ Thunderstorm Alert',
        icon: <Zap className="w-16 h-16 sm:w-20 sm:h-20" />,
        severity: 'high',
        message: `Severe thunderstorm with lightning detected. Stay indoors, unplug electronics, and avoid open areas and water bodies.`,
        bgGradient: 'from-purple-950/95 via-indigo-950/90 to-blue-950/95',
        iconBg: 'bg-purple-900/70'
      };
    }
    
    // Heavy Rain/Flash Flood Risk
    if (condition.includes('heavy rain') || condition.includes('torrential') || precip > 50 || condition.includes('flood')) {
      return {
        type: '🌊 Heavy Rain & Flash Flood',
        icon: <CloudRain className="w-16 h-16 sm:w-20 sm:h-20" />,
        severity: 'high',
        message: `Heavy rainfall detected (${precip}mm). Flash flood risk in low-lying areas. Avoid travel and stay away from water bodies.`,
        bgGradient: 'from-blue-950/95 via-blue-900/90 to-cyan-950/95',
        iconBg: 'bg-blue-900/70'
      };
    }
    
    // Rain Alert (light to moderate)
    if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower')) {
      return {
        type: '🌧️ Rain Alert',
        icon: <CloudDrizzle className="w-16 h-16 sm:w-20 sm:h-20" />,
        severity: 'low',
        message: `Rainfall expected in your area. Carry an umbrella and drive carefully on wet roads.`,
        bgGradient: 'from-slate-900/90 via-blue-900/85 to-gray-900/90',
        iconBg: 'bg-slate-800/60'
      };
    }
    
    // Blizzard/Heavy Snow
    if (condition.includes('blizzard') || (condition.includes('snow') && windSpeed > 30)) {
      return {
        type: '❄️ Blizzard Warning',
        icon: <CloudSnow className="w-16 h-16 sm:w-20 sm:h-20" />,
        severity: 'high',
        message: `Severe snow conditions with strong winds (${Math.round(windSpeed)} km/h). Avoid travel, stay warm, and prepare for power outages.`,
        bgGradient: 'from-slate-950/95 via-gray-900/90 to-blue-950/95',
        iconBg: 'bg-slate-900/70'
      };
    }
    
    // Cold Wave / Snow
    if (temp <= 5 || condition.includes('snow') || condition.includes('ice') || condition.includes('frost') || condition.includes('freeze')) {
      return {
        type: '🥶 Cold Wave / Snow',
        icon: <Snowflake className="w-16 h-16 sm:w-20 sm:h-20" />,
        severity: 'medium',
        message: `Extremely cold conditions at ${Math.round(temp)}°C. Risk of hypothermia and frostbite. Wear warm clothing and limit outdoor exposure.`,
        bgGradient: 'from-cyan-950/90 via-blue-950/85 to-indigo-950/90',
        iconBg: 'bg-cyan-900/60'
      };
    }
    
    // Heat Wave
    if (temp > 35 || feelsLike > 38) {
      return {
        type: '🔥 Heat Wave Warning',
        icon: <Flame className="w-16 h-16 sm:w-20 sm:h-20" />,
        severity: 'high',
        message: `Extreme heat at ${Math.round(temp)}°C (feels like ${Math.round(feelsLike)}°C). Stay hydrated, avoid direct sunlight, and check on elderly neighbors.`,
        bgGradient: 'from-orange-950/95 via-red-900/90 to-yellow-950/95',
        iconBg: 'bg-orange-900/70'
      };
    }
    
    // Sandstorm/Dust Storm
    if (condition.includes('sand') || condition.includes('dust')) {
      return {
        type: '🏜️ Sandstorm Alert',
        icon: <Wind className="w-16 h-16 sm:w-20 sm:h-20" />,
        severity: 'medium',
        message: `Sandstorm conditions with poor air quality. Stay indoors, close windows, and wear protective gear if you must go outside.`,
        bgGradient: 'from-amber-950/90 via-yellow-900/85 to-orange-950/90',
        iconBg: 'bg-amber-900/60'
      };
    }
    
    // Only show fog/mist/haze warning if visibility is critically low (< 1km already handled below)
    // Removed duplicate fog/mist/haze warnings to avoid overlapping
    
    // Landslide Risk (heavy rain + mountain areas)
    if ((precip > 30 || condition.includes('heavy')) && condition.includes('rain')) {
      return {
        type: '⛰️ Landslide Risk',
        icon: <Mountain className="w-16 h-16 sm:w-20 sm:h-20" />,
        severity: 'high',
        message: `Heavy rainfall may trigger landslides in hilly areas. Avoid slopes, stay alert for unusual sounds, and evacuate if advised.`,
        bgGradient: 'from-stone-950/90 via-brown-900/85 to-amber-950/90',
        iconBg: 'bg-stone-900/60'
      };
    }
    
    // High Wind Warning (40-60 km/h)
    if (windSpeed > 40 && windSpeed <= 60) {
      return {
        type: '💨 High Wind Alert',
        icon: <Wind className="w-16 h-16 sm:w-20 sm:h-20" />,
        severity: 'medium',
        message: `Strong winds at ${Math.round(windSpeed)} km/h. Secure loose objects and be cautious of falling debris.`,
        bgGradient: 'from-teal-950/90 via-cyan-900/85 to-blue-950/90',
        iconBg: 'bg-teal-900/60'
      };
    }
    
    // Low Visibility (less than 1km)
    if (visibility < 1) {
      return {
        type: '⚠️ Critical Low Visibility',
        icon: <AlertTriangle className="w-16 h-16 sm:w-20 sm:h-20" />,
        severity: 'high',
        message: `Extremely poor visibility (${visibility}km). Avoid travel if possible. Use fog lights and drive at very low speeds.`,
        bgGradient: 'from-amber-950/95 via-orange-900/90 to-yellow-950/95',
        iconBg: 'bg-amber-900/70'
      };
    }
    
    return null;
  }, [data]);

  if (!warningInfo) return null;

  const getSeverityColor = () => {
    switch (warningInfo.severity) {
      case 'high':
        return 'border-red-500/50';
      case 'medium':
        return 'border-orange-500/50';
      case 'low':
        return 'border-yellow-500/50';
    }
  };

  const getSeverityText = () => {
    switch (warningInfo.severity) {
      case 'high':
        return 'High Risk';
      case 'medium':
        return 'Medium Risk';
      case 'low':
        return 'Low Risk';
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl border-2 ${getSeverityColor()} backdrop-blur-xl shadow-2xl animate-scale-in gpu-accelerated`}>
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${warningInfo.bgGradient} opacity-95`} />
      
      {/* Animated pulse effect */}
      <div className="absolute inset-0 bg-white/5 animate-pulse" style={{ animationDuration: '3s' }} />
      
      {/* Content */}
      <div className="relative p-5 sm:p-6">
        {/* Header with Icon */}
        <div className="flex items-start gap-4 mb-4">
          {/* Icon Container */}
          <div className={`flex-shrink-0 ${warningInfo.iconBg} backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-lg animate-fade-in`}>
            <div className="text-white animate-pulse" style={{ animationDuration: '2s' }}>
              {warningInfo.icon}
            </div>
          </div>
          
          {/* Warning Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 animate-pulse flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-yellow-300 uppercase tracking-wider">
                Weather Alert
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1 animate-fade-in">
              {warningInfo.type}
            </h3>
            <div className="flex items-center gap-2 text-white/90">
              <span className="text-xs sm:text-sm font-medium bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                {data.location.name}
              </span>
              <span className={`text-xs sm:text-sm font-bold ${
                warningInfo.severity === 'high' ? 'text-red-300' : 
                warningInfo.severity === 'medium' ? 'text-orange-300' : 
                'text-yellow-300'
              }`}>
                • {getSeverityText()}
              </span>
            </div>
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Wind Info */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-1">
              <Navigation 
                className="w-4 h-4 text-white/70" 
                style={{ transform: `rotate(${data.current.wind_degree}deg)` }}
              />
              <span className="text-xs text-white/70 uppercase tracking-wide">Movement</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-white">
              {data.current.wind_dir}
            </p>
            <p className="text-xs text-white/60">
              {Math.round(data.current.wind_kph)} km/h
            </p>
          </div>

          {/* Visibility Info */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-white/70" />
              <span className="text-xs text-white/70 uppercase tracking-wide">Visibility</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-white">
              {data.current.vis_km} km
            </p>
            <p className="text-xs text-white/60">
              Current range
            </p>
          </div>
        </div>

        {/* Warning Message */}
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white/10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            {warningInfo.message}
          </p>
        </div>

        {/* Timestamp */}
        <div className="mt-3 text-center">
          <p className="text-xs text-white/50">
            Alert issued at {new Date().toLocaleTimeString()} • Stay safe
          </p>
        </div>
      </div>

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full transform translate-x-16 -translate-y-16" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-tr-full transform -translate-x-16 translate-y-16" />
    </div>
  );
};
