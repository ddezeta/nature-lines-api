import type { MapboxClient } from "./MapboxClient";
import type { DirectionsPort } from "../../domain/ports/DirectionsPort";
import type { Coordinate, RouteGeometry, RouteStatus, WalkingRouteResult } from "../../types/trail";

interface DirectionsResponse {
  code: RouteStatus;
  routes?: Array<{
    geometry: RouteGeometry;
    distance: number;
    duration: number;
  }>;
}

export class MapboxDirectionsAdapter implements DirectionsPort {
  constructor(private readonly client: MapboxClient) {}

  async getWalkingRoute(from: Coordinate, to: Coordinate): Promise<WalkingRouteResult> {
    const coordinatePath = `${from.longitude},${from.latitude};${to.longitude},${to.latitude}`;

    const data = await this.client.get<DirectionsResponse>(`/directions/v5/mapbox/walking/${coordinatePath}`, {
      geometries: "geojson",
      overview: "full",
    });

    const route = data.routes?.[0];
    if (data.code !== "Ok" || !route) {
      return { status: data.code, distanceMeters: null, durationSeconds: null, geometry: null };
    }

    return {
      status: "Ok",
      distanceMeters: route.distance,
      durationSeconds: route.duration,
      geometry: route.geometry,
    };
  }
}
