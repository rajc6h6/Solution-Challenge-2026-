export interface WeatherRouteInput {
  lat: number;
  lon: number;
}

export interface WeatherRouteSnapshot {
  severity: number;
  precipProb: number;
  windSpeed: number;
  temperature: number;
  visibility: number;
}

export async function getWeatherForRoute(
  origin: WeatherRouteInput,
  destination: WeatherRouteInput
): Promise<WeatherRouteSnapshot> {
  const lat = (origin.lat + destination.lat) / 2;
  const lon = (origin.lon + destination.lon) / 2;
  const endpoint =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    "&current=temperature_2m,precipitation,wind_speed_10m,visibility" +
    "&hourly=precipitation_probability,weather_code&forecast_days=2";

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    current?: {
      precipitation?: number;
      wind_speed_10m?: number;
      visibility?: number;
      temperature_2m?: number;
    };
    hourly?: {
      precipitation_probability?: number[];
      weather_code?: number[];
    };
  };

  const precipitation = data.current?.precipitation ?? 0;
  const windSpeed = data.current?.wind_speed_10m ?? 0;
  const visibility = data.current?.visibility ?? 10000;
  const weatherCode = data.hourly?.weather_code?.[0] ?? 0;
  const precipProb = data.hourly?.precipitation_probability?.[0] ?? 0;
  const temperature = data.current?.temperature_2m ?? 20;

  return {
    severity: calculateSeverity({ precipitation, windSpeed, visibility, weatherCode }),
    precipProb,
    windSpeed,
    temperature,
    visibility,
  };
}

export function calculateSeverity(weather: {
  precipitation: number;
  windSpeed: number;
  visibility: number;
  weatherCode: number;
}): number {
  let score = 0;

  if (weather.precipitation > 10) score += 3;
  else if (weather.precipitation > 5) score += 2;
  else if (weather.precipitation > 1) score += 1;

  if (weather.windSpeed > 50) score += 3;
  else if (weather.windSpeed > 30) score += 2;
  else if (weather.windSpeed > 15) score += 1;

  if (weather.visibility < 1000) score += 2;
  else if (weather.visibility < 5000) score += 1;

  if ([95, 96, 99].includes(weather.weatherCode)) score += 2;
  else if ([71, 73, 75, 77, 85, 86].includes(weather.weatherCode)) score += 2;
  else if ([61, 63, 65, 80, 81, 82].includes(weather.weatherCode)) score += 1;

  return Math.min(score, 10);
}
