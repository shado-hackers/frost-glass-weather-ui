import { useState, useEffect } from 'react';
import { Menu, MapPin, Grid } from 'lucide-react';
import { WeatherData } from '@/types/weather';
import { WeatherBackground } from '@/components/WeatherBackground';
import { SearchBar } from '@/components/SearchBar';
import { CurrentWeather, WeatherDetails } from '@/components/CurrentWeather';
import { HourlyForecast } from '@/components/HourlyForecast';
import { DailyForecast } from '@/components/DailyForecast';
import { AdditionalInfo } from '@/components/AdditionalInfo';
import { toast } from 'sonner';

const API_KEY = '96400e6204fd4ef095123146252610';

const Index = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentCity, setCurrentCity] = useState('London');

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
        <div className="relative z-10 text-center">
          <div className="text-4xl mb-4 animate-pulse">🌤️</div>
          <div className="text-foreground text-xl">Loading weather...</div>
        </div>
      </div>
    );
  }

  const currentHour = new Date().getHours();
  const isDay = currentHour >= 6 && currentHour < 20;
  const localTime = new Date(weatherData.location.localtime);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <WeatherBackground condition={weatherData.current.condition.text} isDay={isDay} />

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <button className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 transition-all">
            <Menu className="w-6 h-6 text-foreground" />
          </button>
          
          <div className="flex-1 mx-4">
            <SearchBar onCitySelect={handleCitySelect} />
          </div>

          <button className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 transition-all">
            <Grid className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Location & Time */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-foreground/90 mb-1">
            <MapPin className="w-5 h-5" />
            <h2 className="text-2xl font-medium">{weatherData.location.name}</h2>
          </div>
          <div className="text-foreground/70">
            {localTime.toLocaleDateString('en-US', { weekday: 'short' })} {localTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
        </div>

        {/* Current Weather */}
        <div className="mb-6">
          <CurrentWeather data={weatherData} />
        </div>

        {/* Next 2 hours forecast link */}
        <div className="text-center mb-6 animate-fade-in">
          <button className="text-secondary hover:text-secondary/80 transition-colors">
            Next 2 hours forecast →
          </button>
        </div>

        {/* Hourly Forecast */}
        <div className="mb-4">
          <HourlyForecast data={weatherData} />
        </div>

        {/* Weather Details */}
        <div className="mb-4">
          <WeatherDetails data={weatherData} />
        </div>

        {/* Additional Info */}
        <div className="mb-4">
          <AdditionalInfo data={weatherData} />
        </div>

        {/* Daily Forecast */}
        <div className="mb-8">
          <DailyForecast data={weatherData} />
        </div>
      </div>
    </div>
  );
};

export default Index;
