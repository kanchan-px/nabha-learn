import { Router } from "express";
import { create, list, getOne, update } from "./course.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";

const router = Router();

router.use(authenticate);

router.post("/", authorize("ADMIN", "TEACHER"), create);
router.get("/", list);
router.get("/:courseId", getOne);
router.patch("/:courseId", authorize("ADMIN", "TEACHER"), update);

export default router;
