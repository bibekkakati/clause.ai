import {
    getFileDownloadUrl,
    getFileUploadUrl,
    processFile,
    getUserFiles,
} from "@/controllers/file.controller";
import { Router } from "express";

const router = Router();

router.get("/upload/url", getFileUploadUrl);
router.get("/download/url", getFileDownloadUrl);
router.post("/process", processFile);
router.get("/", getUserFiles);

export default router;
