import { WeatherData } from '@/types/weather';

interface TemperatureForecastChartProps {
  data: WeatherData;
}

export const TemperatureForecastChart = ({ data }: TemperatureForecastChartProps) => {
  // Get 24 hours of forecast data, spanning multiple days if needed
  const hourlyData = [];
  const currentHour = new Date().getHours();
  const totalHours = 24;
  
  for (let i = 0; i < totalHours; i++) {
    const targetHour = currentHour + i;
    const dayIndex = Math.floor(targetHour / 24);
    const hourIndex = targetHour % 24;
    
    if (dayIndex < data.forecast.forecastday.length) {
      const hour = data.forecast.forecastday[dayIndex].hour[hourIndex];
      if (hour) hourlyData.push(hour);
    }
  }
  
  if (hourlyData.length === 0) return null;
  
  // Calculate min/max for scaling
  const temps = hourlyData.map(h => h.temp_c);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = maxTemp - minTemp || 1; // Avoid division by zero
  
  // Calculate Y position (inverted for SVG coordinates)
  const getYPosition = (temp: number) => {
    const normalizedTemp = (temp - minTemp) / tempRange;
    return 100 - (normalizedTemp * 80 + 10); // Scale to 10-90% of chart height
  };
  
  // Create SVG path for the line
  const points = hourlyData.map((hour, index) => {
    const x = (index / (hourlyData.length - 1)) * 100;
    const y = getYPosition(hour.temp_c);
    return { x, y, temp: Math.round(hour.temp_c), time: hour.time };
  });
  
  const linePath = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');
  
  const areaPath = `${linePath} L 100 100 L 0 100 Z`;
  
  // Format time to show hour
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const hours = date.getHours();
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    if (hours === 0) return day;
    return hours % 6 === 0 ? `${hours}h` : '';
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-card/60 via-card/40 to-card/60 backdrop-blur-xl border border-border/30 rounded-3xl p-4 sm:p-6 animate-fade-in shadow-lg gpu-accelerated">
      {/* Gradient lens effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none" />
      
      <div className="relative z-10">
        <h3 className="text-foreground/60 font-medium text-xs sm:text-sm mb-3 sm:mb-4 tracking-wider uppercase">
          24-Hour Forecast
        </h3>
        
        <div className="relative w-full" style={{ height: '160px' }}>
          <svg 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full gpu-accelerated"
            style={{ willChange: 'transform', transform: 'translateZ(0)' }}
          >
            {/* Enhanced gradient fill with glassmorphism */}
            <defs>
              <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary) / 0.3)" />
                <stop offset="50%" stopColor="hsl(var(--primary) / 0.15)" />
                <stop offset="100%" stopColor="hsl(var(--primary) / 0.05)" />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary) / 0.8)" />
                <stop offset="50%" stopColor="hsl(var(--primary) / 1)" />
                <stop offset="100%" stopColor="hsl(var(--primary) / 0.8)" />
              </linearGradient>
            </defs>
            
            {/* Area fill with gradient */}
            <path
              d={areaPath}
              fill="url(#tempGradient)"
              className="transition-all duration-300"
              style={{ willChange: 'transform', transform: 'translateZ(0)' }}
            />
            
            {/* Line with enhanced styling */}
            <path
              d={linePath}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="0.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className="transition-all duration-300"
              style={{ willChange: 'transform', transform: 'translateZ(0)' }}
            />
          </svg>
        
          {/* Temperature points and labels - optimized */}
          <div className="absolute inset-0">
            {points.map((point, index) => (
              <div
                key={index}
                className="absolute gpu-accelerated"
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  transform: 'translate(-50%, -50%) translateZ(0)',
                  willChange: 'transform',
                }}
              >
                {/* Point circle with enhanced styling */}
                <div className="relative">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary rounded-full shadow-lg transition-all duration-200 hover:scale-125" 
                    style={{ 
                      boxShadow: '0 0 8px hsl(var(--primary) / 0.5)',
                      willChange: 'transform'
                    }}
                  />
                  
                  {/* Temperature label with gradient lens */}
                  {index % 3 === 0 && (
                    <div className="absolute -top-7 sm:-top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap animate-scale-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="relative bg-gradient-to-br from-card/80 via-card/60 to-card/80 backdrop-blur-lg px-2 py-0.5 sm:py-1 rounded-lg border border-border/30 shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-lg pointer-events-none" />
                        <span className="relative text-foreground text-xs sm:text-sm font-semibold">
                          {point.temp}°
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        
          {/* Time labels - optimized */}
          <div className="absolute -bottom-5 sm:-bottom-6 inset-x-0 flex justify-between px-0.5 sm:px-1" 
            style={{ willChange: 'transform', transform: 'translateZ(0)' }}
          >
            {hourlyData.map((hour, index) => {
              const label = formatTime(hour.time);
              return label ? (
                <div key={index} className="text-foreground/60 text-[10px] sm:text-xs font-medium">
                  {label}
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};