import { Router } from "express";
import { login, getMe } from "./auth.controller";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

router.post("/login", login);
router.get("/me", authenticate, getMe);

export default router;
