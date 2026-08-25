import { Controller, Get, Path, Route, Tags } from "tsoa";
import { trailService } from "../../../composition/container";
import { createHttpError } from "../../../errors";
import type { TrailRoute } from "../../../types/trail";

@Route("trails")
@Tags("Trails")
export class TrailsController extends Controller {
  @Get()
  public async getTrails(): Promise<TrailRoute[]> {
    return trailService.getAllTrailRoutes();
  }

  @Get("{id}")
  public async getTrail(@Path() id: string): Promise<TrailRoute> {
    const trail = await trailService.getTrailRoute(id);
    if (!trail) {
      throw createHttpError(404, `Trail not found: ${id}`);
    }
    return trail;
  }
}
