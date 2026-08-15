import { env } from "@/config/env.config";
import { closeDatabaseConnection } from "@/infra/db.client";
import { closeRedisConnection } from "@/infra/redis.client";
import { authorize } from "@/middlewares/auth.middleware";
import { correlationMiddleware } from "@/middlewares/correlation.middleware";
import cors from "@/middlewares/cors.middleware";
import RateLimiter from "@/middlewares/ratelimiter.middleware";
import { closeMessageQueue } from "@/queues/message.queue";
import {
    closeSchedulerQueue,
    scheduleFileCleanup,
} from "@/queues/scheduler.queue";
import agreementRoutes from "@/routes/agreement.routes";
import authRoutes from "@/routes/auth.routes";
import fileRoutes from "@/routes/file.routes";
import userRoutes from "@/routes/user.routes";
import { httpLogger, logger } from "@/utils/logger.util";
import {
    closeMessageWorker,
    initMessageWorker,
} from "@/workers/message.worker";
import {
    closeSchedulerWorker,
    initSchedulerWorker,
} from "@/workers/scheduler.worker";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";

export const startServer = () => {
    const app = express();
    app.use(cors);
    app.use(helmet());
    app.use(correlationMiddleware);
    app.use(httpLogger);
    app.use(express.json());
    app.use("/api", (req, res, next) => {
        res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, private",
        );
        next();
    });

    app.get("/", (req: Request, res: Response) => {
        return res.status(200).send("Welcome to Clause AI");
    });

    // ================== API Routes ==================
    app.use("/api/auth", RateLimiter.auth, authRoutes);
    app.use("/api/user", authorize, RateLimiter.api, userRoutes);
    app.use("/api/files", authorize, RateLimiter.api, fileRoutes);
    app.use("/api/agreement", authorize, RateLimiter.api, agreementRoutes);

    // Global "Route Not Found" (404) Catch-All Middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
        res.status(404).send("Route not found");
    });

    // Global Error Handling Middleware (500)
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
        logger.error(err.message);
        res.status(500).json({
            message: "Internal server error",
            error: "Internal server error",
        });
    });

    // Run server
    const server = app.listen(env.PORT || 3000, () => {
        logger.info(`Clause AI is running on port ${env.PORT}`);

        // Initialize worker
        initMessageWorker();
        initSchedulerWorker();

        // Register cron job
        scheduleFileCleanup();
    });

    // ================== Server Timeout Configurations ==================
    // 1. requestTimeout:
    // Max time allowed to receive the entire request (headers + body).
    server.requestTimeout = 30 * 1000; // 30 seconds

    // 2. keepAliveTimeout:
    // Max idle time to keep keep-alive connections alive.
    // Must be greater than the upstream Load Balancer / Reverse Proxy idle timeout.
    server.keepAliveTimeout = 65 * 1000; // 65 seconds

    // 3. headersTimeout:
    // Max time allowed to parse HTTP headers.
    // Node.js enforces that headersTimeout MUST be strictly greater than keepAliveTimeout.
    server.headersTimeout = 70 * 1000; // 70 seconds

    // 4. Socket inactivity timeout
    // 0 delegates connection timeouts to requestTimeout and headersTimeout
    server.setTimeout(0);

    // Shutdown handler
    function gracefulShutdown(signal: "SIGTERM" | "SIGINT") {
        logger.info(`${signal} received. Starting graceful shutdown...`);

        // Close database
        closeDatabaseConnection();
        closeRedisConnection();

        // Close queues
        closeMessageQueue();
        closeSchedulerQueue();

        // Close workers
        closeMessageWorker();
        closeSchedulerWorker();

        // Stop accepting new connections
        server.close(() => {
            logger.info("HTTP server closed.");
            process.exit(0);
        });

        // Force shutdown if it takes too long
        setTimeout(() => {
            logger.error(
                "Could not close connections in time, forcefully shutting down",
            );
            process.exit(1);
        }, 10000);
    }

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
};
