import { execFileSync } from "node:child_process";
import path from "node:path";

const databaseUrl = process.env.COURTLY_TEST_DATABASE_URL;
if (!databaseUrl) {
  throw new Error("COURTLY_TEST_DATABASE_URL must point to the isolated courtly_test database");
}

const parsedUrl = new URL(databaseUrl);
if (parsedUrl.pathname !== "/courtly_test") {
  throw new Error("Integration migrations are restricted to the courtly_test database");
}

execFileSync("npx", ["prisma", "migrate", "deploy"], {
  cwd: path.resolve(__dirname, ".."),
  env: { ...process.env, DATABASE_URL: databaseUrl },
  stdio: "inherit",
});
