import { getProfile } from "@/controllers/user.controller";
import { Router } from "express";

const router = Router();

router.get("/me", getProfile);

export default router;
