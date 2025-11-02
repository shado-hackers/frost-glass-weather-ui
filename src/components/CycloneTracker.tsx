import { useEffect, useState } from 'react';
import { WeatherData } from '@/types/weather';
import { Wind, Navigation, Zap, MapPin, Clock, Target, AlertTriangle } from 'lucide-react';

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
  locationName?: string;
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
        // Try GDACS API (Global Disaster Alert and Coordination System) - works globally including India
        const gdacsResponse = await fetch('https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH');
        
        if (gdacsResponse.ok) {
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
            
            // Fetch location name for cyclone position
            let locationName = '';
            try {
              const geoResponse = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${nearest.geometry.coordinates[1]}&longitude=${nearest.geometry.coordinates[0]}&localityLanguage=en`
              );
              if (geoResponse.ok) {
                const geoData = await geoResponse.json();
                locationName = geoData.locality || geoData.city || geoData.principalSubdivision || '';
              }
            } catch (geoError) {
              console.error('Error fetching location name:', geoError);
            }
            
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
              isActive: true,
              locationName: locationName
            });
          } else {
            setCyclone(null);
          }
        } else {
          setCyclone(null);
        }
      } catch (err) {
        console.error('Error fetching cyclone data:', err);
        // Don't show error, just hide the card if no cyclones
        setCyclone(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCycloneData();
    // Refresh every 5 minutes for more up-to-date data
    const interval = setInterval(fetchCycloneData, 5 * 60 * 1000);
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
    <div className="relative overflow-hidden rounded-3xl border-2 border-red-500/40 backdrop-blur-xl shadow-2xl animate-scale-in">
      {/* Animated Cyclone Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 animate-spin-slow"
          style={{
            backgroundImage: `url('https://i.postimg.cc/NjYq1Dm9/photo-2025-10-28-14-39-21-7566282270038818820.jpg')`,
            animationDuration: '30s'
          }}
        />
      </div>
      
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95" />
      
      {/* Content */}
      <div className="relative p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-slate-300">Live Storm Tracker</h2>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" title="Live Data"></div>
        </div>

        {/* Main Storm Info */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-blue-900/50 rounded-xl flex items-center justify-center border border-blue-700/50">
            <Wind className="w-6 h-6 sm:w-10 sm:h-10 text-blue-300" />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <h1 className="text-lg sm:text-3xl font-bold text-white break-words line-clamp-2">{cyclone.name}</h1>
            <p className="text-xs sm:text-base text-slate-400 truncate">{cyclone.type}</p>
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          {/* Movement */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
              <Navigation className="w-5 h-5 text-slate-300" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-semibold text-white">{cyclone.movement}</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Movement</p>
            </div>
          </div>

          {/* Movement Speed */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-slate-300" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-semibold text-white">{cyclone.movementSpeed} km/h</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Mov. Speed</p>
            </div>
          </div>

          {/* Sustained Wind */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
              <Wind className="w-5 h-5 text-slate-300" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-semibold text-white">{Math.round(cyclone.windSpeed)} km/h</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Sust. Wind</p>
            </div>
          </div>

          {/* Max Wind Gust */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-slate-300" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-semibold text-white">{Math.round(cyclone.maxGust)} km/h</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Max Gust</p>
            </div>
          </div>

          {/* Distance */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-slate-300" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-semibold text-white">{cyclone.distance} km</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Distance</p>
            </div>
          </div>

          {/* Est. Arrival */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-slate-300" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-semibold text-white">{cyclone.eta}</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Est. Arrival</p>
            </div>
          </div>

          {/* Current Position (Spans 2 columns) */}
          <div className="col-span-2 flex items-center gap-3 pt-3 border-t border-slate-700">
            <div className="flex-shrink-0 w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-slate-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-semibold text-white break-words">
                {cyclone.locationName && <span className="block">{cyclone.locationName}</span>}
                {cyclone.lat.toFixed(2)}°N, {cyclone.lon.toFixed(2)}°E
              </p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Current Position</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};