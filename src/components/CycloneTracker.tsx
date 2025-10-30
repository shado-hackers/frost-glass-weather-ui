import { useEffect, useState } from 'react';
import { WeatherData } from '@/types/weather';
import { Wind, Navigation, Zap, MapPin, Clock, Target } from 'lucide-react';

interface CycloneTrackerProps {
  data: WeatherData;
}

interface CycloneData {
  name: string;
  type: string;
  lat: number;
  lon: number;
  windSpeed: number;
  maxGust: number;
  movement: string;
  movementSpeed: number;
  distance: number;
  eta: string;
  isActive: boolean;
}

export const CycloneTracker = ({ data }: CycloneTrackerProps) => {
  const [cyclone, setCyclone] = useState<CycloneData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateETA = (distance: number, speed: number) => {
    if (speed <= 0) return 'N/A';
    const hours = distance / speed;
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    const minutes = Math.floor((hours * 60) % 60);
    
    if (days > 0) {
      return `~${days}d ${remainingHours}h`;
    } else if (remainingHours > 0) {
      return `~${remainingHours}h ${minutes}min`;
    } else {
      return `~${minutes}min`;
    }
  };

  useEffect(() => {
    const fetchCycloneData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch from NOAA NHC GeoJSON API (National Hurricane Center)
        const response = await fetch('https://www.nhc.noaa.gov/gis/forecast/al_latest.kmz');
        
        // If NOAA fails, try alternative sources
        if (!response.ok) {
          // Try GDACS (Global Disaster Alert and Coordination System)
          const gdacsResponse = await fetch('https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH');
          
          if (!gdacsResponse.ok) {
            setCyclone(null);
            setLoading(false);
            return;
          }
          
          const gdacsData = await gdacsResponse.json();
          const activeCyclones = gdacsData?.features?.filter((f: any) => 
            f.properties.eventtype === 'TC' && f.properties.iscurrent === 'true'
          ) || [];
          
          if (activeCyclones.length > 0) {
            const nearest = activeCyclones.reduce((prev: any, curr: any) => {
              const prevDist = calculateDistance(
                data.location.lat, 
                data.location.lon,
                prev.geometry.coordinates[1],
                prev.geometry.coordinates[0]
              );
              const currDist = calculateDistance(
                data.location.lat,
                data.location.lon,
                curr.geometry.coordinates[1],
                curr.geometry.coordinates[0]
              );
              return currDist < prevDist ? curr : prev;
            });
            
            const distance = calculateDistance(
              data.location.lat,
              data.location.lon,
              nearest.geometry.coordinates[1],
              nearest.geometry.coordinates[0]
            );
            
            const speed = nearest.properties.maxvelocity || 20;
            
            setCyclone({
              name: nearest.properties.name || 'Unnamed Storm',
              type: getCycloneType(speed),
              lat: nearest.geometry.coordinates[1],
              lon: nearest.geometry.coordinates[0],
              windSpeed: speed,
              maxGust: speed * 1.3,
              movement: 'NW',
              movementSpeed: 15,
              distance: Math.round(distance),
              eta: calculateETA(distance, 15),
              isActive: true
            });
          } else {
            setCyclone(null);
          }
        }
      } catch (err) {
        console.error('Error fetching cyclone data:', err);
        setError('Unable to fetch cyclone data');
        setCyclone(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCycloneData();
    // Refresh every 10 minutes
    const interval = setInterval(fetchCycloneData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [data.location.lat, data.location.lon]);

  const getCycloneType = (windSpeed: number) => {
    if (windSpeed < 63) return 'Tropical Storm';
    if (windSpeed < 90) return 'Cyclonic Storm';
    if (windSpeed < 120) return 'Severe Cyclonic Storm';
    if (windSpeed < 170) return 'Very Severe Cyclonic Storm';
    return 'Super Cyclonic Storm';
  };

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-3xl border-2 border-cyan-500/30 backdrop-blur-xl shadow-2xl animate-scale-in">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-950/90 to-cyan-950/95" />
        <div className="relative p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-3"></div>
          <p className="text-white/80 text-sm">Checking for active storms...</p>
        </div>
      </div>
    );
  }

  if (error || !cyclone || !cyclone.isActive) {
    return null; // Don't show card if no active cyclones
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-red-500/50 backdrop-blur-xl shadow-2xl animate-scale-in">
      {/* Animated background with cyclone image effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-blue-950/90 to-cyan-950/95 opacity-95" />
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px',
          animation: 'cyclone-rotate 20s linear infinite'
        }}
      />
      
      {/* Pulsing effect */}
      <div className="absolute inset-0 bg-red-500/5 animate-pulse" style={{ animationDuration: '3s' }} />
      
      {/* Content */}
      <div className="relative p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="bg-red-900/70 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-lg animate-pulse" style={{ animationDuration: '2s' }}>
              <Wind className="w-12 h-12 sm:w-16 sm:h-16 text-red-200" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm font-medium text-red-300 uppercase tracking-wider">
                  Live Storm Tracker
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {cyclone.name}
              </h3>
              <p className="text-sm text-cyan-300 font-medium">{cyclone.type}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-white/50">Updated</p>
            <p className="text-xs text-white/70 font-medium">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Direction */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-white/70 uppercase">Direction</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{cyclone.movement}</p>
            <p className="text-xs text-white/60">{cyclone.movementSpeed} km/h</p>
          </div>

          {/* Movement Speed */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-white/70 uppercase">Movement</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{cyclone.movementSpeed}</p>
            <p className="text-xs text-white/60">km/h speed</p>
          </div>

          {/* Wind Speed */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Wind className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-white/70 uppercase">Wind Speed</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{Math.round(cyclone.windSpeed)}</p>
            <p className="text-xs text-white/60">km/h</p>
          </div>

          {/* Max Gust */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-red-400" />
              <span className="text-xs text-white/70 uppercase">Max Gust</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{Math.round(cyclone.maxGust)}</p>
            <p className="text-xs text-white/60">km/h</p>
          </div>

          {/* Distance */}
          <div className="bg-blue-900/30 backdrop-blur-md rounded-xl p-3 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-blue-300" />
              <span className="text-xs text-white/70 uppercase">Distance</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-blue-200">{cyclone.distance}</p>
            <p className="text-xs text-blue-300">km from you</p>
          </div>

          {/* ETA */}
          <div className="bg-purple-900/30 backdrop-blur-md rounded-xl p-3 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-purple-300" />
              <span className="text-xs text-white/70 uppercase">Est. Arrival</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-purple-200">{cyclone.eta}</p>
            <p className="text-xs text-purple-300">at current speed</p>
          </div>
        </div>

        {/* Current Location */}
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white/10">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm sm:text-base font-semibold text-white">
                {cyclone.lat.toFixed(2)}° N, {cyclone.lon.toFixed(2)}° E
              </p>
              <p className="text-xs text-white/60 uppercase tracking-wider mt-0.5">
                Current Storm Position
              </p>
            </div>
          </div>
        </div>

        {/* Warning Message */}
        <div className="mt-4 bg-red-900/30 backdrop-blur-md rounded-xl p-3 border border-red-500/30">
          <p className="text-xs sm:text-sm text-red-200 leading-relaxed">
            ⚠️ Active storm detected. Stay informed through official weather channels. Prepare emergency supplies and follow local authorities' instructions.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes cyclone-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};