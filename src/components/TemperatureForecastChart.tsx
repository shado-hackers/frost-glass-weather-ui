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
  const tempRange = maxTemp - minTemp || 1;
  
  // Calculate Y position (inverted for SVG coordinates)
  const getYPosition = (temp: number) => {
    const normalizedTemp = (temp - minTemp) / tempRange;
    return 100 - (normalizedTemp * 65 + 17.5); // Scale to 17.5-82.5% of chart height
  };
  
  // Create points for smooth curve
  const points = hourlyData.map((hour, index) => {
    const x = (index / (hourlyData.length - 1)) * 100;
    const y = getYPosition(hour.temp_c);
    return { x, y, temp: Math.round(hour.temp_c), time: hour.time, hour: new Date(hour.time).getHours() };
  });
  
  // Find local min/max points for label placement
  const findLabelPoints = () => {
    const labelIndices: number[] = [0]; // Always show first
    
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1].temp;
      const curr = points[i].temp;
      const next = points[i + 1].temp;
      
      // Local maximum or minimum
      if ((curr > prev && curr > next) || (curr < prev && curr < next)) {
        // Ensure minimum distance from last label (avoid too close labels)
        const lastLabelIndex = labelIndices[labelIndices.length - 1];
        if (i - lastLabelIndex >= 4) {
          labelIndices.push(i);
        }
      }
    }
    
    // Add last point if not too close to previous
    if (points.length - 1 - labelIndices[labelIndices.length - 1] >= 4) {
      labelIndices.push(points.length - 1);
    }
    
    return labelIndices;
  };
  
  const labelIndices = findLabelPoints();
  
  // Create smooth curve path using bezier curves
  const createSmoothPath = (pts: typeof points) => {
    if (pts.length < 2) return '';
    
    let path = `M ${pts[0].x} ${pts[0].y}`;
    
    for (let i = 0; i < pts.length - 1; i++) {
      const current = pts[i];
      const next = pts[i + 1];
      const controlPointX = (current.x + next.x) / 2;
      
      path += ` Q ${controlPointX} ${current.y}, ${controlPointX} ${(current.y + next.y) / 2}`;
      path += ` Q ${controlPointX} ${next.y}, ${next.x} ${next.y}`;
    }
    
    return path;
  };
  
  const linePath = createSmoothPath(points);
  const areaPath = `${linePath} L 100 100 L 0 100 Z`;
  
  // Format time labels - show key time markers
  const getTimeLabel = (hour: number, index: number) => {
    if (index === 0) return `${hour}h`;
    if (hour === 0) return 'Mid';
    if (hour === 6) return '6h';
    if (hour === 12) return '12h';
    if (hour === 18) return '18h';
    return '';
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-card/70 via-card/50 to-card/70 backdrop-blur-xl border border-border/30 rounded-3xl p-4 sm:p-6 animate-fade-in shadow-xl gpu-accelerated">
      {/* Gradient lens effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
      
      <div className="relative z-10">
        <h3 className="text-foreground/70 font-semibold text-xs sm:text-sm mb-4 sm:mb-6 tracking-wide uppercase">
          24-Hour Forecast
        </h3>
        
        <div className="relative w-full" style={{ height: '180px', paddingBottom: '32px' }}>
          <svg 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full gpu-accelerated"
            style={{ willChange: 'transform', transform: 'translateZ(0)', height: 'calc(100% - 32px)' }}
          >
            <defs>
              {/* Smooth gradient for area fill */}
              <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary) / 0.4)" />
                <stop offset="100%" stopColor="hsl(var(--primary) / 0.05)" />
              </linearGradient>
            </defs>
            
            {/* Area fill */}
            <path
              d={areaPath}
              fill="url(#tempGradient)"
              className="transition-all duration-500"
            />
            
            {/* Smooth curve line */}
            <path
              d={linePath}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className="transition-all duration-500"
            />
          </svg>
        
          {/* Temperature points and bubble labels */}
          <div className="absolute inset-0" style={{ height: 'calc(100% - 32px)' }}>
            {points.map((point, index) => {
              const showLabel = labelIndices.includes(index);
              const isAbove = point.y < 50; // Position label opposite to avoid overlap with curve
              
              return (
                <div
                  key={index}
                  className="absolute gpu-accelerated"
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    transform: 'translate(-50%, -50%) translateZ(0)',
                  }}
                >
                  {/* Point circle */}
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary rounded-full shadow-lg" 
                    style={{ 
                      boxShadow: '0 0 10px hsl(var(--primary) / 0.5), 0 0 3px hsl(var(--primary))',
                    }}
                  />
                  
                  {/* Temperature bubble label - only for selected points */}
                  {showLabel && (
                    <div 
                      className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap animate-scale-in"
                      style={{ 
                        [isAbove ? 'bottom' : 'top']: '100%',
                        [isAbove ? 'marginBottom' : 'marginTop']: '8px',
                        animationDelay: `${index * 0.02}s` 
                      }}
                    >
                      <div className="relative bg-white/95 dark:bg-card/95 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-xl border border-white/30">
                        <span className="text-foreground text-[11px] sm:text-sm font-bold">
                          {point.temp}°
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        
          {/* Time labels at bottom */}
          <div className="absolute bottom-0 inset-x-0 flex justify-between text-foreground/50 text-[9px] sm:text-xs font-medium px-1">
            {points.map((point, index) => {
              const label = getTimeLabel(point.hour, index);
              return (
                <div key={index} className={label ? 'opacity-100' : 'opacity-0'}>
                  {label || '.'}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};