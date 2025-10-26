export const getWeatherGradient = (condition: string, isDay: boolean): string => {
  const conditionLower = condition.toLowerCase();
  
  if (!isDay) {
    if (conditionLower.includes('clear')) {
      return 'from-[hsl(234,50%,20%)] via-[hsl(250,45%,25%)] to-[hsl(263,50%,25%)]';
    }
    return 'from-[hsl(220,30%,25%)] via-[hsl(230,25%,30%)] to-[hsl(240,20%,35%)]';
  }
  
  if (conditionLower.includes('storm') || conditionLower.includes('thunder')) {
    return 'from-[hsl(243,75%,59%)] via-[hsl(250,70%,55%)] to-[hsl(262,83%,58%)]';
  }
  
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return 'from-[hsl(220,60%,50%)] via-[hsl(230,55%,45%)] to-[hsl(240,60%,50%)]';
  }
  
  if (conditionLower.includes('snow') || conditionLower.includes('blizzard')) {
    return 'from-[hsl(199,89%,94%)] via-[hsl(199,80%,85%)] to-[hsl(199,89%,81%)]';
  }
  
  if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
    return 'from-[hsl(210,20%,60%)] via-[hsl(210,18%,55%)] to-[hsl(210,20%,50%)]';
  }
  
  if (conditionLower.includes('hazy') || conditionLower.includes('dust') || conditionLower.includes('sand')) {
    return 'from-[hsl(30,10%,60%)] via-[hsl(30,12%,52%)] to-[hsl(30,15%,45%)]';
  }
  
  if (conditionLower.includes('cloudy') && conditionLower.includes('partly')) {
    return 'from-[hsl(199,89%,65%)] via-[hsl(199,85%,56%)] to-[hsl(199,89%,48%)]';
  }
  
  if (conditionLower.includes('cloudy') || conditionLower.includes('overcast')) {
    return 'from-[hsl(215,25%,50%)] via-[hsl(215,22%,45%)] to-[hsl(215,20%,40%)]';
  }
  
  // Clear/Sunny day
  return 'from-[hsl(214,100%,70%)] via-[hsl(214,95%,60%)] to-[hsl(214,100%,50%)]';
};

export const getWeatherIcon = (code: number, isDay: boolean): string => {
  // Map weather codes to icon names
  const iconMap: { [key: number]: string } = {
    1000: isDay ? '☀️' : '🌙',
    1003: isDay ? '⛅' : '☁️',
    1006: '☁️',
    1009: '☁️',
    1030: '🌫️',
    1063: '🌦️',
    1066: '🌨️',
    1069: '🌨️',
    1072: '🌧️',
    1087: '⛈️',
    1114: '🌨️',
    1117: '❄️',
    1135: '🌫️',
    1147: '🌫️',
    1150: '🌦️',
    1153: '🌦️',
    1168: '🌧️',
    1171: '🌧️',
    1180: '🌦️',
    1183: '🌧️',
    1186: '🌧️',
    1189: '🌧️',
    1192: '🌧️',
    1195: '🌧️',
    1198: '🌧️',
    1201: '🌧️',
    1204: '🌨️',
    1207: '🌨️',
    1210: '🌨️',
    1213: '🌨️',
    1216: '🌨️',
    1219: '🌨️',
    1222: '❄️',
    1225: '❄️',
    1237: '🧊',
    1240: '🌦️',
    1243: '🌧️',
    1246: '🌧️',
    1249: '🌨️',
    1252: '🌨️',
    1255: '🌨️',
    1258: '❄️',
    1261: '🧊',
    1264: '🧊',
    1273: '⛈️',
    1276: '⛈️',
    1279: '⛈️',
    1282: '⛈️',
  };
  
  return iconMap[code] || '🌡️';
};

export const getAQILabel = (index: number): { label: string; color: string } => {
  if (index === 1) return { label: 'Good', color: 'text-green-400' };
  if (index === 2) return { label: 'Moderate', color: 'text-yellow-400' };
  if (index === 3) return { label: 'Unhealthy (Sensitive)', color: 'text-orange-400' };
  if (index === 4) return { label: 'Unhealthy', color: 'text-red-400' };
  if (index === 5) return { label: 'Very Unhealthy', color: 'text-purple-400' };
  if (index === 6) return { label: 'Hazardous', color: 'text-red-600' };
  return { label: 'Unknown', color: 'text-muted-foreground' };
};

export const getUVLabel = (uv: number): { label: string; color: string } => {
  if (uv <= 2) return { label: 'Low', color: 'text-green-400' };
  if (uv <= 5) return { label: 'Moderate', color: 'text-yellow-400' };
  if (uv <= 7) return { label: 'High', color: 'text-orange-400' };
  if (uv <= 10) return { label: 'Very High', color: 'text-red-400' };
  return { label: 'Extreme', color: 'text-purple-400' };
};

export const formatTime = (timeString: string): string => {
  const time = new Date(timeString);
  return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
};
