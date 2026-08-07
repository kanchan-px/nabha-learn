import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import courseRoutes from "./modules/courses/course.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);

export default app;
