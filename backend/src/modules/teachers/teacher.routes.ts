import { Router } from "express";
import { create, list, update } from "./teacher.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.post("/", create);
router.get("/", list);
router.patch("/:teacherId", update);

export default router;
