import { useState, useEffect } from 'react';
import { WeatherData } from '@/types/weather';
import { WeatherBackground } from '@/components/WeatherBackground';
import { SearchBar } from '@/components/SearchBar';
import { CurrentWeather } from '@/components/CurrentWeather';
import { HourlyForecast } from '@/components/HourlyForecast';
import { DailyForecast } from '@/components/DailyForecast';
import { DayForecastGraph } from '@/components/DayForecastGraph';
import { WeatherWarningCard } from '@/components/WeatherWarningCard';
import { WeatherRadar } from '@/components/WeatherRadar';
import { CycloneTracker } from '@/components/CycloneTracker';
import { AirQualityCard } from '@/components/AirQualityCard';
import { WindPressureCard } from '@/components/WindPressureCard';
import { DetailsCard } from '@/components/DetailsCard';
import { SunriseSunsetCard } from '@/components/SunriseSunsetCard';
import { MarineWeatherCard } from '@/components/MarineWeatherCard';
import { WeatherTipsCard } from '@/components/WeatherTipsCard';
import { formatLocalDateTime } from '@/utils/timeUtils';
import { useLenis } from '@/hooks/useLenis';
import { toast } from 'sonner';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let currentKeyIndex = 0;

const Index = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentCity, setCurrentCity] = useState('London');
  
  useLenis();

  const fetchWeather = async (city: string, retryCount = 0) => {
    setLoading(true);
    try {
      // Call edge function to protect API keys
      const response = await fetch(`${SUPABASE_URL}/functions/v1/fetch-weather`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ city, keyIndex: currentKeyIndex })
      });

      const data = await response.json();
      
      if (response.status === 429 && data.error === 'retry' && retryCount < 1) {
        currentKeyIndex = data.nextKeyIndex;
        return fetchWeather(city, retryCount + 1);
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch weather data');
      }
      
      setWeatherData(data);
      setCurrentCity(data.location.name);
      toast.success(`Weather updated for ${data.location.name}`);
    } catch (error) {
      console.error('Error fetching weather:', error);
      toast.error('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(`${latitude},${longitude}`);
        },
        () => {
          // Fallback to default city
          fetchWeather('London');
        }
      );
    } else {
      fetchWeather('London');
    }
  }, []);

  const handleCitySelect = (city: any) => {
    // Use coordinates if available for accurate results
    if (city.lat && city.lon) {
      fetchWeather(`${city.lat},${city.lon}`);
    } else if (typeof city === 'string') {
      fetchWeather(city);
    } else {
      fetchWeather(`${city.name}, ${city.country}`);
    }
  };

  if (loading || !weatherData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <WeatherBackground condition="Clear" isDay={true} />
        <div className="relative z-10 text-center px-4">
          <div className="text-4xl mb-4 animate-pulse weather-icon-animated">🌤️</div>
          <div className="text-foreground text-lg sm:text-xl">Loading weather...</div>
        </div>
      </div>
    );
  }

  const currentHour = new Date().getHours();
  const isDay = currentHour >= 6 && currentHour < 20;
  const localDateTime = formatLocalDateTime(weatherData.location.localtime);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <WeatherBackground condition={weatherData.current.condition.text} isDay={isDay} />

      <div className="relative z-10 w-full px-3 sm:px-4 py-4 sm:py-6 max-w-2xl mx-auto gpu-accelerated">
        {/* Header */}
        <div className="flex items-center justify-center mb-4 sm:mb-6 animate-fade-in">
          <div className="w-full max-w-xl">
            <SearchBar onCitySelect={handleCitySelect} />
          </div>
        </div>

        {/* Location & Time */}
        <div className="text-center mb-6 sm:mb-8 animate-slide-up px-2" style={{ animationDelay: '0.05s' }}>
          <h2 className="text-xl sm:text-2xl font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] mb-1.5">
            {weatherData.location.name}, {weatherData.location.country}
          </h2>
          <div className="text-sm sm:text-base text-white/95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] font-medium">
            {localDateTime}
          </div>
        </div>

        {/* Current Weather */}
        <div className="mb-4 sm:mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CurrentWeather data={weatherData} />
        </div>

        {/* Day Forecast Graph */}
        <div className="mb-4 sm:mb-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <DayForecastGraph data={weatherData} />
        </div>

        {/* Cyclone Tracker */}
        <div className="mb-4 sm:mb-6 animate-slide-up" style={{ animationDelay: '0.18s' }}>
          <CycloneTracker data={weatherData} />
        </div>

        {/* Weather Warning Card */}
        <div className="mb-4 sm:mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <WeatherWarningCard data={weatherData} />
        </div>

        {/* Weather Radar Map */}
        <div className="mb-4 sm:mb-6 animate-slide-up" style={{ animationDelay: '0.22s' }}>
          <WeatherRadar data={weatherData} />
        </div>

        {/* Hourly Forecast */}
        <div className="mb-3 sm:mb-4 animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <HourlyForecast data={weatherData} />
        </div>

        {/* Ad Container */}
        <div className="mb-3 sm:mb-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div id="container-770bb196b9da57c7d2a53316b74d3c31"></div>
        </div>

        {/* Air Quality Card */}
        {weatherData.current.air_quality && (
          <div className="mb-3 sm:mb-4 animate-slide-up" style={{ animationDelay: '0.35s' }}>
            <AirQualityCard data={weatherData} />
          </div>
        )}

        {/* Marine Weather Card */}
        <div className="mb-3 sm:mb-4 animate-slide-up" style={{ animationDelay: '0.38s' }}>
          <MarineWeatherCard data={weatherData} />
        </div>

        {/* AI Weather Tips Card */}
        <div className="mb-3 sm:mb-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <WeatherTipsCard data={weatherData} />
        </div>

        {/* Wind & Pressure Card */}
        <div className="mb-3 sm:mb-4 animate-slide-up" style={{ animationDelay: '0.42s' }}>
          <WindPressureCard data={weatherData} />
        </div>

        {/* Details Card */}
        <div className="mb-3 sm:mb-4 animate-slide-up" style={{ animationDelay: '0.47s' }}>
          <DetailsCard data={weatherData} />
        </div>

        {/* Sunrise & Sunset Card */}
        <div className="mb-3 sm:mb-4 animate-slide-up" style={{ animationDelay: '0.52s' }}>
          <SunriseSunsetCard data={weatherData} />
        </div>

        {/* Daily Forecast */}
        <div className="mb-6 sm:mb-8 animate-slide-up" style={{ animationDelay: '0.57s' }}>
          <DailyForecast data={weatherData} />
        </div>
      </div>
    </div>
  );
};

export default Index;
