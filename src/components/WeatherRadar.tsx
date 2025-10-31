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
    satellite: false
  });

  const animationInterval = useRef<NodeJS.Timeout | null>(null);
  const satelliteLayer = useRef<L.TileLayer | null>(null);
  const [satelliteData, setSatelliteData] = useState<any[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const lat = data.location.lat;
    const lon = data.location.lon;

    map.current = L.map(mapContainer.current, {
      zoomControl: true,
      attributionControl: false,
      preferCanvas: true,
      zoomAnimation: false, // Disable for better performance
      fadeAnimation: false,
      markerZoomAnimation: false,
      wheelDebounceTime: 40,
      wheelPxPerZoomLevel: 60
    }).setView([lat, lon], 8);

    // Base layer optimized for performance
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18,
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 2,
      maxNativeZoom: 18,
      className: 'map-tiles'
    }).addTo(map.current);

    // Initialize layers optimized
    radarLayer.current = L.tileLayer('', {
      opacity: 0.7,
      tileSize: 256,
      maxZoom: 18,
      attribution: 'Radar © RainViewer',
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 2,
      className: 'radar-tiles'
    });

    satelliteLayer.current = L.tileLayer('', {
      opacity: 0.6,
      tileSize: 256,
      maxZoom: 18,
      attribution: 'Satellite © RainViewer',
      updateWhenIdle: true,
      keepBuffer: 2,
      className: 'satellite-tiles'
    });

    // Custom visible marker icon
    const customIcon = L.divIcon({
      html: `
        <div style="position: relative;">
          <div style="
            width: 32px;
            height: 32px;
            background: hsl(var(--primary));
            border: 4px solid white;
            border-radius: 50%;
            box-shadow: 0 0 20px rgba(0,0,0,0.4), 0 0 40px hsl(var(--primary) / 0.6);
            animation: marker-pulse 2s ease-in-out infinite;
          "></div>
          <div style="
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 12px solid hsl(var(--primary));
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          "></div>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [32, 44],
      iconAnchor: [16, 44],
      popupAnchor: [0, -44]
    });

    // Add marker for current location
    const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map.current);
    marker.bindPopup(`<b>${data.location.name}</b><br/><span style="font-size: 12px; color: #666;">Current Location</span>`).openPopup();

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

  // Fetch radar and satellite data
  useEffect(() => {
    const fetchRadarData = async () => {
      try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const apiData = await res.json();
        
        // Combine past frames with nowcast for smoother animation
        const allFrames = [...apiData.radar.past, ...(apiData.radar.nowcast || [])];
        setRadarHistory(allFrames);
        
        // Store satellite data
        if (apiData.satellite?.infrared) {
          setSatelliteData(apiData.satellite.infrared);
        }
        
        if (allFrames.length > 0) {
          const latestIndex = apiData.radar.past.length - 1;
          setCurrentFrame(latestIndex);
          updateRadarFrame(latestIndex, allFrames);
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
    if (!history[index]) return;

    const frame = history[index];
    const dt = new Date(frame.time * 1000);

    // Update radar layer with better tile configuration
    if (radarLayer.current && activeLayers.radar) {
      radarLayer.current.setUrl(
        `https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/2/1_1.png`
      );
    }

    setTimestamp(
      dt.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata'
      })
    );
    setCurrentFrame(index);
  };

  // Play/Pause animation with optimized frame rate
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
      }, 400); // Slightly faster for smoother animation
    }
  };

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isPlaying) togglePlay();
    const index = parseInt(e.target.value);
    updateRadarFrame(index);
  };

  // Toggle layers with optimized rendering
  const toggleLayer = (layer: keyof typeof activeLayers) => {
    const newState = !activeLayers[layer];
    setActiveLayers({ ...activeLayers, [layer]: newState });

    if (!map.current) return;

    switch (layer) {
      case 'radar':
        if (radarLayer.current) {
          if (newState) {
            radarLayer.current.addTo(map.current);
            // Reload current frame
            if (radarHistory[currentFrame]) {
              updateRadarFrame(currentFrame);
            }
          } else {
            radarLayer.current.remove();
          }
        }
        break;
      case 'satellite':
        if (satelliteLayer.current) {
          if (newState) {
            // Load latest satellite data
            if (satelliteData.length > 0) {
              const latest = satelliteData[satelliteData.length - 1];
              satelliteLayer.current.setUrl(
                `https://tilecache.rainviewer.com${latest.path}/256/{z}/{x}/{y}/0/0_0.png`
              );
              satelliteLayer.current.addTo(map.current);
            }
          } else {
            satelliteLayer.current.remove();
          }
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
    <div className="relative w-full h-[450px] sm:h-[550px] rounded-3xl overflow-hidden border border-border/20 shadow-xl">
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0 z-10 bg-gray-100 dark:bg-gray-900">
        <style>{`
          .leaflet-tile-container { 
            will-change: transform;
            transition: none !important;
          }
          .leaflet-fade-anim .leaflet-tile { 
            will-change: auto !important;
          }
          .leaflet-zoom-anim .leaflet-zoom-animated { 
            will-change: auto !important;
          }
          .map-tiles, .radar-tiles, .satellite-tiles {
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
          @keyframes marker-pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.15);
              opacity: 0.8;
            }
          }
          .custom-marker {
            background: transparent !important;
            border: none !important;
          }
          .leaflet-popup-content-wrapper {
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          }
        `}</style>
      </div>

      {/* Layer Controls - Styled like reference */}
      <button
        onClick={() => setShowLayers(!showLayers)}
        className="absolute top-4 right-4 z-30 p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-border/20 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        aria-label="Toggle layers"
      >
        <LayersIcon className="w-6 h-6 text-foreground" />
      </button>

      {showLayers && (
        <div className="absolute top-20 right-4 z-30 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-border/20 p-4 min-w-[220px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground text-base">Map Layers</h3>
            <button 
              onClick={() => setShowLayers(false)}
              className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-foreground/60" />
            </button>
          </div>
          
          {Object.entries(activeLayers).map(([key, active]) => (
            <label key={key} className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={active}
                onChange={() => toggleLayer(key as keyof typeof activeLayers)}
                className="w-5 h-5 rounded border-gray-300 accent-primary cursor-pointer"
              />
              <span className="text-sm text-foreground capitalize font-medium">
                {key === 'radar' ? '🌧️ Precipitation Radar' : '🛰️ Satellite Infrared'}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Legend - Always visible */}
      <div className="absolute bottom-20 left-4 z-20 bg-white/95 dark:bg-card/95 backdrop-blur-sm rounded-xl shadow-lg border border-border/20 p-3">
        <div className="text-xs font-semibold text-foreground mb-2">Rain Intensity</div>
        {[
          { color: '#f00', label: 'Extreme (70+ dBZ)' },
          { color: '#d00', label: 'Heavy+ (60 dBZ)' },
          { color: '#e07000', label: 'Heavy (50 dBZ)' },
          { color: '#f8b000', label: 'Moderate (40 dBZ)' },
          { color: '#00d000', label: 'Light (30 dBZ)' }
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

      {/* Playback Controls - Styled like reference */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-3xl z-20">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-border/20 p-4 sm:p-5">
          <div className="flex items-center gap-4 sm:gap-5">
            <button
              onClick={togglePlay}
              className="p-3 sm:p-4 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-all flex-shrink-0 shadow-lg"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </button>
            
            <div className="flex-1 flex flex-col gap-2.5">
              <input
                type="range"
                min="0"
                max={Math.max(0, radarHistory.length - 1)}
                value={currentFrame}
                onChange={handleSliderChange}
                className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary"
                style={{
                  background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(currentFrame / Math.max(1, radarHistory.length - 1)) * 100}%, rgb(229 231 235) ${(currentFrame / Math.max(1, radarHistory.length - 1)) * 100}%, rgb(229 231 235) 100%)`
                }}
              />
              <div className="flex justify-between items-center">
                <div className="text-xs sm:text-sm font-bold text-foreground">
                  {timestamp}
                </div>
                <div className="text-xs text-foreground/60">
                  {currentFrame + 1} / {radarHistory.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};