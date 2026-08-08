import { Router } from "express";
import { addModule } from "./curriculum.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";

const router = Router({ mergeParams: true });

router.post("/", authenticate, authorize("ADMIN", "TEACHER"), addModule);

export default router;
