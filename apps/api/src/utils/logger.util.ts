import { getContext, getCorrelationId } from "@/utils/context.util";
import pino from "pino";
import pinoHttp from "pino-http";
import { generateUUIDv7 } from "./id.util";

const isProduction = process.env.NODE_ENV === "production";

const sensitivePaths = [
    "req.headers.authorization",
    "req.headers.cookie",
    "req.headers['x-access-token']",
    "req.headers['x-auth-token']",
    "res.headers['x-access-token']",
    "res.headers['x-auth-token']",
    "res.headers['set-cookie']",
];

export const logger = pino({
    level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
    mixin() {
        const ctx = getContext();
        if (!ctx) return {};
        const mixinObj: Record<string, any> = {};
        if (ctx.correlationId) mixinObj.correlationId = ctx.correlationId;
        if (ctx.userId) mixinObj.userId = ctx.userId;
        return mixinObj;
    },
    redact: {
        paths: sensitivePaths,
        censor: "[REDACTED]",
    },
    transport: !isProduction
        ? {
              target: "pino-pretty",
              options: {
                  colorize: true,
                  translateTime: "SYS:standard",
                  ignore: "pid,hostname",
              },
          }
        : undefined,
});

export const httpLogger = pinoHttp({
    logger,
    redact: {
        paths: sensitivePaths,
        censor: "[REDACTED]",
    },
    genReqId: (req, res) => {
        const correlationId =
            getCorrelationId() ||
            (req.headers["x-correlation-id"] as string) ||
            (req.headers["x-request-id"] as string) ||
            generateUUIDv7();

        res.setHeader("x-correlation-id", correlationId);
        return correlationId;
    },
    serializers: {
        req(req) {
            return {
                id: req.id,
                method: req.method,
                url: req.url,
                query: req.query,
                remoteAddress: req.remoteAddress,
            };
        },
        res(res) {
            return {
                statusCode: res.statusCode,
            };
        },
    },
    quietReqLogger: true,
});
