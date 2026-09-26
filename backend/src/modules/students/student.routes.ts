import { Router } from "express";
import { create, list, update } from "./student.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";

const router = Router();

router.use(authenticate, authorize("TEACHER"));

router.post("/", create);
router.get("/", list);
router.patch("/:studentId", update);

export default router;
