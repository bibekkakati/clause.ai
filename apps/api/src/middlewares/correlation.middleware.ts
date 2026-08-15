import { asyncLocalStorage } from "@/utils/context.util";
import { generateUUIDv7 } from "@/utils/id.util";
import { NextFunction, Request, Response } from "express";

/**
 * Express middleware that extracts or generates a correlationId and sets up AsyncLocalStorage context for the request lifecycle.
 */
export const correlationMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    const correlationId =
        (req.headers["x-correlation-id"] as string) ||
        (req.headers["x-request-id"] as string) ||
        generateUUIDv7();

    res.setHeader("x-correlation-id", correlationId);

    const store = {
        correlationId,
        userId: req.user?.userId,
    };

    asyncLocalStorage.run(store, () => {
        next();
    });
};
