process.env.TZ = "UTC";

import "@/config/env.config";
import { startServer } from "@/server";

startServer();
