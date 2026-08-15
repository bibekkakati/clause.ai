import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
    // Server Config
    NODE_ENV: z.enum(["development", "production", "test"]),
    PORT: z.coerce.number(),
    ALLOW_DOMAINS: z.string().optional(),

    // Database Config
    DB_HOST: z.string().min(1, "DB_HOST is required"),
    DB_PORT: z.coerce.number(),
    DB_USER: z.string().min(1, "DB_USER is required"),
    DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),
    DB_NAME: z.string().min(1, "DB_NAME is required"),

    // Redis Config
    REDIS_URL: z.string().min(1, "REDIS_URL is required"),
    REDIS_MQ_URL: z.string().min(1, "REDIS_MQ_URL is required"),

    // Auth Config
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    JWT_EXPIRES_IN: z.string(),
    SESSION_TTL_DAYS: z.coerce.number(),

    // OTP Config
    DEVELOPMENT_OTP: z.string().optional(),
    OTP_RETRY_LIMIT: z.coerce.number(),
    OTP_EXPIRY_MINUTES: z.coerce.number(),

    // S3 Storage Config
    S3_ENDPOINT: z.string().url("Invalid S3_ENDPOINT URL"),
    S3_ACCESS_KEY: z.string().min(1, "S3_ACCESS_KEY is required"),
    S3_SECRET_KEY: z.string().min(1, "S3_SECRET_KEY is required"),
    FILES_BUCKET: z.string().min(1, "FILES_BUCKET is required"),

    // AI Config
    GOOGLE_API_KEY: z.string().min(1, "GOOGLE_API_KEY is required"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    process.stderr.write(
        `❌ Missing environment variables: ${JSON.stringify(_env.error.format(), null, 2)}\n`,
    );
    process.exit(1);
}

export const env = _env.data;
