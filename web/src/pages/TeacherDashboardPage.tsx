import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { getCourses, type Course } from "../api/courses.api";

function TeacherDashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourses() {
      try {
        setError("");
        const data = await getCourses();
        setCourses(data);
      } catch {
        setError("Failed to load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  const totalCourses = courses.length;
  const publishedCourses = courses.filter((course) => course.isPublished).length;
  const draftCourses = totalCourses - publishedCourses;

  const totalLessons = courses.reduce((total, course) => total + (course.lessonCount ?? 0), 0);

  return (
    <AppLayout>
      {/* Header */}
      <section className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-teal-700">Teacher Dashboard</p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1>

            <p className="mt-2 text-slate-600">
              Manage your courses, lessons, quizzes and student progress.
            </p>
          </div>

          <Link
            to="/courses/new"
            className="inline-flex items-center justify-center rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
          >
            + Create Course
          </Link>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      {!loading && !error && (
        <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Courses" value={totalCourses} description="All your courses" />

          <StatCard
            label="Published"
            value={publishedCourses}
            description="Available to students"
          />

          <StatCard label="Drafts" value={draftCourses} description="Not published yet" />

          <StatCard label="Total Lessons" value={totalLessons} description="Across all courses" />
        </section>
      )}

      {/* Courses */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Your Courses</h2>
            <p className="mt-1 text-sm text-slate-500">Create and manage your learning content.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-56 animate-pulse rounded-xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <h3 className="text-lg font-semibold text-slate-900">No courses yet</h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Create your first course and start adding modules, lessons and quizzes.
            </p>

            <Link
              to="/courses/new"
              className="mt-5 inline-flex rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>

      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>

      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Status */}
      <div className="flex items-start justify-between gap-3">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            course.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {course.isPublished ? "Published" : "Draft"}
        </span>

        {course.gradeLevel && (
          <span className="text-xs font-medium text-slate-500">Grade {course.gradeLevel}</span>
        )}
      </div>

      {/* Content */}
      <div className="mt-4 flex-1">
        <h3 className="text-lg font-bold text-slate-900">{course.title}</h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
          {course.description || "No description added yet."}
        </p>

        {/* Course stats */}
        <div className="mt-5 flex items-center gap-5 text-sm text-slate-600">
          <span>
            <strong className="text-slate-900">{course.moduleCount ?? 0}</strong>{" "}
            {course.moduleCount === 1 ? "Module" : "Modules"}
          </span>

          <span>
            <strong className="text-slate-900">{course.lessonCount ?? 0}</strong>{" "}
            {course.lessonCount === 1 ? "Lesson" : "Lessons"}
          </span>
        </div>
      </div>

      {/* Action */}
      <Link
        to={`/courses/${course.id}`}
        className="mt-6 flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-600 hover:bg-teal-50 hover:text-teal-700"
      >
        Manage Course →
      </Link>
    </div>
  );
}

export default TeacherDashboardPage;
