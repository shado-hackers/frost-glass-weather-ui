import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { City } from '@/types/weather';

interface SearchBarProps {
  onCitySelect: (city: string) => void;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const SearchBar = ({ onCitySelect }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/city-search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ query })
        });

        const data = await response.json();

        if (response.ok && data?.results && data.results.length > 0) {
          setSuggestions(data.results);
          setIsOpen(true);
        } else {
          setSuggestions([]);
          setIsOpen(false);
        }
      } catch (error) {
        console.error('Error fetching city suggestions:', error);
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setLoading(false);
      }
    }, 500);

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
          placeholder="Search city (min 2 chars)..."
          className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3.5 sm:py-4 bg-card/95 backdrop-blur-xl border border-border/50 rounded-3xl text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-lg"
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-background/98 backdrop-blur-xl border border-border/30 rounded-2xl overflow-hidden z-[100] animate-fade-in max-h-[60vh] overflow-y-auto smooth-scroll shadow-2xl">
          {suggestions.slice(0, 8).map((city, index) => (
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
        <div className="absolute top-full mt-2 w-full bg-background/98 backdrop-blur-xl border border-border/30 rounded-2xl p-3 sm:p-4 text-center text-foreground/70 text-sm shadow-2xl z-[100]">
          Searching...
        </div>
      )}
    </div>
  );
};
