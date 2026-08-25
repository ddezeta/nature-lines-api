import type { Coordinate, WalkingRouteResult } from "../../types/trail";

export interface DirectionsPort {
  getWalkingRoute(from: Coordinate, to: Coordinate): Promise<WalkingRouteResult>;
}
