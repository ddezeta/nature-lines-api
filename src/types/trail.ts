export interface Coordinate {
  longitude: number;
  latitude: number;
}

export interface GeocodedPlace extends Coordinate {
  query: string;
  name: string;
}

export interface TrailDefinition {
  id: string;
  name: string;
  trailheadQuery: string;
  peakQuery: string;
}

export interface RouteGeometry {
  type: "LineString";
  coordinates: number[][];
}

export type RouteStatus = "Ok" | "NoRoute" | "InvalidInput";

export interface WalkingRouteResult {
  status: RouteStatus;
  distanceMeters: number | null;
  durationSeconds: number | null;
  geometry: RouteGeometry | null;
}

export interface TrailRoute {
  id: string;
  name: string;
  trailhead: GeocodedPlace;
  peak: GeocodedPlace;
  routeStatus: RouteStatus;
  distanceMeters: number | null;
  durationSeconds: number | null;
  geometry: RouteGeometry | null;
}
