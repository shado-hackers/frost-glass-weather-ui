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
    <div className="bg-card/80 backdrop-blur-xl border border-border/30 rounded-3xl p-4 sm:p-6 animate-fade-in shadow-lg">
      <h3 className="text-foreground/60 font-medium text-sm sm:text-base mb-4 tracking-wide">
        24-HOUR FORECAST
      </h3>
      
      <div className="relative w-full" style={{ height: '180px' }}>
        <svg 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
          style={{ willChange: 'transform' }}
        >
          {/* Gradient fill */}
          <defs>
            <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.2)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)" />
            </linearGradient>
          </defs>
          
          {/* Area fill */}
          <path
            d={areaPath}
            fill="url(#tempGradient)"
            style={{ willChange: 'transform' }}
          />
          
          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
            style={{ willChange: 'transform' }}
          />
        </svg>
        
        {/* Temperature points and labels */}
        <div className="absolute inset-0">
          {points.map((point, index) => (
            <div
              key={index}
              className="absolute"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Point circle */}
              <div className="relative">
                <div className="w-2 h-2 bg-white rounded-full shadow-lg" />
                
                {/* Temperature label */}
                {index % 3 === 0 && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <div className="bg-white/10 backdrop-blur-sm px-2 py-1 rounded-lg">
                      <span className="text-foreground text-xs sm:text-sm font-medium">
                        {point.temp}°
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Time labels */}
        <div className="absolute -bottom-6 inset-x-0 flex justify-between px-1" style={{ willChange: 'transform' }}>
          {hourlyData.map((hour, index) => {
            const label = formatTime(hour.time);
            return label ? (
              <div key={index} className="text-foreground/50 text-xs">
                {label}
              </div>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
};