import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import TeacherDashboardPage from "./pages/TeacherDashboardPage";
import CreateCoursePage from "./pages/CreateCoursePage";
import ProtectedRoute from "./components/ProtectedRoute";
import CourseDetailPage from "./pages/CourseDetailPage";
import CourseProgressPage from "./pages/CourseProgressPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["TEACHER", "ADMIN"]}>
            <TeacherDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/new"
        element={
          <ProtectedRoute allowedRoles={["TEACHER", "ADMIN"]}>
            <CreateCoursePage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route
        path="/courses/:courseId"
        element={
          <ProtectedRoute allowedRoles={["TEACHER", "ADMIN"]}>
            <CourseDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId/progress"
        element={
          <ProtectedRoute allowedRoles={["TEACHER", "ADMIN"]}>
            <CourseProgressPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
