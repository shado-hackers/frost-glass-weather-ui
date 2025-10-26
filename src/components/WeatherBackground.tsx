import { useEffect, useState } from 'react';
import { getWeatherGradient } from '@/utils/weatherUtils';

interface WeatherBackgroundProps {
  condition: string;
  isDay: boolean;
}

export const WeatherBackground = ({ condition, isDay }: WeatherBackgroundProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number }>>([]);
  const gradient = getWeatherGradient(condition, isDay);
  const conditionLower = condition.toLowerCase();

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
      <div className={`fixed inset-0 bg-gradient-to-br ${gradient} transition-all duration-1000 ease-in-out`} />
      
      {/* Animated overlay shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-white/5 rounded-full blur-3xl animate-float" />
        <div 
          className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-white/5 rounded-full blur-3xl animate-float" 
          style={{ animationDelay: '2s' }}
        />
      </div>

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
