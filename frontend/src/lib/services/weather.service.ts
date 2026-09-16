/**
 * Weather & Bioclimatic THI Risk Service
 * Ported directly from Flutter WeatherService
 * Integrates with Open-Meteo API and computes Temperature-Humidity Index (THI)
 */

export interface WeatherRiskData {
  latitude: number;
  longitude: number;
  temperatureC: number;
  humidityPct: number;
  precipitationMm: number;
  windSpeedKmh: number;
  thi: number;
  heatStressCategory: 'Normal' | 'Alert' | 'Danger' | 'Emergency';
  vectorRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  epidemicMultiplier: number;
  vulnerableDiseases: string[];
  climateAdvisory: string;
  source: string;
}

export class WeatherService {
  private static cache: Map<string, { data: WeatherRiskData; timestamp: number }> = new Map();

  /**
   * Compute Temperature-Humidity Index (THI) for livestock:
   * THI = (1.8 * T + 32) - (0.55 - 0.0055 * RH) * (1.8 * T - 26)
   */
  public static computeThi(tempC: number, humidityPct: number): number {
    const t = tempC;
    const rh = Math.min(100, Math.max(0, humidityPct));
    const thi = 1.8 * t + 32.0 - (0.55 - 0.0055 * rh) * (1.8 * t - 26.0);
    return Math.round(thi * 10) / 10;
  }

  /**
   * Classify THI heat stress level for ruminants
   */
  public static classifyHeatStress(thi: number): 'Normal' | 'Alert' | 'Danger' | 'Emergency' {
    if (thi >= 88.0) return 'Emergency';
    if (thi >= 79.0) return 'Danger';
    if (thi >= 72.0) return 'Alert';
    return 'Normal';
  }

  /**
   * Fetch live weather from Open-Meteo or fall back gracefully to baseline
   */
  public static async getWeatherRisk(
    latitude = 18.5793,
    longitude = 73.9824,
    forceRefresh = false
  ): Promise<WeatherRiskData> {
    const cacheKey = `${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
    const now = Date.now();

    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (now - cached.timestamp < 3600000) {
        // 1 hour cache
        return cached.data;
      }
    }

    let tempC = 28.5;
    let humidityPct = 78.0;
    let precipMm = 12.0;
    let windKmh = 14.0;
    let source = 'climatological_baseline';

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m`;
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) {
        const json = await response.json();
        if (json?.current) {
          tempC = Number(json.current.temperature_2m) || tempC;
          humidityPct = Number(json.current.relative_humidity_2m) || humidityPct;
          precipMm = Number(json.current.precipitation) || precipMm;
          windKmh = Number(json.current.wind_speed_10m) || windKmh;
          source = 'live_open_meteo';
        }
      }
    } catch {
      // Graceful offline fallback
    }

    const thi = this.computeThi(tempC, humidityPct);
    const heatStress = this.classifyHeatStress(thi);

    // Vector-borne risk calculation
    let vectorRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' = 'LOW';
    let multiplier = 1.0;
    const vulnerableDiseases: string[] = [];

    if (tempC > 26.0 && humidityPct > 75.0 && precipMm > 8.0) {
      vectorRisk = 'EXTREME';
      multiplier = 2.4;
      vulnerableDiseases.push(
        'Hemorrhagic Septicemia (HS) - Wet soil spore wash & respiratory moisture stress',
        'Blue Tongue (BT) - Culicoides vector surge',
        'Theileriosis & Babesiosis - Intense tick activity'
      );
    } else if (tempC > 24.0 && humidityPct > 65.0) {
      vectorRisk = 'HIGH';
      multiplier = 1.8;
      vulnerableDiseases.push(
        'Lumpy Skin Disease (LSD) - Biting fly transmission vector',
        'Black Quarter (BQ) - Waterlogged pasture grazing'
      );
    } else if (tempC > 20.0 && humidityPct > 50.0) {
      vectorRisk = 'MODERATE';
      multiplier = 1.3;
      vulnerableDiseases.push('Subclinical respiratory infections & fungal spread');
    } else {
      vectorRisk = 'LOW';
      multiplier = 1.0;
    }

    let climateAdvisory = '';
    if (vectorRisk === 'EXTREME' || vectorRisk === 'HIGH') {
      climateAdvisory =
        'High atmospheric moisture and heat accelerate vector breeding. Apply pyrethroid fly repellents, maintain cattle shed drainage, and avoid waterlogged pasture grazing.';
    } else if (heatStress === 'Danger' || heatStress === 'Emergency') {
      climateAdvisory = `Severe heat stress risk (${thi} THI). Provide shaded loafing areas, increase cold water intake points, and operate fans or misting systems during midday.`;
    } else {
      climateAdvisory =
        'Meteorological parameters within standard seasonal tolerances. Maintain standard barn ventilation and hygiene.';
    }

    const result: WeatherRiskData = {
      latitude,
      longitude,
      temperatureC: tempC,
      humidityPct,
      precipitationMm: precipMm,
      windSpeedKmh: windKmh,
      thi,
      heatStressCategory: heatStress,
      vectorRiskLevel: vectorRisk,
      epidemicMultiplier: multiplier,
      vulnerableDiseases,
      climateAdvisory,
      source,
    };

    this.cache.set(cacheKey, { data: result, timestamp: now });
    return result;
  }
}
