import { QWEATHER_CONFIG } from '../data/qweatherConfig';

interface WeatherCache {
  timestamp: number; // Milliseconds
  hour: number;      // The specific hour (0-23) this data belongs to
  data: {
    now: {
      text: string;
      icon: string;
      temp: string;
    }
  }
}

const CACHE_KEY = 'adventurer_tavern_weather_cache';

/**
 * Get current location coordinates.
 * Returns formatted string "lon,lat" (decimal, max 2 decimals).
 */
const getLocation = (): Promise<string> => {
  return new Promise((resolve) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.warn(`[Weather] 鉂?Geolocation API not supported by browser`);
      console.log(`[Weather] 馃搷 Using default location: ${QWEATHER_CONFIG.DEFAULT_LOCATION}`);
      resolve(QWEATHER_CONFIG.DEFAULT_LOCATION);
      return;
    }

    // Check if running on HTTPS (required for geolocation)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.warn(`[Weather] 鈿狅笍 Geolocation requires HTTPS. Current protocol: ${window.location.protocol}`);
      console.log(`[Weather] 馃搷 Using default location: ${QWEATHER_CONFIG.DEFAULT_LOCATION}`);
      resolve(QWEATHER_CONFIG.DEFAULT_LOCATION);
      return;
    }

    console.log('[Weather] 馃實 Requesting device location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(2);
        const lon = position.coords.longitude.toFixed(2);
        const coords = `${lon},${lat}`;
        console.log(`[Weather] 鉁?Device location obtained: ${coords}`);
        console.log(`[Weather] 馃搳 Accuracy: ${position.coords.accuracy.toFixed(0)}m`);
        resolve(coords);
      },
      (error) => {
        // Detailed error logging
        let errorMsg = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = '鉂?User denied geolocation permission';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = '鉂?Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMsg = '鉂?Geolocation request timed out';
            break;
          default:
            errorMsg = `鉂?Unknown geolocation error (code: ${error.code})`;
        }
        console.warn(`[Weather] ${errorMsg}:`, error.message);
        console.log(`[Weather] 馃搷 Falling back to default location: ${QWEATHER_CONFIG.DEFAULT_LOCATION}`);
        resolve(QWEATHER_CONFIG.DEFAULT_LOCATION);
      },
      { 
        timeout: 10000,      // Increased to 10 seconds
        maximumAge: 600000,  // Cache for 10 minutes
        enableHighAccuracy: false  // Faster response, lower accuracy is fine for weather
      }
    );
  });
};

/**
 * Fetch weather data from QWeather API.
 * Uses caching strategy: only refreshes if the cached hour differs from current hour.
 */
export const fetchWeatherData = async () => {
  const now = new Date();
  const currentHour = now.getHours();

  // 1. Check Cache
  try {
    const cachedStr = localStorage.getItem(CACHE_KEY);
    if (cachedStr) {
      const cache: WeatherCache = JSON.parse(cachedStr);
      // If cached data is from the same hour, return it
      if (cache.hour === currentHour) {
        console.log("[Weather] Using cached data for hour:", currentHour);
        return {
            text: cache.data.now.text,
            code: cache.data.now.icon,
            temp: cache.data.now.temp
        };
      }
    }
  } catch (e) {
    console.error("[Weather] Cache parse error", e);
  }

  // 2. Fetch Fresh Data
  try {
    const location = await getLocation();
    console.log(`[Weather] 馃尋锔?Fetching weather data for location: ${location}`);

    // Ensure HOST doesn't have protocol prefix if user added it by mistake, ensuring consistent URL construction
    const cleanHost = QWEATHER_CONFIG.HOST.replace(/^https?:\/\//, '');
    const url = `https://${cleanHost}/v7/weather/now?location=${location}`;
    console.log(`[Weather] 馃敆 API URL: ${url.replace(QWEATHER_CONFIG.KEY, '***')}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-QW-Api-Key': QWEATHER_CONFIG.KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Weather API Error: ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== '200') {
        throw new Error(`Weather API returned code: ${data.code}`);
    }

    console.log(`[Weather] 鉁?Weather data received: ${data.now.text}, ${data.now.temp}掳C`);

    // 3. Save to Cache
    const cacheData: WeatherCache = {
      timestamp: now.getTime(),
      hour: currentHour,
      data: data
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log(`[Weather] 馃捑 Cached for hour: ${currentHour}`);

    return {
        text: data.now.text,
        code: data.now.icon,
        temp: data.now.temp
    };

  } catch (error) {
    console.error("[Weather] Update failed:", error);
    return null; // Return null to indicate failure (UI should keep using simulated or previous state)
  }
};

