import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não definida.");
}

const databaseUrl = new URL(connectionString);
const isLocalDatabase =
  databaseUrl.hostname === "localhost" ||
  databaseUrl.hostname === "127.0.0.1";

const adapter = new PrismaPg({
  connectionString,
  ...(isLocalDatabase
    ? {}
    : {
        ssl: {
          rejectUnauthorized: false,
        },
      }),
});

export const prisma = new PrismaClient({ adapter });