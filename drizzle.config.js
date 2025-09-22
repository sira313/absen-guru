import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/server/schema.js",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./absen.db",
  },
  verbose: true,
  strict: true,
});
