import { defineConfig } from "drizzle-kit";
import { env } from "./src/config/env.config";

const DB_HOST = env.DB_HOST;
const DB_PORT = env.DB_PORT;
const DB_USER = env.DB_USER;
const DB_PASSWORD = env.DB_PASSWORD;
const DB_NAME = env.DB_NAME;

export default defineConfig({
    out: ".drizzle",
    schema: "./src/db/schema",
    dialect: "postgresql",
    dbCredentials: {
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: decodeURIComponent(DB_PASSWORD),
        database: DB_NAME,
        ssl: {
            rejectUnauthorized: false,
        },
    },
});
