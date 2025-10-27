import { useEffect, useState } from 'react';
import { getWeatherGradient } from '@/utils/weatherUtils';
import clearDayBg from '@/assets/weather-bg/clear-day.png';
import clearNightBg from '@/assets/weather-bg/clear-night.png';
import cloudyDayBg from '@/assets/weather-bg/cloudy-day.png';
import cloudyNightBg from '@/assets/weather-bg/cloudy-night.png';
import rainyDayBg from '@/assets/weather-bg/rainy-day.png';
import rainyNightBg from '@/assets/weather-bg/rainy-night.png';
import snowyDayBg from '@/assets/weather-bg/snowy-day.png';
import snowyNightBg from '@/assets/weather-bg/snowy-night.png';
import stormDayBg from '@/assets/weather-bg/storm-day.png';
import stormNightBg from '@/assets/weather-bg/storm-night.png';
import fogDayBg from '@/assets/weather-bg/fog-day.png';
import fogNightBg from '@/assets/weather-bg/fog-night.png';
import hazyDayBg from '@/assets/weather-bg/hazy-day.png';
import hazyNightBg from '@/assets/weather-bg/hazy-night.png';
import partlyCloudyDayBg from '@/assets/weather-bg/partly-cloudy-day.png';
import partlyCloudyNightBg from '@/assets/weather-bg/partly-cloudy-night.png';
import overcastDayBg from '@/assets/weather-bg/overcast-day.png';
import overcastNightBg from '@/assets/weather-bg/overcast-night.png';

interface WeatherBackgroundProps {
  condition: string;
  isDay: boolean;
}

export const WeatherBackground = ({ condition, isDay }: WeatherBackgroundProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number }>>([]);
  const gradient = getWeatherGradient(condition, isDay);
  const conditionLower = condition.toLowerCase();

  // Select background image based on weather condition and time of day
  const getBackgroundImage = () => {
    // Thunderstorm/Storm - highest priority
    if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
      return isDay ? stormDayBg : stormNightBg;
    }
    
    // Snow conditions
    if (conditionLower.includes('snow') || conditionLower.includes('blizzard') || conditionLower.includes('sleet')) {
      return isDay ? snowyDayBg : snowyNightBg;
    }
    
    // Rain conditions (but not thunderstorm)
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle') || conditionLower.includes('shower')) {
      return isDay ? rainyDayBg : rainyNightBg;
    }
    
    // Fog/Mist conditions
    if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
      return isDay ? fogDayBg : fogNightBg;
    }
    
    // Hazy/Dust conditions
    if (conditionLower.includes('haz') || conditionLower.includes('dust') || conditionLower.includes('sand') || conditionLower.includes('smoke')) {
      return isDay ? hazyDayBg : hazyNightBg;
    }
    
    // Overcast (completely cloudy)
    if (conditionLower.includes('overcast')) {
      return isDay ? overcastDayBg : overcastNightBg;
    }
    
    // Partly cloudy
    if (conditionLower.includes('partly') && conditionLower.includes('cloud')) {
      return isDay ? partlyCloudyDayBg : partlyCloudyNightBg;
    }
    
    // General cloudy
    if (conditionLower.includes('cloud')) {
      return isDay ? cloudyDayBg : cloudyNightBg;
    }
    
    // Clear, sunny, or default
    return isDay ? clearDayBg : clearNightBg;
  };

  const backgroundImage = getBackgroundImage();

  useEffect(() => {
    // Create particles for rain/snow effects
    if (conditionLower.includes('rain') || conditionLower.includes('snow') || conditionLower.includes('storm')) {
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 5,
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [condition]);

  const renderWeatherEffects = () => {
    if (conditionLower.includes('rain') || conditionLower.includes('storm')) {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-0.5 h-12 bg-white/30"
              style={{
                left: `${particle.x}%`,
                top: '-48px',
                animation: `fall 1s linear infinite`,
                animationDelay: `${particle.delay}s`,
              }}
            />
          ))}
        </div>
      );
    }

    if (conditionLower.includes('snow')) {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-2 h-2 bg-white/70 rounded-full"
              style={{
                left: `${particle.x}%`,
                top: '-8px',
                animation: `fall 3s linear infinite, sway 2s ease-in-out infinite`,
                animationDelay: `${particle.delay}s`,
              }}
            />
          ))}
        </div>
      );
    }

    if (!isDay && conditionLower.includes('clear')) {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/80 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {/* Weather background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          transform: 'scale(1.05)' // Slight scale to prevent edges showing
        }}
      />

      {/* Gradient overlay for depth */}
      <div className={`fixed inset-0 bg-gradient-to-br ${gradient} opacity-30 transition-all duration-1000 ease-in-out mix-blend-overlay`} />
      
      {/* Dynamic cloud layers for cloudy conditions */}
      {(conditionLower.includes('cloud') || conditionLower.includes('overcast')) && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-[10%] left-[5%] w-96 h-48 bg-white/20 rounded-full blur-3xl animate-float" />
            <div className="absolute top-[30%] right-[10%] w-80 h-40 bg-white/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
            <div className="absolute top-[50%] left-[20%] w-72 h-36 bg-white/25 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
            <div className="absolute top-[20%] right-[30%] w-64 h-32 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '7s' }} />
          </div>
        </div>
      )}
      
      {/* Animated overlay shapes for depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-white/5 rounded-full blur-3xl animate-float" />
        <div 
          className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-white/5 rounded-full blur-3xl animate-float" 
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* Additional atmospheric effects */}
      {(conditionLower.includes('fog') || conditionLower.includes('mist')) && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm pointer-events-none" />
      )}

      {renderWeatherEffects()}

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh);
          }
        }
        @keyframes sway {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(20px);
          }
        }
      `}</style>
    </>
  );
};
