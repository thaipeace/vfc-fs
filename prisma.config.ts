import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use DIRECT_URL (bypasses PgBouncer) for migrate/generate.
    // Runtime queries go through PgBouncer via DATABASE_URL set in PrismaClient constructor.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"]!,
  },
});
