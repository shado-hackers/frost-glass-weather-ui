import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Play, Pause, Layers as LayersIcon, X } from 'lucide-react';
import { WeatherData } from '@/types/weather';

interface WeatherRadarProps {
  data: WeatherData;
}

export const WeatherRadar = ({ data }: WeatherRadarProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const radarLayer = useRef<L.TileLayer | null>(null);
  
  const [radarHistory, setRadarHistory] = useState<any[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timestamp, setTimestamp] = useState('Loading...');
  const [showLayers, setShowLayers] = useState(false);
  const [activeLayers, setActiveLayers] = useState({
    radar: true,
    temperature: false,
    wind: false,
    cloud: false
  });

  const animationInterval = useRef<NodeJS.Timeout | null>(null);
  const tempLayer = useRef<L.TileLayer | null>(null);
  const windLayer = useRef<L.TileLayer | null>(null);
  const cloudLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const lat = data.location.lat;
    const lon = data.location.lon;

    map.current = L.map(mapContainer.current, {
      zoomControl: true,
      attributionControl: true
    }).setView([lat, lon], 8);

    // Base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map.current);

    // Initialize layers
    radarLayer.current = L.tileLayer('', {
      opacity: 0.7,
      attribution: 'Radar © RainViewer'
    });

    tempLayer.current = L.tileLayer(
      'https://tile.open-meteo.com/map/temperature_2m/{z}/{x}/{y}.png',
      { opacity: 0.6 }
    );

    windLayer.current = L.tileLayer(
      'https://tile.open-meteo.com/map/wind_speed_10m/{z}/{x}/{y}.png',
      { opacity: 0.6 }
    );

    cloudLayerRef.current = L.tileLayer(
      'https://tile.open-meteo.com/map/cloud_cover/{z}/{x}/{y}.png',
      { opacity: 0.5 }
    );

    // Add marker for current location
    const marker = L.marker([lat, lon]).addTo(map.current);
    marker.bindPopup(`<b>${data.location.name}</b>`).openPopup();

    // Add default radar layer
    if (radarLayer.current) {
      radarLayer.current.addTo(map.current);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [data.location]);

  // Fetch radar data
  useEffect(() => {
    const fetchRadarData = async () => {
      try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const apiData = await res.json();
        setRadarHistory(apiData.radar.past);
        if (apiData.radar.past.length > 0) {
          const latestIndex = apiData.radar.past.length - 1;
          setCurrentFrame(latestIndex);
          updateRadarFrame(latestIndex, apiData.radar.past);
        }
      } catch (error) {
        console.error('Failed to fetch radar data:', error);
        setTimestamp('Error loading radar');
      }
    };

    fetchRadarData();
    const interval = setInterval(fetchRadarData, 10 * 60 * 1000); // Refresh every 10 min

    return () => clearInterval(interval);
  }, []);

  // Update radar frame
  const updateRadarFrame = (index: number, history = radarHistory) => {
    if (!history[index] || !radarLayer.current) return;

    const frame = history[index];
    const dt = new Date(frame.time * 1000);

    radarLayer.current.setUrl(
      `https://tilecache.rainviewer.com/v2/radar/${frame.path}/256/{z}/{x}/{y}/2/1_1.png`
    );

    setTimestamp(
      dt.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata'
      })
    );
    setCurrentFrame(index);
  };

  // Play/Pause animation
  const togglePlay = () => {
    if (isPlaying) {
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
        animationInterval.current = null;
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      animationInterval.current = setInterval(() => {
        setCurrentFrame((prev) => {
          const next = prev + 1 >= radarHistory.length ? 0 : prev + 1;
          updateRadarFrame(next);
          return next;
        });
      }, 500);
    }
  };

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isPlaying) togglePlay();
    const index = parseInt(e.target.value);
    updateRadarFrame(index);
  };

  // Toggle layers
  const toggleLayer = (layer: keyof typeof activeLayers) => {
    const newState = !activeLayers[layer];
    setActiveLayers({ ...activeLayers, [layer]: newState });

    if (!map.current) return;

    switch (layer) {
      case 'radar':
        if (radarLayer.current) {
          newState ? radarLayer.current.addTo(map.current) : radarLayer.current.remove();
        }
        break;
      case 'temperature':
        if (tempLayer.current) {
          newState ? tempLayer.current.addTo(map.current) : tempLayer.current.remove();
        }
        break;
      case 'wind':
        if (windLayer.current) {
          newState ? windLayer.current.addTo(map.current) : windLayer.current.remove();
        }
        break;
      case 'cloud':
        if (cloudLayerRef.current) {
          newState ? cloudLayerRef.current.addTo(map.current) : cloudLayerRef.current.remove();
        }
        break;
    }
  };

  useEffect(() => {
    return () => {
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[400px] sm:h-[500px] rounded-3xl overflow-hidden border border-border/20 shadow-xl">
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0 z-10" />

      {/* Layer Controls */}
      <button
        onClick={() => setShowLayers(!showLayers)}
        className="absolute top-4 right-4 z-30 p-3 bg-white dark:bg-card rounded-xl shadow-lg border border-border/20 hover:bg-gray-50 dark:hover:bg-card/80 transition-all"
      >
        <LayersIcon className="w-5 h-5 text-foreground" />
      </button>

      {showLayers && (
        <div className="absolute top-16 right-4 z-30 bg-white dark:bg-card rounded-xl shadow-xl border border-border/20 p-4 min-w-[200px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground text-sm">Layers</h3>
            <button onClick={() => setShowLayers(false)}>
              <X className="w-4 h-4 text-foreground/60" />
            </button>
          </div>
          
          {Object.entries(activeLayers).map(([key, active]) => (
            <label key={key} className="flex items-center gap-2 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={() => toggleLayer(key as keyof typeof activeLayers)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-foreground capitalize">{key}</span>
            </label>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-20 left-4 z-20 bg-white/95 dark:bg-card/95 backdrop-blur-sm rounded-xl shadow-lg border border-border/20 p-3 hidden sm:block">
        <div className="text-xs font-semibold text-foreground mb-2">Rain Intensity</div>
        {[
          { color: '#f00', label: 'Extreme (70+ dBZ)' },
          { color: '#d00', label: 'Heavy+ (60 dBZ)' },
          { color: '#e07000', label: 'Heavy (50 dBZ)' },
          { color: '#f8b000', label: 'Moderate (40 dBZ)' },
          { color: '#00d000', label: 'Light (30 dBZ)' },
          { color: '#009000', label: 'Very Light (20 dBZ)' }
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 mb-1">
            <div
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-foreground/80">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Playback Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-2xl z-20">
        <div className="bg-white/95 dark:bg-card/95 backdrop-blur-sm rounded-xl shadow-lg border border-border/20 p-3 sm:p-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={togglePlay}
              className="p-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-all flex-shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>
            
            <div className="flex-1 flex flex-col gap-2">
              <input
                type="range"
                min="0"
                max={Math.max(0, radarHistory.length - 1)}
                value={currentFrame}
                onChange={handleSliderChange}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="text-center text-xs sm:text-sm font-medium text-foreground">
                {timestamp}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};