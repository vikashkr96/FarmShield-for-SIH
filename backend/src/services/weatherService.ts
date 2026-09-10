export interface WeatherMetrics {
  latitude: number;
  longitude: number;
  temperature_c: number;
  relative_humidity_pct: number;
  precipitation_mm: number;
  wind_speed_kmh?: number;
}

export interface WeatherRiskAssessment {
  metrics: WeatherMetrics;
  vector_borne_risk: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  epidemic_risk_multiplier: number; // 1.0 to 2.5
  vulnerable_diseases: string[];
  climate_advisory: string;
  source: 'live_open_meteo' | 'climatological_fallback';
}

/**
 * Fetch meteorological parameters from Open-Meteo and compute vector-borne epidemic vulnerability
 */
export async function getLiveWeatherRisk(latitude: number, longitude: number): Promise<WeatherRiskAssessment> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m`;

  let metrics: WeatherMetrics = {
    latitude,
    longitude,
    temperature_c: 28.5,
    relative_humidity_pct: 78,
    precipitation_mm: 12.4,
    wind_speed_kmh: 14.2,
  };
  let source: 'live_open_meteo' | 'climatological_fallback' = 'climatological_fallback';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = (await response.json()) as any;
      if (data && data.current) {
        metrics = {
          latitude,
          longitude,
          temperature_c: data.current.temperature_2m ?? 28.0,
          relative_humidity_pct: data.current.relative_humidity_2m ?? 75,
          precipitation_mm: data.current.precipitation ?? 0.0,
          wind_speed_kmh: data.current.wind_speed_10m ?? 10.0,
        };
        source = 'live_open_meteo';
      }
    }
  } catch (err) {
    console.warn('Weather API fetch failed, falling back to climatological baseline:', (err as Error).message);
  }

  // Risk formula
  const temp = metrics.temperature_c;
  const humidity = metrics.relative_humidity_pct;
  const precip = metrics.precipitation_mm;

  let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' = 'LOW';
  let multiplier = 1.0;
  const vulnerableDiseases: string[] = [];

  // Conditions for vector-borne proliferation (Culicoides biting midges, mosquitoes, ticks)
  // High: Temp > 26°C, Humidity > 75%, Precip > 10mm
  if (temp > 26 && humidity > 75 && precip > 10) {
    riskLevel = 'EXTREME';
    multiplier = 2.4;
    vulnerableDiseases.push(
      'Hemorrhagic Septicemia (HS) - Soil spore wash & wet humidity stress',
      'Blue Tongue (BT) - Culicoides vector surge',
      'Theileriosis & Babesiosis - High tick activity'
    );
  } else if (temp > 24 && humidity > 65) {
    riskLevel = 'HIGH';
    multiplier = 1.8;
    vulnerableDiseases.push(
      'Lumpy Skin Disease (LSD) - Biting fly transmission vector',
      'Black Quarter (BQ) - Waterlogged grazing fields'
    );
  } else if (temp > 20 && humidity > 50) {
    riskLevel = 'MODERATE';
    multiplier = 1.3;
    vulnerableDiseases.push('Routine respiratory infections');
  } else {
    riskLevel = 'LOW';
    multiplier = 1.0;
  }

  const climateAdvisory =
    riskLevel === 'EXTREME' || riskLevel === 'HIGH'
      ? 'High atmospheric moisture and temperature promote vector multiplication. Ensure cattle shed drainage, apply pyrethroid fly repellents, and avoid waterlogged pasture grazing.'
      : 'Meteorological parameters within standard seasonal tolerances. Maintain standard barn ventilation.';

  return {
    metrics,
    vector_borne_risk: riskLevel,
    epidemic_risk_multiplier: multiplier,
    vulnerable_diseases: vulnerableDiseases,
    climate_advisory: climateAdvisory,
    source,
  };
}
