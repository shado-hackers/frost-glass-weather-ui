import { WeatherData } from '@/types/weather';
import { getWeatherIconImage } from '@/utils/weatherIcons';
import { Cloud, CloudRain, CloudSnow, CloudDrizzle } from 'lucide-react';
import { useMemo } from 'react';

interface DayForecastGraphProps {
  data: WeatherData;
}

export const DayForecastGraph = ({ data }: DayForecastGraphProps) => {
  const hourlyData = data.forecast.forecastday[0].hour;
  
  // Get data for 4 time periods: Morning (6-9), Afternoon (12-15), Evening (18-21), Overnight (0-3)
  const periods = useMemo(() => {
    const getPeriodData = (hours: number[]) => {
      const periodHours = hours.map(h => hourlyData[h]).filter(Boolean);
      if (periodHours.length === 0) return null;
      
      const avgTemp = Math.round(
        periodHours.reduce((sum, h) => sum + h.temp_c, 0) / periodHours.length
      );
      const avgPrecip = Math.round(
        periodHours.reduce((sum, h) => sum + h.chance_of_rain, 0) / periodHours.length
      );
      const condition = periodHours[Math.floor(periodHours.length / 2)].condition;
      
      return { temp: avgTemp, precip: avgPrecip, condition };
    };

    return [
      { label: 'Morning', data: getPeriodData([6, 7, 8, 9]), isDay: true },
      { label: 'Afternoon', data: getPeriodData([12, 13, 14, 15]), isDay: true },
      { label: 'Evening', data: getPeriodData([18, 19, 20, 21]), isDay: false },
      { label: 'Overnight', data: getPeriodData([0, 1, 2, 3]), isDay: false },
    ].filter(p => p.data !== null);
  }, [hourlyData]);

  // Calculate graph points
  const graphPoints = useMemo(() => {
    const temps = periods.map(p => p.data!.temp);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const tempRange = maxTemp - minTemp || 1;

    return periods.map((period, index) => {
      const x = 12.5 + (index * 25); // Distribute evenly: 12.5, 37.5, 62.5, 87.5
      const normalizedTemp = (period.data!.temp - minTemp) / tempRange;
      const y = 22 - (normalizedTemp * 19); // Range from 3 to 22 (inverted for SVG)
      
      return { x, y, temp: period.data!.temp };
    });
  }, [periods]);

  // Create SVG path
  const pathD = useMemo(() => {
    return graphPoints.map((point, i) => 
      `${i === 0 ? 'M' : 'L'} ${point.x},${point.y}`
    ).join(' ');
  }, [graphPoints]);

  const currentHour = new Date().getHours();
  const currentCondition = data.current.condition.text;
  const feelsLike = Math.round(data.current.feelslike_c);
  const dayTemp = Math.round(data.forecast.forecastday[0].day.maxtemp_c);
  const nightTemp = Math.round(data.forecast.forecastday[0].day.mintemp_c);

  // Get greeting based on time
  const getGreeting = () => {
    if (currentHour >= 5 && currentHour < 12) return 'Good morning';
    if (currentHour >= 12 && currentHour < 17) return 'Good afternoon';
    if (currentHour >= 17 && currentHour < 22) return 'Good evening';
    return 'Good night';
  };

  return (
    <div className="bg-card/60 backdrop-blur-xl border border-border/20 rounded-3xl overflow-hidden shadow-xl animate-fade-in gpu-accelerated">
      {/* Top Section - Current Weather */}
      <div className="relative h-48 sm:h-56 overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background/50">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20" />
        
        <div className="relative p-5 sm:p-6 text-foreground flex flex-col justify-end h-full">
          <p className="text-base sm:text-lg font-light text-foreground/80 mb-1">
            {getGreeting()}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 leading-tight">
            It's <span className="text-primary">{Math.round(data.current.temp_c)}°</span> and {currentCondition}
          </h1>
          <p className="text-base sm:text-lg font-light text-foreground/80 mb-3">
            Feels Like <span className="font-medium">{feelsLike}°</span>
          </p>
          <p className="text-lg sm:text-xl font-medium">
            Day <span className="text-orange-400">{dayTemp}°</span> • Night <span className="text-blue-400">{nightTemp}°</span>
          </p>
        </div>
      </div>

      {/* Bottom Section - Forecast Graph */}
      <div className="p-4 sm:p-6 bg-gradient-to-br from-card/90 via-card/80 to-card/70 backdrop-blur-lg">
        <p className="text-foreground/70 text-xs sm:text-sm mb-4 leading-relaxed">
          {data.current.condition.text} conditions right now in {data.location.name}
        </p>

        {/* Period Labels */}
        <div className="flex justify-between text-center text-foreground/80 mb-2 font-medium text-xs sm:text-sm">
          {periods.map((period) => (
            <div key={period.label} className="flex-1">
              {period.label}
            </div>
          ))}
        </div>

        {/* Temperatures */}
        <div className="flex justify-between text-center font-bold text-lg sm:text-xl text-foreground mb-4">
          {periods.map((period) => (
            <div key={period.label} className="flex-1">
              {period.data!.temp}°
            </div>
          ))}
        </div>

        {/* Weather Graph */}
        <div className="w-full h-20 sm:h-24 mb-4">
          <svg viewBox="0 0 100 25" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="graphGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.6 }} />
              </linearGradient>
            </defs>
            
            <path
              d={pathD}
              fill="none"
              stroke="url(#graphGradient)"
              strokeWidth="1.5"
              className="transition-all duration-700 ease-in-out"
            />
            
            {graphPoints.map((point, i) => (
              <circle
                key={i}
                cx={point.x}
                cy={point.y}
                r="2"
                fill="hsl(var(--primary))"
                className="transition-all duration-700 ease-in-out"
                style={{
                  filter: 'drop-shadow(0 0 4px hsl(var(--primary) / 0.5))'
                }}
              />
            ))}
          </svg>
        </div>

        {/* Icons and Precipitation */}
        <div className="flex justify-between text-center text-foreground/70">
          {periods.map((period, i) => (
            <div key={period.label} className="flex-1 flex flex-col items-center">
              <img
                src={getWeatherIconImage(period.data!.condition.code, period.isDay)}
                alt={period.data!.condition.text}
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain mb-1 transition-all duration-700"
              />
              <span className="text-xs sm:text-sm font-medium">
                {period.data!.precip}%
              </span>
            </div>
          ))}
        </div>

        <div className="text-center text-foreground/50 text-xs mt-4 sm:mt-6">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
