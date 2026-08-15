import { requestOtp, verifyOtp, logout } from "@/controllers/auth.controller";
import { Router } from "express";

const router = Router();

router.post("/otp/request", requestOtp);
router.post("/otp/verify", verifyOtp);
router.post("/logout", logout);

export default router;
