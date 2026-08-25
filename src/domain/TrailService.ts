import type { GeocodingPort } from "./ports/GeocodingPort";
import type { DirectionsPort } from "./ports/DirectionsPort";
import type { TrailDefinition, TrailRoute } from "../types/trail";

export class TrailService {
  private readonly cache = new Map<string, TrailRoute>();

  constructor(
    private readonly geocoding: GeocodingPort,
    private readonly directions: DirectionsPort,
    private readonly trails: TrailDefinition[],
  ) {}

  async getAllTrailRoutes(): Promise<TrailRoute[]> {
    const routes = await Promise.all(this.trails.map((trail) => this.getTrailRoute(trail.id)));
    return routes.filter((route): route is TrailRoute => route !== null);
  }

  async getTrailRoute(id: string): Promise<TrailRoute | null> {
    const cached = this.cache.get(id);
    if (cached) {
      return cached;
    }

    const trail = this.trails.find((candidate) => candidate.id === id);
    if (!trail) {
      return null;
    }

    const route = await this.buildTrailRoute(trail);
    this.cache.set(id, route);
    return route;
  }

  private async buildTrailRoute(trail: TrailDefinition): Promise<TrailRoute> {
    const [trailhead, peak] = await Promise.all([
      this.geocoding.geocodePlace(trail.trailheadQuery),
      this.geocoding.geocodePlace(trail.peakQuery),
    ]);

    const route = await this.directions.getWalkingRoute(trailhead, peak);

    return {
      id: trail.id,
      name: trail.name,
      trailhead,
      peak,
      routeStatus: route.status,
      distanceMeters: route.distanceMeters,
      durationSeconds: route.durationSeconds,
      geometry: route.geometry,
    };
  }
}
