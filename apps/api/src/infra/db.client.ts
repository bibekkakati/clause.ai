import { env } from "@/config/env.config";
import { logger } from "@/utils/logger.util";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const MIN_POOL_SIZE = 5;
const MAX_POOL_SIZE = 20;

const { Pool } = pg;

const pool = new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    ssl: {
        rejectUnauthorized: false,
    },
    max: MAX_POOL_SIZE,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    keepAlive: true, // TCP keepalive
    keepAliveInitialDelayMillis: 10000,
});

export const closeDatabaseConnection = () => pool.end();

export const db = drizzle({ client: pool });

// Pool create a new client on the next query.
pool.on("error", (err) => {
    logger.error(err, "Unexpected error on idle client");
});

const warmPool = async (count: number) => {
    const clients = await Promise.all(
        Array.from({ length: count }, () => pool.connect()),
    );
    clients.forEach((client) => client.release());
    logger.info(`Warmed up ${count} database connections`);
};

const init = async (retries = 5, delayMs = 1000): Promise<void> => {
    try {
        await warmPool(MIN_POOL_SIZE);
        logger.info("Database client connected successfully");
    } catch (error: any) {
        logger.error(error.message, "Failed to connect to database");
        if (retries > 0) {
            await new Promise((r) => setTimeout(r, delayMs));
            return init(retries - 1, delayMs * 2);
        }
        throw error;
    }
};

init();
