export const getWeatherGradient = (condition: string, isDay: boolean): string => {
  const conditionLower = condition.toLowerCase();
  
  // Night backgrounds
  if (!isDay) {
    if (conditionLower.includes('clear')) {
      return 'from-[hsl(234,50%,20%)] via-[hsl(250,45%,25%)] to-[hsl(263,50%,25%)]';
    }
    if (conditionLower.includes('storm') || conditionLower.includes('thunder')) {
      return 'from-[hsl(0,0%,4%)] via-[hsl(0,0%,11%)] to-[hsl(0,0%,17%)]';
    }
    if (conditionLower.includes('snow') || conditionLower.includes('blizzard')) {
      return 'from-[hsl(210,18%,15%)] via-[hsl(210,16%,24%)] to-[hsl(210,15%,29%)]';
    }
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return 'from-[hsl(213,30%,20%)] via-[hsl(213,25%,28%)] to-[hsl(213,20%,35%)]';
    }
    if (conditionLower.includes('fog') || conditionLower.includes('mist') || conditionLower.includes('haze')) {
      return 'from-[hsl(210,18%,15%)] via-[hsl(210,16%,24%)] to-[hsl(210,15%,29%)]';
    }
    if (conditionLower.includes('smoke') || conditionLower.includes('dust') || conditionLower.includes('sand')) {
      return 'from-[hsl(0,0%,13%)] via-[hsl(0,0%,26%)] to-[hsl(0,0%,38%)]';
    }
    return 'from-[hsl(220,30%,25%)] via-[hsl(230,25%,30%)] to-[hsl(240,20%,35%)]';
  }
  
  // Day backgrounds
  if (conditionLower.includes('storm') || conditionLower.includes('thunder')) {
    return 'from-[hsl(210,14%,27%)] via-[hsl(210,13%,33%)] to-[hsl(210,15%,40%)]';
  }
  
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return 'from-[hsl(213,38%,45%)] via-[hsl(213,35%,53%)] to-[hsl(213,38%,60%)]';
  }
  
  if (conditionLower.includes('snow') || conditionLower.includes('blizzard')) {
    return 'from-[hsl(231,26%,95%)] via-[hsl(0,0%,100%)] to-[hsl(0,0%,96%)]';
  }
  
  if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
    return 'from-[hsl(200,5%,93%)] via-[hsl(200,6%,85%)] to-[hsl(200,7%,74%)]';
  }
  
  if (conditionLower.includes('smoke')) {
    return 'from-[hsl(204,13%,48%)] via-[hsl(204,12%,56%)] to-[hsl(200,10%,71%)]';
  }
  
  if (conditionLower.includes('haze')) {
    return 'from-[hsl(200,10%,71%)] via-[hsl(200,6%,85%)] to-[hsl(200,5%,93%)]';
  }
  
  if (conditionLower.includes('dust') || conditionLower.includes('sand')) {
    return 'from-[hsl(24,13%,89%)] via-[hsl(23,8%,80%)] to-[hsl(23,9%,71%)]';
  }
  
  if (conditionLower.includes('ash')) {
    return 'from-[hsl(0,0%,62%)] via-[hsl(0,0%,46%)] to-[hsl(0,0%,38%)]';
  }
  
  if (conditionLower.includes('squall') || conditionLower.includes('tornado')) {
    return 'from-[hsl(200,12%,43%)] via-[hsl(200,11%,51%)] to-[hsl(204,13%,48%)]';
  }
  
  if (conditionLower.includes('cloudy') && conditionLower.includes('partly')) {
    return 'from-[hsl(199,89%,65%)] via-[hsl(199,85%,56%)] to-[hsl(199,89%,48%)]';
  }
  
  if (conditionLower.includes('cloudy') || conditionLower.includes('overcast')) {
    return 'from-[hsl(215,25%,50%)] via-[hsl(215,22%,45%)] to-[hsl(215,20%,40%)]';
  }
  
  // Clear/Sunny day
  return 'from-[hsl(199,100%,64%)] via-[hsl(199,89%,71%)] to-[hsl(60,100%,74%)]';
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

export const formatToISTTime = (timeString: string): string => {
  const date = new Date(timeString);
  
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
  const istTime = new Date(utcTime + istOffset);
  
  // Format as 12-hour with AM/PM
  let hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  
  return `${hours}:${minutesStr} ${ampm}`;
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
