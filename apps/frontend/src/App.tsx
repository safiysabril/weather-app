import { useState } from 'react';
import axios from 'axios';

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  name: string;
  sys: {
    country: string;
  };
}

const API_BASE_URL = 'http://localhost:8000';

export const WeatherApp = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Configure axios request with proper CORS headers
      const response = await axios.get<WeatherData>(
        `${API_BASE_URL}/api/weather/${encodeURIComponent(city.trim())}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      console.log('Weather data received:', response.data); // Debug log
      setWeather(response.data);
      
    } catch (err) {
      console.error('Error fetching weather:', err);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          setError(err.response.data.detail || 'Error fetching weather data');
        } else if (err.request) {
          setError('No response from server. Please check your connection.');
        } else {
          setError('Error setting up the request');
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-2xl font-bold mb-4">Weather App</h1>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && fetchWeather()}
          placeholder="Enter city name"
          className="flex-1 p-2 border rounded"
          disabled={loading}
        />
        <button
          onClick={fetchWeather}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Loading...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {weather && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">
            {weather.name}, {weather.sys.country}
          </h2>
          <p className="text-4xl font-bold my-2">
            {Math.round(weather.main.temp)}°C
          </p>
          <p className="text-gray-600 capitalize">
            {weather.weather[0]?.description}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500">Feels Like</p>
              <p className="font-semibold">{Math.round(weather.main.feels_like)}°C</p>
            </div>
            <div>
              <p className="text-gray-500">Humidity</p>
              <p className="font-semibold">{weather.main.humidity}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherApp;