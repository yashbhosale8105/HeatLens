import { WeatherData } from './types';

export function timeOfDay(): 'Morning' | 'Afternoon' | 'Evening' | 'Night' {
  const hour = new Date().getHours();
  if (hour < 11) return 'Morning';
  if (hour < 16) return 'Afternoon';
  if (hour < 20) return 'Evening';
  return 'Night';
}

export function todayPlan(weather: WeatherData | null): { title: string; steps: string[] } {
  const when = timeOfDay();
  if (!weather) {
    return {
      title: `${when} in Thane`,
      steps: ['Refresh the page to load today’s air and heat index.'],
    };
  }

  const risk = weather.risk_category;
  if (risk === 'Danger' || risk === 'Extreme Danger') {
    return {
      title: `${when}: stay out of the heat if you can`,
      steps: [
        'Keep outdoor work short and in shade.',
        'Drink water often, even if you do not feel thirsty.',
        'Check cooler pockets such as Yeoor Hills on the map.',
      ],
    };
  }
  if (risk === 'Caution' || risk === 'Extreme Caution') {
    return {
      title: `${when}: take it slower outdoors`,
      steps: [
        'Prefer early or later hours for walking or errands.',
        'Use the map to avoid the hottest neighbourhoods.',
        `Air feels like ${weather.heat_index_celsius.toFixed(1)}°C with ${weather.relative_humidity}% humidity.`,
      ],
    };
  }
  return {
    title: `${when}: conditions look comfortable`,
    steps: [
      weather.advisory,
      'Still compare neighbourhoods if you are planning a long walk.',
    ],
  };
}
