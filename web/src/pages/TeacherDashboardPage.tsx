import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCourses } from "../api/courses.api";
import type { Course } from "../api/courses.api";
import AppLayout from "../components/AppLayout";

function TeacherDashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Your Courses</h1>
        <Link
          to="/courses/new"
          className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          + Create Course
        </Link>
      </div>

      {isLoading && <p className="text-slate-500">Loading courses...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!isLoading && !error && courses.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-500">
          No courses yet. Create your first one to get started.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`/courses/${course.id}`}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-teal-300 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <h2 className="font-semibold text-slate-900">{course.title}</h2>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${
                  course.isPublished ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {course.isPublished ? "Published" : "Draft"}
              </span>
            </div>
            {course.description && (
              <p className="text-sm text-slate-500 line-clamp-2">{course.description}</p>
            )}
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}

export default TeacherDashboardPage;
