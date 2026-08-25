export interface MapboxApiError extends Error {
  status: number;
  path: string;
}

function createMapboxApiError(message: string, status: number, path: string): MapboxApiError {
  return Object.assign(new Error(message), { name: "MapboxApiError", status, path });
}

export function isMapboxApiError(error: unknown): error is MapboxApiError {
  return error instanceof Error && error.name === "MapboxApiError";
}

export class MapboxClient {
  constructor(
    private readonly baseUrl: string,
    private readonly accessToken: string,
  ) {}

  async get<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(path, this.baseUrl);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    url.searchParams.set("access_token", this.accessToken);

    const response = await fetch(url);
    if (!response.ok) {
      throw createMapboxApiError(`Mapbox request failed with status ${response.status}`, response.status, path);
    }

    return (await response.json()) as T;
  }
}
