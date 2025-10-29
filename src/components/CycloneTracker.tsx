import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import { Navigation, Target, Wind, Zap } from 'lucide-react';

interface CycloneData {
  name: string;
  type: string;
  currentPosition: [number, number];
  trajectory: Array<[number, number]>;
  windSpeed: number;
  windGust: number;
  movementSpeed: number;
  movementDirection: string;
  userLocation: [number, number];
}

interface CycloneTrackerProps {
  map: L.Map | null;
  userLocation: [number, number];
}

export const CycloneTracker = ({ map, userLocation }: CycloneTrackerProps) => {
  const [cycloneData, setCycloneData] = useState<CycloneData | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [distance, setDistance] = useState<number>(0);
  const [timeToReach, setTimeToReach] = useState<string>('');
  const trajectoryLayerRef = useRef<L.LayerGroup | null>(null);

  // Mock cyclone data - Replace with real API in production
  useEffect(() => {
    const mockCyclone: CycloneData = {
      name: 'MONTHA',
      type: 'Cyclonic Storm',
      currentPosition: [15.2, 82.6],
      trajectory: [
        [13.0, 85.0],
        [13.5, 84.5],
        [14.0, 83.8],
        [15.2, 82.6],
        [16.5, 81.5],
        [18.0, 80.0],
        [19.5, 79.0]
      ],
      windSpeed: 83,
      windGust: 102,
      movementSpeed: 15,
      movementDirection: 'NW',
      userLocation
    };

    setCycloneData(mockCyclone);
  }, [userLocation]);

  // Calculate distance and time
  useEffect(() => {
    if (!cycloneData || !map) return;

    const from = L.latLng(cycloneData.currentPosition[0], cycloneData.currentPosition[1]);
    const to = L.latLng(userLocation[0], userLocation[1]);
    const distanceInMeters = from.distanceTo(to);
    const distanceInKm = distanceInMeters / 1000;
    
    setDistance(distanceInKm);
    
    // Calculate time to reach
    if (cycloneData.movementSpeed > 0) {
      const hours = distanceInKm / cycloneData.movementSpeed;
      if (hours < 24) {
        setTimeToReach(`~${Math.round(hours)} hours`);
      } else {
        setTimeToReach(`~${Math.round(hours / 24)} days`);
      }
    }
  }, [cycloneData, userLocation, map]);

  // Draw trajectory path on map
  useEffect(() => {
    if (!map || !cycloneData) return;

    // Remove existing trajectory
    if (trajectoryLayerRef.current) {
      map.removeLayer(trajectoryLayerRef.current);
    }

    const trajectoryGroup = L.layerGroup();

    // Draw dashed path line
    const pathLine = L.polyline(cycloneData.trajectory, {
      color: '#ffffff',
      weight: 3,
      opacity: 0.8,
      dashArray: '10, 15',
      className: 'cyclone-path'
    });
    trajectoryGroup.addLayer(pathLine);

    // Add markers for each point
    cycloneData.trajectory.forEach((point, index) => {
      const isPast = index < cycloneData.trajectory.indexOf(cycloneData.currentPosition);
      const isCurrent = point[0] === cycloneData.currentPosition[0] && 
                       point[1] === cycloneData.currentPosition[1];
      const isFuture = index > cycloneData.trajectory.indexOf(cycloneData.currentPosition);

      let markerIcon;
      
      if (isCurrent) {
        // Current position - animated pulsing marker
        markerIcon = L.divIcon({
          html: `
            <div class="relative">
              <div class="absolute inset-0 w-8 h-8 -translate-x-1/2 -translate-y-1/2 
                          bg-red-500 rounded-full animate-ping opacity-75"></div>
              <div class="relative w-8 h-8 -translate-x-1/2 -translate-y-1/2 
                          bg-red-600 border-4 border-white rounded-full shadow-2xl
                          flex items-center justify-center">
                <svg class="w-4 h-4 text-white animate-spin-slow" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2z"/>
                  <path d="M16.24 7.76A5.99 5.99 0 0 0 12 6v6l-4.24 4.24" fill="white"/>
                </svg>
              </div>
            </div>
          `,
          className: 'cyclone-current-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
      } else if (isPast) {
        // Past positions - small white circles
        markerIcon = L.divIcon({
          html: `<div class="w-3 h-3 bg-white/70 border-2 border-blue-400 rounded-full shadow-md"></div>`,
          className: 'cyclone-past-marker',
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });
      } else if (isFuture) {
        // Future positions - hollow circles
        markerIcon = L.divIcon({
          html: `<div class="w-4 h-4 border-2 border-white/60 rounded-full shadow-md"></div>`,
          className: 'cyclone-future-marker',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
      }

      if (markerIcon) {
        const marker = L.marker(point, { icon: markerIcon });
        trajectoryGroup.addLayer(marker);
      }
    });

    trajectoryLayerRef.current = trajectoryGroup;
    trajectoryGroup.addTo(map);

    // Fit map to show trajectory
    const bounds = L.latLngBounds(cycloneData.trajectory);
    map.fitBounds(bounds, { padding: [50, 50] });

    return () => {
      if (trajectoryLayerRef.current) {
        map.removeLayer(trajectoryLayerRef.current);
      }
    };
  }, [map, cycloneData]);

  if (!cycloneData) return null;

  return (
    <>
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .cyclone-path {
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6));
        }
      `}</style>

      {/* Cyclone Info Card - Bottom Fixed */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[1001] w-[95%] max-w-lg">
        <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)`,
              backgroundSize: '100px 100px'
            }}></div>
          </div>

          {/* Header */}
          <div className="relative z-10 px-4 py-3 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 
                              flex items-center justify-center">
                  <Wind className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/90">Live Cyclone Tracker</h3>
                  <p className="text-xs text-white/60">
                    {new Date().toLocaleTimeString('en-IN', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      timeZone: 'Asia/Kolkata'
                    })}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                <svg 
                  className={`w-5 h-5 text-white/70 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Collapsible Content */}
          <div 
            className={`relative z-10 overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="p-4 space-y-4">
              {/* Storm Name & Type */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 
                              border border-blue-400/30 flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-8 h-8 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">{cycloneData.name}</h2>
                  <p className="text-sm text-white/70">{cycloneData.type}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Movement */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Navigation className="w-4 h-4 text-blue-300" />
                    <span className="text-xs text-white/60 uppercase tracking-wider">Movement</span>
                  </div>
                  <p className="text-lg font-bold text-white">{cycloneData.movementDirection}</p>
                  <p className="text-xs text-white/60">{cycloneData.movementSpeed} km/h</p>
                </div>

                {/* Distance */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-orange-300" />
                    <span className="text-xs text-white/60 uppercase tracking-wider">Distance</span>
                  </div>
                  <p className="text-lg font-bold text-white">{distance.toFixed(1)} km</p>
                  <p className="text-xs text-white/60">{timeToReach}</p>
                </div>

                {/* Wind Speed */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Wind className="w-4 h-4 text-green-300" />
                    <span className="text-xs text-white/60 uppercase tracking-wider">Wind</span>
                  </div>
                  <p className="text-lg font-bold text-white">{cycloneData.windSpeed} km/h</p>
                  <p className="text-xs text-white/60">Sustained</p>
                </div>

                {/* Gust */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-yellow-300" />
                    <span className="text-xs text-white/60 uppercase tracking-wider">Max Gust</span>
                  </div>
                  <p className="text-lg font-bold text-white">{cycloneData.windGust} km/h</p>
                  <p className="text-xs text-white/60">Peak</p>
                </div>
              </div>

              {/* Current Position */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs text-white/60 uppercase tracking-wider">Current Position</span>
                </div>
                <p className="text-sm font-semibold text-white">
                  {cycloneData.currentPosition[0].toFixed(2)}° N, {cycloneData.currentPosition[1].toFixed(2)}° E
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
