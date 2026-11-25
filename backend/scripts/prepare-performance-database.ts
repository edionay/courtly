import { execFileSync } from "node:child_process";
import path from "node:path";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || new URL(databaseUrl).pathname !== "/courtly_performance") {
  throw new Error("Performance migrations are restricted to courtly_performance");
}
execFileSync("npx", ["prisma", "migrate", "deploy"], { cwd: path.resolve(__dirname, ".."), env: { ...process.env, DATABASE_URL: databaseUrl }, stdio: "inherit" });
