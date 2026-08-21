import { Router } from "express";
import { getForCourse } from "./progress.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";

const router = Router({ mergeParams: true });

router.get("/", authenticate, authorize("ADMIN", "TEACHER"), getForCourse);

export default router;
