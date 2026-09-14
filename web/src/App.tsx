import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import TeacherDashboardPage from "./pages/TeacherDashboardPage";
import CreateCoursePage from "./pages/CreateCoursePage";
import ProtectedRoute from "./components/ProtectedRoute";
import CourseDetailPage from "./pages/CourseDetailPage";
import CourseProgressPage from "./pages/CourseProgressPage";
import AdminSchoolsPage from "./pages/AdminSchoolsPage";
import AdminTeachersPage from "./pages/AdminTeachersPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["TEACHER"]}>
            <TeacherDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/new"
        element={
          <ProtectedRoute allowedRoles={["TEACHER"]}>
            <CreateCoursePage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route
        path="/courses/:courseId"
        element={
          <ProtectedRoute allowedRoles={["TEACHER"]}>
            <CourseDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId/progress"
        element={
          <ProtectedRoute allowedRoles={["TEACHER"]}>
            <CourseProgressPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/schools"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminSchoolsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teachers"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminTeachersPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
