import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { City } from '@/types/weather';

interface SearchBarProps {
  onCitySelect: (city: string) => void;
}

const WEATHER_API_KEY = '96400e6204fd4ef095123146252610';
const OPENWEATHER_API_KEY = '3e8b8f84de7ce4641b561c5bf51eb269';
const GEMINI_API_KEY = 'AIzaSyBsKdhrTjWEg9LRH9pFDRf4giYYyvqTbdo';

export const SearchBar = ({ onCitySelect }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        // Try primary API first
        const response = await fetch(
          `https://api.weatherapi.com/v1/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}`
        );
        
        if (response.ok) {
          const data = await response.json();
          
          // If we get results, use them
          if (data && data.length > 0) {
            setSuggestions(data);
            setIsOpen(true);
          } else {
            // Try OpenWeatherMap geocoding API for more comprehensive results
            try {
              const geocodeResponse = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=15&appid=${OPENWEATHER_API_KEY}`
              );
              
              if (geocodeResponse.ok) {
                const geocodeData = await geocodeResponse.json();
                
                if (geocodeData && geocodeData.length > 0) {
                  // Convert to City format
                  const convertedData = geocodeData.map((item: any) => ({
                    id: item.lat + item.lon,
                    name: item.name,
                    region: item.state || '',
                    country: item.country,
                    lat: item.lat,
                    lon: item.lon,
                    url: `${item.name}-${item.country}`
                  }));
                  
                  setSuggestions(convertedData);
                  setIsOpen(true);
                } else {
                  // Last resort: Try Gemini AI for hard-to-find locations
                  try {
                    const geminiResponse = await fetch(
                      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          contents: [{
                            parts: [{
                              text: `Find the latitude and longitude for: "${query}". Return ONLY a JSON array with this format: [{"name":"City Name","country":"Country","lat":number,"lon":number}]. If multiple matches, return up to 5. If no match, return empty array.`
                            }]
                          }]
                        })
                      }
                    );
                    
                    if (geminiResponse.ok) {
                      const geminiData = await geminiResponse.json();
                      const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
                      
                      // Extract JSON from AI response
                      const jsonMatch = aiText.match(/\[[\s\S]*\]/);
                      if (jsonMatch) {
                        const locations = JSON.parse(jsonMatch[0]);
                        
                        if (locations && locations.length > 0) {
                          const convertedAiData = locations.map((item: any) => ({
                            id: item.lat + item.lon,
                            name: item.name,
                            region: '',
                            country: item.country,
                            lat: item.lat,
                            lon: item.lon,
                            url: `${item.name}-${item.country}`
                          }));
                          
                          setSuggestions(convertedAiData);
                          setIsOpen(true);
                        } else {
                          setSuggestions([]);
                        }
                      } else {
                        setSuggestions([]);
                      }
                    } else {
                      setSuggestions([]);
                    }
                  } catch (aiError) {
                    console.error('Gemini AI search error:', aiError);
                    setSuggestions([]);
                  }
                }
              } else {
                setSuggestions([]);
              }
            } catch (fallbackError) {
              console.error('Fallback geocoding error:', fallbackError);
              setSuggestions([]);
            }
          }
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching city suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  const handleSelect = (city: City) => {
    onCitySelect(`${city.name}, ${city.country}`);
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-foreground/60 w-4 h-4 sm:w-5 sm:h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder="Search city..."
          className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3.5 sm:py-4 bg-card/95 backdrop-blur-xl border border-border/50 rounded-3xl text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-lg"
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-background/95 backdrop-blur-xl border border-border/30 rounded-2xl overflow-hidden z-50 animate-fade-in max-h-[60vh] overflow-y-auto smooth-scroll shadow-2xl">
          {suggestions.slice(0, 15).map((city, index) => (
            <button
              key={`${city.lat}-${city.lon}-${index}`}
              onClick={() => handleSelect(city)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-start gap-2 sm:gap-3 hover:bg-primary/20 active:bg-primary/30 transition-all text-left border-b border-border/10 last:border-b-0"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate text-sm sm:text-base text-foreground">{city.name}</div>
                <div className="text-xs sm:text-sm text-foreground/70 truncate">
                  {city.region && `${city.region}, `}{city.country}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="absolute top-full mt-2 w-full bg-background/95 backdrop-blur-xl border border-border/30 rounded-2xl p-3 sm:p-4 text-center text-foreground/70 text-sm shadow-2xl">
          Searching...
        </div>
      )}
    </div>
  );
};
