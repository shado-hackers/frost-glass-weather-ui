import { WeatherData } from '@/types/weather';
import { Sunrise, Sunset } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SunriseSunsetCardProps {
  data: WeatherData;
}

export const SunriseSunsetCard = ({ data }: SunriseSunsetCardProps) => {
  const { astro } = data.forecast.forecastday[0];
  const [currentTime, setCurrentTime] = useState(new Date(data.location.localtime));
  
  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Parse sunrise and sunset times
  const parseSunTime = (timeStr: string) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    const date = new Date(currentTime);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };
  
  const sunriseTime = parseSunTime(astro.sunrise);
  const sunsetTime = parseSunTime(astro.sunset);
  
  // Calculate progress (0-100%)
  const calculateProgress = () => {
    const now = currentTime.getTime();
    const sunrise = sunriseTime.getTime();
    const sunset = sunsetTime.getTime();
    
    if (now < sunrise) {
      // Before sunrise (night)
      const prevSunset = new Date(sunset);
      prevSunset.setDate(prevSunset.getDate() - 1);
      const nightDuration = sunrise - prevSunset.getTime();
      const elapsed = now - prevSunset.getTime();
      return (elapsed / nightDuration) * 100;
    } else if (now > sunset) {
      // After sunset (night)
      const nextSunrise = new Date(sunrise);
      nextSunrise.setDate(nextSunrise.getDate() + 1);
      const nightDuration = nextSunrise.getTime() - sunset;
      const elapsed = now - sunset;
      return (elapsed / nightDuration) * 100;
    } else {
      // Daytime
      const dayDuration = sunset - sunrise;
      const elapsed = now - sunrise;
      return (elapsed / dayDuration) * 100;
    }
  };
  
  const progress = calculateProgress();
  const isDay = currentTime >= sunriseTime && currentTime <= sunsetTime;
  
  // Format time to uppercase 12-hour format
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).toUpperCase();
  };

  return (
    <div className="relative overflow-hidden bg-card/80 backdrop-blur-xl border border-border/30 rounded-3xl p-4 sm:p-6 shadow-lg transition-all duration-700">
      {/* Dynamic Background */}
      <div className="absolute inset-0 transition-opacity duration-700 pointer-events-none">
        {isDay ? (
          // Day background - light gradient
          <div className="absolute inset-0 bg-gradient-to-br from-sky-100/40 via-blue-50/30 to-orange-50/40 dark:from-sky-900/20 dark:via-blue-900/15 dark:to-orange-900/20" />
        ) : (
          // Night background - dark with stars
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-blue-950/40 to-slate-900/50" />
            {/* Animated stars */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  opacity: 0.6 + Math.random() * 0.4
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="mb-6">
          <h3 className="text-foreground/90 font-medium text-base sm:text-lg">Sun & Moon</h3>
        </div>

        {/* Sunrise and Sunset Headers - swap positions at night */}
        <div className="flex items-center justify-between mb-4 transition-all duration-500">
          {isDay ? (
            <>
              {/* Day layout: Sunrise left, Sunset right */}
              <div className="flex flex-col items-center gap-2 gpu-accelerated">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200/30 dark:border-yellow-800/30 rounded-2xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shadow-lg">
                  <Sunrise className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-500 dark:text-yellow-400" />
                </div>
                <span className="text-xs sm:text-sm text-foreground/70 font-medium">Sunrise</span>
              </div>

              <div className="flex flex-col items-center gap-2 gpu-accelerated">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200/30 dark:border-orange-800/30 rounded-2xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shadow-lg">
                  <Sunset className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500 dark:text-orange-400" />
                </div>
                <span className="text-xs sm:text-sm text-foreground/70 font-medium">Sunset</span>
              </div>
            </>
          ) : (
            <>
              {/* Night layout: Sunset left, Sunrise right */}
              <div className="flex flex-col items-center gap-2 gpu-accelerated">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200/30 dark:border-orange-800/30 rounded-2xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shadow-lg">
                  <Sunset className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500 dark:text-orange-400" />
                </div>
                <span className="text-xs sm:text-sm text-foreground/70 font-medium">Sunset</span>
              </div>

              <div className="flex flex-col items-center gap-2 gpu-accelerated">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200/30 dark:border-yellow-800/30 rounded-2xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shadow-lg">
                  <Sunrise className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-500 dark:text-yellow-400" />
                </div>
                <span className="text-xs sm:text-sm text-foreground/70 font-medium">Sunrise</span>
              </div>
            </>
          )}
        </div>

        {/* Progress Bar */}
        <div className="relative mb-6 gpu-accelerated">
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${progress}%`,
                background: isDay 
                  ? 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #fb923c 100%)'
                  : 'linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)'
              }}
            />
          </div>
          
          {/* Current Position Indicator */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 ease-out gpu-accelerated"
            style={{ left: `${progress}%` }}
          >
            {isDay ? (
              <div className="w-9 h-9 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center shadow-xl shadow-yellow-400/50">
                <div className="w-5 h-5 bg-yellow-100 rounded-full" />
              </div>
            ) : (
              <div className="w-9 h-9 bg-gradient-to-br from-slate-200 to-blue-200 rounded-full flex items-center justify-center shadow-xl shadow-blue-300/50 relative overflow-hidden">
                <div className="absolute top-0.5 right-0.5 w-7 h-7 bg-slate-800/20 rounded-full" />
                <span className="text-xl relative z-10">🌙</span>
              </div>
            )}
          </div>
        </div>

        {/* Times - swap positions at night */}
        <div className="flex items-center justify-between mb-4 transition-all duration-500">
          {isDay ? (
            <>
              <div className="text-center gpu-accelerated">
                <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  {formatTime(sunriseTime)}
                </div>
              </div>

              <div className="text-center gpu-accelerated">
                <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  {formatTime(sunsetTime)}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center gpu-accelerated">
                <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  {formatTime(sunsetTime)}
                </div>
              </div>

              <div className="text-center gpu-accelerated">
                <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  {formatTime(sunriseTime)}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-border/20">
          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="text-foreground/70">
              <span className="block text-foreground/50 mb-1">Day Length</span>
              <span className="font-medium text-foreground">
                {Math.floor((sunsetTime.getTime() - sunriseTime.getTime()) / (1000 * 60 * 60))}h {Math.floor(((sunsetTime.getTime() - sunriseTime.getTime()) / (1000 * 60)) % 60)}m
              </span>
            </div>
            <div className="text-foreground/70 text-right">
              <span className="block text-foreground/50 mb-1">Moon Phase</span>
              <span className="font-medium text-foreground">{astro.moon_phase || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};