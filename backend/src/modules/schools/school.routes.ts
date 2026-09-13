import { Router } from "express";
import { create, list } from "./school.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.post("/", create);
router.get("/", list);

export default router;
