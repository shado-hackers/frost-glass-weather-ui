import sunIcon from '@/assets/weather/sun.png';
import sunCloudIcon from '@/assets/weather/sun-cloud.png';
import sunnyCloudIcon from '@/assets/weather/sunny-cloud.png';
import rainIcon from '@/assets/weather/rain.png';
import thunderIcon from '@/assets/weather/thunder.png';
import thunderstormIcon from '@/assets/weather/thunderstorm.png';
import cloudsDayIcon from '@/assets/weather/clouds-day.webp';
import cloudsNightIcon from '@/assets/weather/clouds-night.webp';
import fogIcon from '@/assets/weather/fog.webp';
import hazyIcon from '@/assets/weather/hazy.webp';

export const getWeatherIconImage = (code: number, isDay: boolean): string => {
  // Map weather codes to icon images
  const iconMap: { [key: number]: { day: string; night: string } } = {
    // Clear
    1000: { day: sunIcon, night: cloudsNightIcon },
    // Partly cloudy
    1003: { day: sunCloudIcon, night: cloudsNightIcon },
    // Cloudy
    1006: { day: cloudsDayIcon, night: cloudsNightIcon },
    1009: { day: cloudsDayIcon, night: cloudsNightIcon },
    // Fog/Mist
    1030: { day: fogIcon, night: fogIcon },
    1135: { day: fogIcon, night: fogIcon },
    1147: { day: fogIcon, night: fogIcon },
    // Patchy rain
    1063: { day: rainIcon, night: rainIcon },
    1150: { day: rainIcon, night: rainIcon },
    1153: { day: rainIcon, night: rainIcon },
    1168: { day: rainIcon, night: rainIcon },
    1171: { day: rainIcon, night: rainIcon },
    1180: { day: rainIcon, night: rainIcon },
    1183: { day: rainIcon, night: rainIcon },
    1186: { day: rainIcon, night: rainIcon },
    1189: { day: rainIcon, night: rainIcon },
    1192: { day: rainIcon, night: rainIcon },
    1195: { day: rainIcon, night: rainIcon },
    1198: { day: rainIcon, night: rainIcon },
    1201: { day: rainIcon, night: rainIcon },
    1240: { day: rainIcon, night: rainIcon },
    1243: { day: rainIcon, night: rainIcon },
    1246: { day: rainIcon, night: rainIcon },
    // Snow
    1066: { day: sunnyCloudIcon, night: cloudsNightIcon },
    1069: { day: sunnyCloudIcon, night: cloudsNightIcon },
    1072: { day: sunnyCloudIcon, night: cloudsNightIcon },
    1114: { day: sunnyCloudIcon, night: cloudsNightIcon },
    1117: { day: sunnyCloudIcon, night: cloudsNightIcon },
    1204: { day: sunnyCloudIcon, night: cloudsNightIcon },
    1207: { day: sunnyCloudIcon, night: cloudsNightIcon },
    1210: { day: sunnyCloudIcon, night: cloudsNightIcon },
    1213: { day: sunnyCloudIcon, night: cloudsNightIcon },
    1216: { day: sunnyCloudIcon, night: cloudsNightIcon },
    1219: { day: sunnyCloudIcon, night: cloudsNightIcon },
    1222: { day: sunnyCloudIcon, night: cloudsNightIcon },
    1225: { day: sunnyCloudIcon, night: cloudsNightIcon },
    1237: { day: sunnyCloudIcon, night: cloudsNightIcon },
    1249: { day: sunnyCloudIcon, night: cloudsNightIcon },
    1252: { day: sunnyCloudIcon, night: cloudsNightIcon },
    1255: { day: sunnyCloudIcon, night: cloudsNightIcon },
    1258: { day: sunnyCloudIcon, night: cloudsNightIcon },
    1261: { day: sunnyCloudIcon, night: cloudsNightIcon },
    1264: { day: sunnyCloudIcon, night: cloudsNightIcon },
    // Thunderstorm
    1087: { day: thunderstormIcon, night: thunderstormIcon },
    1273: { day: thunderstormIcon, night: thunderstormIcon },
    1276: { day: thunderstormIcon, night: thunderstormIcon },
    1279: { day: thunderstormIcon, night: thunderstormIcon },
    1282: { day: thunderstormIcon, night: thunderstormIcon },
  };
  
  const icon = iconMap[code];
  if (icon) {
    return isDay ? icon.day : icon.night;
  }
  
  // Default to partly cloudy
  return isDay ? sunCloudIcon : cloudsNightIcon;
};
