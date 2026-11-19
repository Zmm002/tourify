import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Beri Prisma lokasi schema, folder migrasi, dan URL database dari .env.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
