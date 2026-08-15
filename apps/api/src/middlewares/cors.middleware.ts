import { env } from "@/config/env.config";
import cors, { CorsRequest } from "cors";

const isProduction = env.NODE_ENV === "production";

const allowlist: Record<string, boolean> = {};
if (env.ALLOW_DOMAINS) {
    env.ALLOW_DOMAINS.split(",").forEach((domain) => {
        allowlist[domain.trim()] = true;
    });
}

/**
 * CORS options delegate function that dynamically configures CORS settings based on the request origin.
 * In production, only allows origins from the allowlist. In non-production environments, allows all origins.
 *
 * @param {Object} req - The HTTP request object containing origin information in headers.
 * @param {Function} callback - Callback function that receives error and CORS options. Signature: callback(error, options).
 * @returns {void} Invokes the callback with CORS configuration options.
 */
const corsOptionsDelegate = function (req: CorsRequest, callback: Function) {
    const corsOptions = {
        origin: false,
        maxAge: 86400,
        credentials: true,
    };

    const origin = req.headers.origin;

    corsOptions.origin = isProduction && origin ? allowlist[origin] : true;
    callback(null, corsOptions); // callback expects two parameters: error and options
};

export default cors(corsOptionsDelegate);
