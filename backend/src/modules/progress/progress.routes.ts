import { Router } from "express";
import { create, getStatus } from "./progress.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";

const router = Router({ mergeParams: true });

router.post("/", authenticate, authorize("STUDENT"), create);
router.get("/", authenticate, authorize("STUDENT"), getStatus);

export default router;
