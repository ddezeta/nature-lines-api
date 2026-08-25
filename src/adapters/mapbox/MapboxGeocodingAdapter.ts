import type { MapboxClient } from "./MapboxClient";
import type { GeocodingPort } from "../../domain/ports/GeocodingPort";
import type { GeocodedPlace } from "../../types/trail";

interface GeocodeResponse {
  features: Array<{
    properties: {
      name: string;
      coordinates: {
        longitude: number;
        latitude: number;
      };
    };
  }>;
}

export class MapboxGeocodingAdapter implements GeocodingPort {
  constructor(private readonly client: MapboxClient) {}

  async geocodePlace(query: string): Promise<GeocodedPlace> {
    const data = await this.client.get<GeocodeResponse>("/search/geocode/v6/forward", {
      q: query,
      limit: "1",
    });

    const feature = data.features[0];
    if (!feature) {
      throw new Error(`No geocoding results found for query: "${query}"`);
    }

    return {
      query,
      name: feature.properties.name,
      longitude: feature.properties.coordinates.longitude,
      latitude: feature.properties.coordinates.latitude,
    };
  }
}
