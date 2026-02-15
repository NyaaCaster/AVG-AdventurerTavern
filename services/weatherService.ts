
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
    if (!navigator.geolocation) {
      resolve(QWEATHER_CONFIG.DEFAULT_LOCATION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(2);
        const lon = position.coords.longitude.toFixed(2);
        resolve(`${lon},${lat}`);
      },
      (error) => {
        console.warn("Geolocation failed, using default:", error);
        resolve(QWEATHER_CONFIG.DEFAULT_LOCATION);
      },
      { timeout: 5000, maximumAge: 600000 }
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
    console.log(`[Weather] Fetching new data for location: ${location}`);

    // Ensure HOST doesn't have protocol prefix if user added it by mistake, ensuring consistent URL construction
    const cleanHost = QWEATHER_CONFIG.HOST.replace(/^https?:\/\//, '');
    const url = `https://${cleanHost}/v7/weather/now?location=${location}`;
    
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

    // 3. Save to Cache
    const cacheData: WeatherCache = {
      timestamp: now.getTime(),
      hour: currentHour,
      data: data
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

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
