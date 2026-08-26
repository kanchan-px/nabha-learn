import { useEffect, useState } from "react";
import { getCourses } from "../api/courses.api";
import type { Course } from "../api/courses.api";
import { useAuth } from "../context/useAuth";
import { Link } from "react-router-dom";

function TeacherDashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const { user, logout } = useAuth();

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch {
        setError("Failed to load courses");
      } finally {
        setIsLoading(false);
      }
    }

    loadCourses();
  }, []);

  return (
    <div>
      <header>
        <h1>Nabha Learn — Teacher Dashboard</h1>
        <p>Welcome, {user?.name}</p>
        <button onClick={logout}>Log Out</button>
      </header>

      <h2>Your Courses</h2>
      <Link to="/courses/new">+ Create New Course</Link>

      {isLoading && <p>Loading courses...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!isLoading && !error && courses.length === 0 && <p>No courses yet.</p>}

      <ul>
        {courses.map((course) => (
          <li key={course.id}>
            <Link to={`/courses/${course.id}`}>{course.title}</Link> —{" "}
            {course.isPublished ? "Published" : "Draft"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TeacherDashboardPage;
