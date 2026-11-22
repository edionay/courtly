import { app } from "./app";
import { readPort } from "./settings";

const port = readPort(process.env.PORT);

app.listen(port, "0.0.0.0", () => {
  console.info(`Courtly API listening on port ${port}`);
});
