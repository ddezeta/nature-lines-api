import { isHttpError } from "../../../errors";
import type { TrailRoute } from "../../../types/trail";

const getAllTrailRoutes = jest.fn();
const getTrailRoute = jest.fn();

jest.mock("../../../composition/container", () => ({
  trailService: {
    getAllTrailRoutes: (...args: unknown[]) => getAllTrailRoutes(...args),
    getTrailRoute: (...args: unknown[]) => getTrailRoute(...args),
  },
}));

import { TrailsController } from "./TrailsController";

const sampleRoute: TrailRoute = {
  id: "mount-flora",
  name: "Mount Flora",
  trailhead: { query: "Berthoud Pass, CO", name: "Berthoud Pass", longitude: -105.7, latitude: 39.8 },
  peak: { query: "Mount Flora, CO", name: "Mount Flora", longitude: -105.7, latitude: 39.7 },
  routeStatus: "Ok",
  distanceMeters: 5000,
  durationSeconds: 3600,
  geometry: { type: "LineString", coordinates: [[1, 2]] },
};

beforeEach(() => {
  getAllTrailRoutes.mockReset();
  getTrailRoute.mockReset();
});

describe("TrailsController", () => {
  describe("getTrails", () => {
    it("should return all trail routes from the trail service", async () => {
      getAllTrailRoutes.mockResolvedValue([sampleRoute]);
      const controller = new TrailsController();

      const result = await controller.getTrails();

      expect(result).toEqual([sampleRoute]);
    });
  });

  describe("getTrail", () => {
    it("should return the trail route for a known id", async () => {
      getTrailRoute.mockResolvedValue(sampleRoute);
      const controller = new TrailsController();

      const result = await controller.getTrail("mount-flora");

      expect(getTrailRoute).toHaveBeenCalledWith("mount-flora");
      expect(result).toEqual(sampleRoute);
    });

    it("should throw a 404 http error when the trail is not found", async () => {
      getTrailRoute.mockResolvedValue(null);
      const controller = new TrailsController();

      let caught: unknown;
      try {
        await controller.getTrail("unknown");
      } catch (error) {
        caught = error;
      }

      expect(isHttpError(caught)).toBe(true);
      expect((caught as { status: number }).status).toBe(404);
      expect((caught as Error).message).toBe("Trail not found: unknown");
    });
  });
});
