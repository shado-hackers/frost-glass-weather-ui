import { WeatherData } from '@/types/weather';
import { Sunrise, Sunset } from 'lucide-react';

interface SunriseSunsetCardProps {
  data: WeatherData;
}

export const SunriseSunsetCard = ({ data }: SunriseSunsetCardProps) => {
  const { astro } = data.forecast.forecastday[0];
  const currentTime = new Date(data.location.localtime);
  
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
  
  // Format time to 12-hour format
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6">
      <div className="mb-6">
        <h3 className="text-foreground/90 font-medium text-base sm:text-lg">Sun & Moon</h3>
      </div>

      {/* Sunset and Sunrise Headers */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
            <Sunset className="w-6 h-6 sm:w-7 sm:h-7 text-orange-400 animate-pulse" />
          </div>
          <span className="text-xs sm:text-sm text-foreground/70">Sunset</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
            <Sunrise className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400 animate-pulse" />
          </div>
          <span className="text-xs sm:text-sm text-foreground/70">Sunrise</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-4">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-400 via-yellow-300 to-blue-400 transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Current Position Indicator */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 ease-out"
          style={{ left: `${progress}%` }}
        >
          {isDay ? (
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/50 animate-pulse">
              <div className="w-4 h-4 bg-yellow-300 rounded-full" />
            </div>
          ) : (
            <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center shadow-lg shadow-blue-200/50 relative">
              <div className="absolute top-1 right-1 w-6 h-6 bg-white/5 backdrop-blur-sm rounded-full" />
              <span className="text-xl">🌙</span>
            </div>
          )}
        </div>
      </div>

      {/* Times */}
      <div className="flex items-center justify-between">
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-foreground">
            {formatTime(sunsetTime)}
          </div>
        </div>

        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-foreground">
            {formatTime(sunriseTime)}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="text-foreground/70">
            <span className="block text-foreground/50 mb-1">Day Length</span>
            <span className="font-medium text-foreground">
              {Math.floor((sunsetTime.getTime() - sunriseTime.getTime()) / (1000 * 60 * 60))}h {Math.floor(((sunsetTime.getTime() - sunriseTime.getTime()) / (1000 * 60)) % 60)}m
            </span>
          </div>
          <div className="text-foreground/70 text-right">
            <span className="block text-foreground/50 mb-1">{astro.moon_phase ? 'Moon Phase' : 'Moonrise'}</span>
            <span className="font-medium text-foreground">{astro.moon_phase || astro.moonrise}</span>
          </div>
        </div>
      </div>
    </div>
  );
};