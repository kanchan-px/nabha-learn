import { Router } from "express";
import { create, getForLesson, submit, getForDownload } from "./quiz.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { submitOfflineResult } from "./quiz.controller";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post("/", authorize("ADMIN", "TEACHER"), create);
router.get("/", getForLesson);
router.post("/submit", submit);
router.get("/download", getForDownload);
router.post("/submit-offline-result", submitOfflineResult);

export default router;
