export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_kph: number;
    wind_mph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    precip_mm: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    vis_km: number;
    uv: number;
    air_quality?: {
      pm2_5: number;
      pm10: number;
      us_epa_index: number;
      co?: number;
      no2?: number;
      o3?: number;
      so2?: number;
    };
  };
  forecast: {
    forecastday: Array<{
      date: string;
      date_epoch: number;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        avgtemp_c: number;
        maxwind_kph: number;
        totalprecip_mm: number;
        avghumidity: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        uv: number;
      };
      astro: {
        sunrise: string;
        sunset: string;
        moonrise: string;
        moonset: string;
        moon_phase?: string;
        moon_illumination?: string;
      };
      hour: Array<{
        time: string;
        time_epoch: number;
        temp_c: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        wind_kph: number;
        precip_mm: number;
        humidity: number;
        chance_of_rain: number;
      }>;
    }>;
  };
}

export interface City {
  id?: number;
  name: string;
  region?: string;
  country: string;
  lat: number;
  lon: number;
  url?: string;
}
