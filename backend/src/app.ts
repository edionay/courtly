import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../generated/swagger.json";
import { RegisterRoutes } from "../generated/routes";
import { errorHandler } from "./errors/errorHandler";

export const app = express();

app.use(express.json());
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(undefined, {
  swaggerOptions: { url: "/api/openapi.json" },
}));
app.get("/api/openapi.json", (_request, response) => response.json(swaggerDocument));
RegisterRoutes(app);
app.use(errorHandler);
