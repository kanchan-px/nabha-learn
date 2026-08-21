import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import courseRoutes from "./modules/courses/course.routes";
import moduleRoutes from "./modules/curriculum/module.routes";
import lessonRoutes from "./modules/curriculum/lesson.routes";
import quizRoutes from "./modules/quiz/quiz.routes";
import progressRoutes from "./modules/progress/progress.routes";
import courseProgressRoutes from "./modules/progress/courseProgress.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses/:courseId/modules", moduleRoutes);
app.use("/api/modules/:moduleId/lessons", lessonRoutes);
app.use("/api/lessons/:lessonId/quiz", quizRoutes);
app.use("/api/lessons/:lessonId/progress", progressRoutes);
app.use("/api/courses/:courseId/progress", courseProgressRoutes);
app.use("/api/courses", courseRoutes);

export default app;
