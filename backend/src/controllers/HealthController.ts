import { Controller, Get, Route, Tags } from "tsoa";

interface HealthResponse {
  status: "ok";
}

@Route("api/health")
@Tags("System")
export class HealthController extends Controller {
  @Get()
  public getHealth(): HealthResponse {
    return { status: "ok" };
  }
}
