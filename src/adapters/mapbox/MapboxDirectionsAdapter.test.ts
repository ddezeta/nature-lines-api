import { MapboxDirectionsAdapter } from "./MapboxDirectionsAdapter";
import type { MapboxClient } from "./MapboxClient";
import type { Coordinate } from "../../types/trail";

function makeClient(response: unknown) {
  return { get: jest.fn().mockResolvedValue(response) } as unknown as MapboxClient;
}

const from: Coordinate = { longitude: -105.1, latitude: 39.7 };
const to: Coordinate = { longitude: -105.2, latitude: 39.8 };

describe("MapboxDirectionsAdapter", () => {
  it("should request the walking route using the coordinate path and geojson options", async () => {
    const client = makeClient({ code: "Ok", routes: [{ geometry: { type: "LineString", coordinates: [] }, distance: 1, duration: 1 }] });
    const adapter = new MapboxDirectionsAdapter(client);

    await adapter.getWalkingRoute(from, to);

    expect(client.get).toHaveBeenCalledWith(
      "/directions/v5/mapbox/walking/-105.1,39.7;-105.2,39.8",
      { geometries: "geojson", overview: "full" },
    );
  });

  it("should map a successful WalkingRouteResult response", async () => {
    const geometry = { type: "LineString" as const, coordinates: [[1, 2], [3, 4]] };
    const client = makeClient({ code: "Ok", routes: [{ geometry, distance: 4200, duration: 3600 }] });
    const adapter = new MapboxDirectionsAdapter(client);

    const result = await adapter.getWalkingRoute(from, to);

    expect(result).toEqual({
      status: "Ok",
      distanceMeters: 4200,
      durationSeconds: 3600,
      geometry,
    });
  });

  it("should return a null-valued result when the status code is not Ok", async () => {
    const client = makeClient({ code: "NoRoute", routes: [] });
    const adapter = new MapboxDirectionsAdapter(client);

    const result = await adapter.getWalkingRoute(from, to);

    expect(result).toEqual({ status: "NoRoute", distanceMeters: null, durationSeconds: null, geometry: null });
  });

  it("should return a null-valued result when Ok but no route is present", async () => {
    const client = makeClient({ code: "Ok", routes: [] });
    const adapter = new MapboxDirectionsAdapter(client);

    const result = await adapter.getWalkingRoute(from, to);

    expect(result).toEqual({ status: "Ok", distanceMeters: null, durationSeconds: null, geometry: null });
  });
});
