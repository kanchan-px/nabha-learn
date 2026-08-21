import { Router } from "express";
import { create, getForLesson, submit } from "./quiz.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post("/", authorize("ADMIN", "TEACHER"), create);
router.get("/", getForLesson);
router.post("/submit", submit);

export default router;
