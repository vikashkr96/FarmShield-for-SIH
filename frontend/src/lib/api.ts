const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface HealthCheckResponse {
  status: string;
  appName: string;
  version: string;
  timestamp: string;
  services: {
    expressApi: {
      status: string;
      uptimeSeconds: number;
    };
    supabase: {
      configured: boolean;
      connected: boolean;
      message: string;
      details?: unknown;
    };
  };
}

export async function fetchBackendHealth(): Promise<{
  success: boolean;
  data?: HealthCheckResponse;
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Express Server HTTP Error: ${response.status} ${response.statusText}`,
      };
    }

    const data: HealthCheckResponse = await response.json();
    return { success: true, data };
  } catch (err: unknown) {
    const error = err as Error;
    return {
      success: false,
      error: `Could not connect to Express API at ${API_BASE_URL}. (${error.message || 'Network error'})`,
    };
  }
}
