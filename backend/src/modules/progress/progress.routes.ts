import { Router } from "express";
import { create } from "./progress.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";

const router = Router({ mergeParams: true });

router.post("/", authenticate, authorize("STUDENT"), create);

export default router;
