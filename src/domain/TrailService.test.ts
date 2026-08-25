import { TrailService } from "./TrailService";
import type { GeocodingPort } from "./ports/GeocodingPort";
import type { DirectionsPort } from "./ports/DirectionsPort";
import type { GeocodedPlace, TrailDefinition, WalkingRouteResult } from "../types/trail";

function makePlace(query: string): GeocodedPlace {
  return { query, name: `Place: ${query}`, longitude: 1, latitude: 2 };
}

const okRoute: WalkingRouteResult = {
  status: "Ok",
  distanceMeters: 1000,
  durationSeconds: 600,
  geometry: { type: "LineString", coordinates: [[1, 2]] },
};

const trails: TrailDefinition[] = [
  { id: "trail-a", name: "Trail A", trailheadQuery: "head-a", peakQuery: "peak-a" },
  { id: "trail-b", name: "Trail B", trailheadQuery: "head-b", peakQuery: "peak-b" },
];

function makeService(overrides?: {
  geocodePlace?: GeocodingPort["geocodePlace"];
  getWalkingRoute?: DirectionsPort["getWalkingRoute"];
  trails?: TrailDefinition[];
}) {
  const geocodePlace = jest.fn(overrides?.geocodePlace ?? ((query: string) => Promise.resolve(makePlace(query))));
  const getWalkingRoute = jest.fn(overrides?.getWalkingRoute ?? (() => Promise.resolve(okRoute)));

  const geocoding: GeocodingPort = { geocodePlace };
  const directions: DirectionsPort = { getWalkingRoute };

  const service = new TrailService(geocoding, directions, overrides?.trails ?? trails);
  return { service, geocodePlace, getWalkingRoute };
}

describe("TrailService", () => {
  describe("getTrailRoute", () => {
    it("should return null when the trail id does not exist", async () => {
      const { service } = makeService();

      const result = await service.getTrailRoute("does-not-exist");

      expect(result).toBeNull();
    });

    it("should build a route from geocoded places and the directions result", async () => {
      const { service } = makeService();

      const result = await service.getTrailRoute("trail-a");

      expect(result).toEqual({
        id: "trail-a",
        name: "Trail A",
        trailhead: makePlace("head-a"),
        peak: makePlace("peak-a"),
        routeStatus: "Ok",
        distanceMeters: 1000,
        durationSeconds: 600,
        geometry: okRoute.geometry,
      });
    });

    it("should geocode the trailhead and peak queries for the requested trail", async () => {
      const { service, geocodePlace, getWalkingRoute } = makeService();

      await service.getTrailRoute("trail-b");

      expect(geocodePlace).toHaveBeenCalledWith("head-b");
      expect(geocodePlace).toHaveBeenCalledWith("peak-b");
      expect(getWalkingRoute).toHaveBeenCalledWith(makePlace("head-b"), makePlace("peak-b"));
    });

    it("should cache the built route and does not re-fetch on subsequent calls", async () => {
      const { service, geocodePlace, getWalkingRoute } = makeService();

      const first = await service.getTrailRoute("trail-a");
      const second = await service.getTrailRoute("trail-a");

      expect(second).toEqual(first);
      expect(geocodePlace).toHaveBeenCalledTimes(2);
      expect(getWalkingRoute).toHaveBeenCalledTimes(1);
    });

    it("should propagate a not ok route status without an error", async () => {
      const { service } = makeService({
        getWalkingRoute: () =>
          Promise.resolve({ status: "NoRoute", distanceMeters: null, durationSeconds: null, geometry: null }),
      });

      const result = await service.getTrailRoute("trail-a");

      expect(result?.routeStatus).toBe("NoRoute");
      expect(result?.distanceMeters).toBeNull();
    });
  });

  describe("getAllTrailRoutes", () => {
    it("should return a built route for every known trail", async () => {
      const { service } = makeService();

      const routes = await service.getAllTrailRoutes();

      expect(routes.map((route) => route.id)).toEqual(["trail-a", "trail-b"]);
    });

    it("should return an empty array when there are no trails", async () => {
      const { service } = makeService({ trails: [] });

      const routes = await service.getAllTrailRoutes();

      expect(routes).toEqual([]);
    });
  });
});
