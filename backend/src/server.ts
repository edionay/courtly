import { app } from "./app";
import { readPort } from "./settings";

const port = readPort(process.env.PORT);

app.listen(port, "0.0.0.0", () => {
  const publicPort = process.env.COURTLY_API_HOST_PORT ?? port;

  console.info(
    [
      "Courtly API is ready:",
      `  API: http://localhost:${publicPort}`,
      `  Health: http://localhost:${publicPort}/api/health`,
      `  Swagger: http://localhost:${publicPort}/api/docs`,
      `  OpenAPI: http://localhost:${publicPort}/api/openapi.json`,
    ].join("\n"),
  );
});
