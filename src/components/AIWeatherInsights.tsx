import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Droplets, Wind, Sun, Cloud, Zap, Loader2 } from 'lucide-react';
import { WeatherData } from '@/types/weather';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIWeatherInsightsProps {
  data: WeatherData;
}

interface Insight {
  icon: React.ReactNode;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'success';
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'warning':
      return 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10';
    case 'success':
      return 'text-green-400 border-green-400/40 bg-green-400/10';
    default:
      return 'text-blue-400 border-blue-400/40 bg-blue-400/10';
  }
};

export const AIWeatherInsights = ({ data }: AIWeatherInsightsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    generateInsights();
    fetchAISummary();
  }, [data]);

  const fetchAISummary = async () => {
    setLoadingAI(true);
    try {
      console.log('Fetching AI weather summary...');
      const { data: summaryData, error } = await supabase.functions.invoke('weather-insights', {
        body: { weatherData: data }
      });

      if (error) {
        console.error('AI summary error:', error);
        toast.error('AI insights temporarily unavailable');
      } else if (summaryData?.summary) {
        console.log('AI summary received:', summaryData.summary);
        setAiSummary(summaryData.summary);
      } else {
        console.log('No AI summary in response');
      }
    } catch (err) {
      console.error('Failed to fetch AI summary:', err);
      toast.error('Could not load AI insights');
    } finally {
      setLoadingAI(false);
    }
  };

  const generateInsights = () => {
    const newInsights: Insight[] = [];
    const current = data.current;
    const forecast = data.forecast.forecastday;

    // Temperature trend analysis
    const todayMax = forecast[0].day.maxtemp_c;
    const tomorrowMax = forecast[1]?.day.maxtemp_c;
    if (tomorrowMax && tomorrowMax > todayMax + 3) {
      newInsights.push({
        icon: <TrendingUp className="h-5 w-5" />,
        title: 'Temperature Rising',
        description: `Expect ${(tomorrowMax - todayMax).toFixed(1)}°C warmer tomorrow. Consider lighter clothing.`,
        severity: 'warning'
      });
    } else if (tomorrowMax && tomorrowMax < todayMax - 3) {
      newInsights.push({
        icon: <TrendingDown className="h-5 w-5" />,
        title: 'Temperature Dropping',
        description: `Temperature will drop by ${(todayMax - tomorrowMax).toFixed(1)}°C. Bring extra layers.`,
        severity: 'info'
      });
    }

    // Rain prediction
    const rainChance = forecast[0].day.daily_chance_of_rain || 0;
    if (rainChance > 70) {
      newInsights.push({
        icon: <Droplets className="h-5 w-5" />,
        title: 'High Rain Probability',
        description: `${rainChance}% chance of rain today. Don't forget your umbrella!`,
        severity: 'warning'
      });
    } else if (rainChance < 20) {
      newInsights.push({
        icon: <Sun className="h-5 w-5" />,
        title: 'Clear Skies Ahead',
        description: `Only ${rainChance}% chance of rain. Perfect day for outdoor activities!`,
        severity: 'success'
      });
    }

    // UV Index warning
    if (current.uv >= 6) {
      newInsights.push({
        icon: <Sun className="h-5 w-5" />,
        title: 'High UV Index',
        description: `UV index is ${current.uv}. Apply sunscreen and seek shade during peak hours.`,
        severity: 'warning'
      });
    }

    // Wind conditions
    if (current.wind_kph > 40) {
      newInsights.push({
        icon: <Wind className="h-5 w-5" />,
        title: 'Strong Winds',
        description: `Wind speeds at ${current.wind_kph.toFixed(0)} km/h. Secure loose objects outdoors.`,
        severity: 'warning'
      });
    }

    // Visibility conditions
    if (current.vis_km < 2) {
      newInsights.push({
        icon: <Cloud className="h-5 w-5" />,
        title: 'Poor Visibility',
        description: `Visibility down to ${current.vis_km} km. Drive carefully and use fog lights.`,
        severity: 'warning'
      });
    }

    // Humidity comfort
    if (current.humidity > 80) {
      newInsights.push({
        icon: <Droplets className="h-5 w-5" />,
        title: 'High Humidity',
        description: `Humidity at ${current.humidity}%. It may feel muggy. Stay hydrated!`,
        severity: 'info'
      });
    } else if (current.humidity < 30) {
      newInsights.push({
        icon: <Droplets className="h-5 w-5" />,
        title: 'Low Humidity',
        description: `Humidity at ${current.humidity}%. Air is dry. Use moisturizer and drink water.`,
        severity: 'info'
      });
    }

    // Storm warning
    if (current.condition.text.toLowerCase().includes('thunder') || 
        current.condition.text.toLowerCase().includes('storm')) {
      newInsights.push({
        icon: <Zap className="h-5 w-5" />,
        title: 'Thunderstorm Alert',
        description: 'Storms detected. Stay indoors and avoid open areas.',
        severity: 'warning'
      });
    }

    // Weather stability
    const todayCondition = forecast[0].day.condition.text;
    const tomorrowCondition = forecast[1]?.day.condition.text;
    if (todayCondition === tomorrowCondition) {
      newInsights.push({
        icon: <Cloud className="h-5 w-5" />,
        title: 'Stable Conditions',
        description: 'Weather conditions will remain consistent over the next 48 hours.',
        severity: 'success'
      });
    }

    setInsights(insights.length > 0 ? newInsights : newInsights.slice(0, 4));
  };

  if (insights.length === 0) return null;

  return (
    <Card className="glass-card border-white/20 overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader 
        className="pb-3 cursor-pointer active:scale-[0.99] transition-transform"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between text-base sm:text-lg text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
            AI Weather Insights
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-white/70 transition-transform" />
          ) : (
            <ChevronDown className="h-5 w-5 text-white/70 transition-transform" />
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Preview when collapsed */}
        {!isExpanded && (
          <div className="animate-fade-in">
            {loadingAI ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                <span className="ml-2 text-sm text-white/70">Generating AI insights...</span>
              </div>
            ) : aiSummary ? (
              <p className="text-sm text-white/90 leading-relaxed">{aiSummary}</p>
            ) : (
              <>
                <div className="text-sm text-white/70 mb-2">
                  {insights.length} insight{insights.length > 1 ? 's' : ''} available
                </div>
                <div className="flex flex-wrap gap-2">
                  {insights.slice(0, 3).map((insight, idx) => (
                    <div 
                      key={idx}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-sm text-xs font-medium ${getSeverityColor(insight.severity)}`}
                    >
                      {insight.icon}
                      <span>{insight.title}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Expanded content */}
        <div 
          className={`transition-all duration-500 ease-in-out origin-top ${
            isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 h-0'
          }`}
          style={{ display: isExpanded ? 'block' : 'none' }}
        >
          <div className="space-y-3 animate-fade-in">
            {/* AI Summary Section */}
            {aiSummary && (
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/40 backdrop-blur-sm p-4 rounded-lg mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-semibold text-white">AI Weather Summary</span>
                </div>
                <p className="text-sm text-white/90 leading-relaxed">{aiSummary}</p>
              </div>
            )}
            
            {/* Detailed Insights */}
            {insights.map((insight, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-lg border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${getSeverityColor(insight.severity)}`}
                style={{ 
                  animation: isExpanded ? `slideIn 0.4s ease-out ${idx * 0.1}s both` : 'none'
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 opacity-80">
                    {insight.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">
                      {insight.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-white/80">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
