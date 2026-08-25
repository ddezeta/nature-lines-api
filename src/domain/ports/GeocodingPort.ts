import type { GeocodedPlace } from "../../types/trail";

export interface GeocodingPort {
  geocodePlace(query: string): Promise<GeocodedPlace>;
}
