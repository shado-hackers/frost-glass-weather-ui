import { useState, useEffect } from 'react';
import { WeatherData } from '@/types/weather';
import { WeatherBackground } from '@/components/WeatherBackground';
import { SearchBar } from '@/components/SearchBar';
import { CurrentWeather } from '@/components/CurrentWeather';
import { HourlyForecast } from '@/components/HourlyForecast';
import { DailyForecast } from '@/components/DailyForecast';
import { DayForecastGraph } from '@/components/DayForecastGraph';
import { AirQualityCard } from '@/components/AirQualityCard';
import { WindPressureCard } from '@/components/WindPressureCard';
import { DetailsCard } from '@/components/DetailsCard';
import { SunriseSunsetCard } from '@/components/SunriseSunsetCard';
import { formatToIST } from '@/utils/timeUtils';
import { useLenis } from '@/hooks/useLenis';
import { toast } from 'sonner';

const API_KEY = '96400e6204fd4ef095123146252610';

const Index = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentCity, setCurrentCity] = useState('London');
  
  useLenis();

  const fetchWeather = async (city: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=7&aqi=yes&alerts=no`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
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

  const handleCitySelect = (city: string) => {
    fetchWeather(city);
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
  const { day, time } = formatToIST(weatherData.location.localtime);

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
          <h2 className="text-xl sm:text-2xl font-medium text-foreground/90 mb-1">
            {weatherData.location.name}
          </h2>
          <div className="text-sm sm:text-base text-foreground/70">
            {day} {time}
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

        {/* Hourly Forecast */}
        <div className="mb-3 sm:mb-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <HourlyForecast data={weatherData} />
        </div>

        {/* Ad Container */}
        <div className="mb-3 sm:mb-4 animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <div id="container-770bb196b9da57c7d2a53316b74d3c31"></div>
        </div>

        {/* Air Quality Card */}
        {weatherData.current.air_quality && (
          <div className="mb-3 sm:mb-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <AirQualityCard data={weatherData} />
          </div>
        )}

        {/* Wind & Pressure Card */}
        <div className="mb-3 sm:mb-4 animate-slide-up" style={{ animationDelay: '0.35s' }}>
          <WindPressureCard data={weatherData} />
        </div>

        {/* Details Card */}
        <div className="mb-3 sm:mb-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <DetailsCard data={weatherData} />
        </div>

        {/* Sunrise & Sunset Card */}
        <div className="mb-3 sm:mb-4 animate-slide-up" style={{ animationDelay: '0.45s' }}>
          <SunriseSunsetCard data={weatherData} />
        </div>

        {/* Daily Forecast */}
        <div className="mb-6 sm:mb-8 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <DailyForecast data={weatherData} />
        </div>
      </div>
    </div>
  );
};

export default Index;
