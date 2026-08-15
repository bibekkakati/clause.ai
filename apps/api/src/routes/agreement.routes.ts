import {
    getAgreementDetails,
    getChatMessages,
    getQueryResult,
    getUserAgreements,
    processAgreement,
    sendAgreementQuery,
} from "@/controllers/agreement.controller";
import RateLimiter from "@/middlewares/ratelimiter.middleware";
import { Router } from "express";

const router = Router();

router.get("/all", getUserAgreements);
router.get("/", getAgreementDetails);
router.get("/chat/messages", getChatMessages);
router.get("/query/result", getQueryResult);
router.post("/process", RateLimiter.ai, processAgreement);
router.post("/query", RateLimiter.ai, sendAgreementQuery);

export default router;
