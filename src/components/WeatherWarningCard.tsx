import { WeatherData } from '@/types/weather';
import { AlertTriangle, CloudRain, CloudSnow, Wind, Zap, Navigation, Target } from 'lucide-react';
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
    
    // Cyclone/Hurricane (very high wind speeds)
    if (windSpeed > 118) {
      return {
        type: 'Cyclonic Storm',
        icon: <Wind className="w-16 h-16 sm:w-20 sm:h-20" />,
        severity: 'high',
        message: `Severe cyclonic conditions detected with wind speeds of ${Math.round(windSpeed)} km/h. Stay indoors and follow local emergency guidelines.`,
        bgGradient: 'from-red-900/90 via-red-800/85 to-orange-900/90',
        iconBg: 'bg-red-800/60'
      };
    }
    
    // Thunderstorm/Storm
    if (condition.includes('thunder') || condition.includes('storm')) {
      return {
        type: 'Thunderstorm Alert',
        icon: <Zap className="w-16 h-16 sm:w-20 sm:h-20" />,
        severity: 'high',
        message: `Severe thunderstorm in your area. Lightning detected. Seek shelter immediately and avoid outdoor activities.`,
        bgGradient: 'from-purple-900/90 via-indigo-900/85 to-blue-900/90',
        iconBg: 'bg-purple-800/60'
      };
    }
    
    // Heavy Rain/Flood Risk
    if (condition.includes('heavy rain') || condition.includes('torrential') || data.current.precip_mm > 50) {
      return {
        type: 'Heavy Rain Warning',
        icon: <CloudRain className="w-16 h-16 sm:w-20 sm:h-20" />,
        severity: 'medium',
        message: `Heavy rainfall detected (${data.current.precip_mm}mm). Potential flooding in low-lying areas. Exercise caution while traveling.`,
        bgGradient: 'from-blue-900/90 via-blue-800/85 to-cyan-900/90',
        iconBg: 'bg-blue-800/60'
      };
    }
    
    // Blizzard/Heavy Snow
    if (condition.includes('blizzard') || (condition.includes('snow') && windSpeed > 50)) {
      return {
        type: 'Blizzard Warning',
        icon: <CloudSnow className="w-16 h-16 sm:w-20 sm:h-20" />,
        severity: 'high',
        message: `Severe snow conditions with reduced visibility. Avoid unnecessary travel and stay warm.`,
        bgGradient: 'from-slate-900/90 via-gray-800/85 to-blue-900/90',
        iconBg: 'bg-slate-800/60'
      };
    }
    
    // High Wind Warning
    if (windSpeed > 60 && windSpeed <= 118) {
      return {
        type: 'High Wind Alert',
        icon: <Wind className="w-16 h-16 sm:w-20 sm:h-20" />,
        severity: 'medium',
        message: `Strong winds detected at ${Math.round(windSpeed)} km/h. Secure loose objects and be cautious of falling debris.`,
        bgGradient: 'from-teal-900/90 via-cyan-800/85 to-blue-900/90',
        iconBg: 'bg-teal-800/60'
      };
    }
    
    // Poor Visibility
    if (visibility < 1) {
      return {
        type: 'Low Visibility Alert',
        icon: <AlertTriangle className="w-16 h-16 sm:w-20 sm:h-20" />,
        severity: 'medium',
        message: `Very poor visibility (${visibility}km). Drive slowly and use fog lights if traveling.`,
        bgGradient: 'from-amber-900/90 via-orange-800/85 to-yellow-900/90',
        iconBg: 'bg-amber-800/60'
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
