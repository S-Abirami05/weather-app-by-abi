import { useState, useEffect } from 'react';
import {
  Search, Droplets, Wind, Zap,
  Cloud, Sun, CloudRain, CloudSnow,
  CloudLightning, CloudDrizzle, CloudFog, CloudSun, Target
} from 'lucide-react';
import './index.css';


function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cityDisplay, setCityDisplay] = useState('London');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=100&language=en&format=json`);
        const data = await res.json();
        if (data.results) {
          const sortedResults = data.results.sort((a, b) => (b.population || 0) - (a.population || 0));
          setSuggestions(sortedResults.slice(0, 5));
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    };

    const debounceId = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceId);
  }, [searchQuery]);

  useEffect(() => {
    fetchWeatherData('London');
  }, []);

  const fetchWeatherData = async (cityName) => {
    setLoading(true);
    setError('');
    try {
      let latitude = null;
      let longitude = null;
      let finalName = '';

      if (typeof cityName === 'object' && cityName.latitude) {
        latitude = cityName.latitude;
        longitude = cityName.longitude;
        finalName = `${cityName.name}${cityName.admin1 ? `, ${cityName.admin1}` : ''}${cityName.country ? `, ${cityName.country}` : ''}`;
      } else {
        const queryStr = typeof cityName === 'string' ? cityName : cityName.name;
        const encodedCity = encodeURIComponent(queryStr);
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodedCity}&count=1&language=en&format=json`);

        if (!geoRes.ok) {
          throw new Error(`Location fetch failed (${geoRes.status})`);
        }

        const geoData = await geoRes.json();

        if (geoData.results && geoData.results.length > 0) {
          const location = geoData.results[0];
          latitude = location.latitude;
          longitude = location.longitude;
          finalName = `${location.name}${location.country ? `, ${location.country}` : ''}`;
        } else {
          const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodedCity}&format=json&limit=1`, {
            headers: { 'User-Agent': 'ReactWeatherApp/1.0' }
          });
          if (!nomRes.ok) throw new Error(`Location fetch failed (${nomRes.status})`);

          const nomData = await nomRes.json();
          if (!nomData || nomData.length === 0) {
            throw new Error('Location not found. Please try another name.');
          }

          latitude = parseFloat(nomData[0].lat);
          longitude = parseFloat(nomData[0].lon);
          finalName = nomData[0].name || queryStr;
        }
      }

      setCityDisplay(finalName);

      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,surface_pressure,wind_speed_10m&timezone=auto`);

      if (!weatherRes.ok) {
        throw new Error(`Weather fetch failed (${weatherRes.status})`);
      }

      const weatherData = await weatherRes.json();

      setWeather(weatherData.current);
      await fetch('http://localhost:5000/save-weather', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    city: finalName,
    temperature: weatherData.current.temperature_2m,
    weather: getWeatherDescription(weatherData.current.weather_code),
    humidity: weatherData.current.relative_humidity_2m,
    wind: weatherData.current.wind_speed_10m
  })
});
    } catch (err) {
      console.error("Fetch error details:", err);
      if (err.message && err.message.includes('Failed to fetch')) {
        setError('Network error: Please check your internet connection or ad-blocker.');
      } else {
        setError(err.message || 'Failed to fetch weather data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchWeatherData(searchQuery.trim());
      setSearchQuery('');
    }
  };

  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun size={80} color="#FFD700" className="animated-icon sun-spin" />;
    if (code === 1 || code === 2) return <CloudSun size={80} color="#FFD700" fill="white" className="animated-icon float" />;
    if (code === 3) return <Cloud size={80} fill="#E2E8F0" color="#94A3B8" className="animated-icon float" />;
    if (code === 45 || code === 48) return <CloudFog size={80} color="#CBD5E1" className="animated-icon float" />;
    if (code >= 51 && code <= 57) return <CloudDrizzle size={80} color="#60A5FA" className="animated-icon float" />;
    if (code >= 61 && code <= 67) return <CloudRain size={80} color="#3B82F6" className="animated-icon float" />;
    if (code >= 71 && code <= 77) return <CloudSnow size={80} color="#E0F2FE" className="animated-icon float" />;
    if (code >= 80 && code <= 82) return <CloudRain size={80} color="#2563EB" className="animated-icon float" />;
    if (code >= 85 && code <= 86) return <CloudSnow size={80} color="#E0F2FE" className="animated-icon float" />;
    if (code >= 95) return <CloudLightning size={80} color="#FBBF24" className="animated-icon float" />;
    return <Cloud size={80} fill="white" color="white" className="animated-icon float" />;
  };

  const getWeatherDescription = (code) => {
    if (code === 0) return 'Clear Sky';
    if (code === 1 || code === 2) return 'Partly Cloudy';
    if (code === 3) return 'Overcast';
    if (code === 45 || code === 48) return 'Fog';
    if (code >= 51 && code <= 57) return 'Drizzle';
    if (code >= 61 && code <= 67) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 80 && code <= 82) return 'Rain Showers';
    if (code >= 85 && code <= 86) return 'Snow Showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Unknown';
  };

  const getBackgroundImage = (code) => {
    // Clear sky (0)
    if (code === 0) return 'url("https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?q=80&w=1920&auto=format&fit=crop")'; 
    // Partly Cloudy (1, 2)
    if (code === 1 || code === 2) return 'url("https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?q=80&w=1920&auto=format&fit=crop")'; 
    // Overcast / Dark Cloudy (3)
    if (code === 3) return 'url("https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1920&auto=format&fit=crop")'; 
    // Fog (45, 48)
    if (code === 45 || code === 48) return 'url("https://images.unsplash.com/photo-1487621167305-5d248087c724?q=80&w=1920&auto=format&fit=crop")'; 
    // Rain & Showers
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'url("https://images.unsplash.com/photo-1438449805896-28a666819a20?q=80&w=1920&auto=format&fit=crop")'; 
    // Snow
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'url("https://images.unsplash.com/photo-1478265409131-1f65c88f965c?q=80&w=1920&auto=format&fit=crop")'; 
    // Storm
    if (code >= 95) return 'url("https://images.unsplash.com/photo-1472145246862-b24cf25c4a36?q=80&w=1920&auto=format&fit=crop")'; 

    return 'url("https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?q=80&w=1920&auto=format&fit=crop")';
  };

  const formatDate = () => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date().toLocaleDateString('en-US', options);
  };

  const formatTime = () => {
    if (!weather?.time) return '';
    const date = new Date(weather.time);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    const code = weather ? weather.weather_code : 0;
    document.body.style.backgroundImage = getBackgroundImage(code);
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';

    document.body.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
    document.body.style.backgroundBlendMode = 'overlay';

    document.body.style.transition = 'background-image 0.8s ease-in-out';
  }, [weather]);

  return (
    <div className="app-container">
      {/* Search Bar */}
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-bar glass-effect interactive-element with-container">
          <button type="submit" style={{ background: 'transparent', border: 'none', display: 'flex', outline: 'none' }}>
            <Search size={22} className="search-icon" style={{ cursor: 'pointer' }} />
          </button>
          <input
            type="text"
            placeholder="Search city..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 200);
            }}
          />
          {searchQuery && (
            <button type="button" onClick={() => { setSearchQuery(''); setSuggestions([]); }} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', outline: 'none', marginLeft: '10px' }}>
              ✕
            </button>
          )}
        </form>

        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-dropdown glass-effect pop-in">
            {suggestions.map((sug, index) => {
              return (
                <div 
                  key={`${sug.id}-${index}`} 
                  className="suggestion-item"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSearchQuery(sug.name);
                    setSuggestions([]);
                    setShowSuggestions(false);
                    fetchWeatherData(sug);
                  }}
                >
                  <div className="suggestion-name">{sug.name}</div>
                  <div className="suggestion-details">
                    {sug.admin1 ? `${sug.admin1}, ` : ''}{sug.country}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error && <div className="error-message glass-effect bounce-in">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Fetching live weather...</div>
        </div>
      ) : weather ? (
        <div className="weather-content fade-in">
          {/* City & Date Info */}
          <div className="city-info">
            <h1 className="city-name slide-down">{cityDisplay.split(',')[0]}</h1>
            <p className="date-info slide-down" style={{ animationDelay: '0.1s' }}>{formatDate()}</p>
          </div>

          {/* Weather Icon / Art */}
          <div className="weather-icon-container glass-effect pop-in">
            <div className="weather-icon-art">
              <div className="cloud-group">
                {getWeatherIcon(weather.weather_code)}
              </div>
              <div className="weather-icon-text">
                {getWeatherDescription(weather.weather_code).toUpperCase()}
              </div>
            </div>
          </div>

          <div className="temperature-info slide-up">
            <div className="temperature">
              {Math.round(weather.temperature_2m)}<span className="degree-symbol">°C</span>
            </div>
          </div>


          <div className="stats-container glass-effect slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="stat-item interactive-element">
              <span className="stat-label">HUMIDITY</span>
              <Droplets size={26} strokeWidth={1.5} className="stat-icon bounce-on-hover" />
              <span className="stat-value">{Math.round(weather.relative_humidity_2m)}%</span>
            </div>
            <div className="stat-item interactive-element">
              <span className="stat-label">WIND</span>
              <Wind size={26} strokeWidth={1.5} className="stat-icon spin-on-hover" />
              <span className="stat-value">{Math.round(weather.wind_speed_10m)} km/h</span>
            </div>
          </div>

          <div className="last-updated fade-in" style={{ animationDelay: '0.4s' }}>
            LAST UPDATED: {formatTime()}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;