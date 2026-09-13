import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getCourseProgress } from "../api/progress.api";
import type { CourseProgress } from "../api/progress.api";
import { getCourseById } from "../api/courses.api";

import AppLayout from "../components/AppLayout";

interface LessonLabel {
  id: string;
  title: string;
}

function statusStyle(status: string) {
  switch (status) {
    case "LESSON_COMPLETED":
      return "bg-emerald-50 text-emerald-700";

    case "LESSON_OPENED":
      return "bg-amber-50 text-amber-700";

    default:
      return "bg-slate-100 text-slate-400";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "LESSON_COMPLETED":
      return "Done";

    case "LESSON_OPENED":
      return "Started";

    default:
      return "Not Started";
  }
}

function CourseProgressPage() {
  const { courseId } = useParams<{ courseId: string }>();

  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [lessonLabels, setLessonLabels] = useState<LessonLabel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!courseId) return;

    const id = courseId;
    let ignore = false;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const [progressData, courseData] = await Promise.all([
          getCourseProgress(id),
          getCourseById(id),
        ]);

        if (ignore) return;

        const labels = (courseData.modules ?? []).flatMap((module) =>
          module.lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
          }))
        );

        setProgress(progressData);
        setLessonLabels(labels);
      } catch {
        if (!ignore) {
          setError("Failed to load progress.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [courseId]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-teal-700" />
            <p className="text-sm text-slate-500">Loading student progress...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !progress) {
    return (
      <AppLayout>
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
          <h2 className="text-lg font-semibold text-red-800">Unable to load progress</h2>

          <p className="mt-2 text-sm text-red-600">{error || "Progress data is unavailable."}</p>

          <Link
            to={`/courses/${courseId}`}
            className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            ← Back to Course
          </Link>
        </div>
      </AppLayout>
    );
  }

  const students = progress.progressGrid;
  const totalStudents = students.length;
  const totalLessons = lessonLabels.length;

  const totalPossibleLessons = totalStudents * totalLessons;

  const completedLessons = students.reduce(
    (total, student) =>
      total +
      student.lessonStatuses.filter((lesson) => lesson.status === "LESSON_COMPLETED").length,
    0
  );

  const startedLessons = students.reduce(
    (total, student) =>
      total + student.lessonStatuses.filter((lesson) => lesson.status === "LESSON_OPENED").length,
    0
  );

  const overallCompletion =
    totalPossibleLessons > 0 ? Math.round((completedLessons / totalPossibleLessons) * 100) : 0;

  return (
    <AppLayout>
      {/* Back navigation */}
      <Link
        to={`/courses/${courseId}`}
        className="mb-5 inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-teal-700"
      >
        ← Back to Course
      </Link>

      {/* Header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div>
          <p className="text-sm font-medium text-teal-700">Student Progress</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            {progress.course.title}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor lesson completion and student activity for this course.
          </p>
        </div>

        {/* Summary cards */}
        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ProgressStat label="Students" value={totalStudents} description="Enrolled students" />

          <ProgressStat label="Lessons" value={totalLessons} description="Course lessons" />

          <ProgressStat
            label="Completed"
            value={completedLessons}
            description="Lessons completed"
          />

          <ProgressStat
            label="Completion"
            value={`${overallCompletion}%`}
            description="Overall completion"
          />
        </div>
      </section>

      {/* No students */}
      {totalStudents === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-slate-900">No students found</h2>

          <p className="mt-2 text-sm text-slate-500">
            Student progress will appear here once students start accessing this course.
          </p>
        </div>
      ) : totalLessons === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-slate-900">This course has no lessons</h2>

          <p className="mt-2 text-sm text-slate-500">
            Add lessons to the course before tracking student progress.
          </p>
        </div>
      ) : (
        <>
          {/* Progress overview */}
          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Progress Overview</h2>

                <p className="mt-1 text-xs text-slate-500">
                  {completedLessons} completed · {startedLessons} started
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
                <LegendItem className="bg-emerald-50 text-emerald-700" label="Done" />

                <LegendItem className="bg-amber-50 text-amber-700" label="Started" />

                <LegendItem className="bg-slate-100 text-slate-500" label="Not Started" />
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-teal-600 transition-all"
                style={{ width: `${overallCompletion}%` }}
              />
            </div>

            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>Overall completion</span>
              <span>{overallCompletion}%</span>
            </div>
          </section>

          {/* Student table */}
          <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-slate-900">Student Activity</h2>

              <p className="mt-1 text-xs text-slate-500">
                Lesson-by-lesson completion status for each student.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-max text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="sticky left-0 z-10 min-w-[180px] bg-slate-50 px-5 py-3 text-left font-semibold text-slate-700">
                      Student
                    </th>

                    {lessonLabels.map((lesson, index) => (
                      <th
                        key={lesson.id}
                        className="min-w-[130px] max-w-[160px] px-4 py-3 text-left font-medium text-slate-600"
                      >
                        <div className="text-[11px] uppercase tracking-wide text-slate-400">
                          Lesson {index + 1}
                        </div>

                        <div className="mt-1 truncate text-sm text-slate-700">{lesson.title}</div>
                      </th>
                    ))}

                    <th className="sticky right-0 z-10 min-w-[110px] bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">
                      Progress
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {students.map(({ student, lessonStatuses }) => {
                    const completed = lessonLabels.filter((lesson) => {
                      const entry = lessonStatuses.find((status) => status.lessonId === lesson.id);

                      return entry?.status === "LESSON_COMPLETED";
                    }).length;

                    const studentCompletion =
                      totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

                    return (
                      <tr
                        key={student.id}
                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60"
                      >
                        <td className="sticky left-0 z-[1] bg-white px-5 py-4 font-medium text-slate-900">
                          <div>{student.name}</div>

                          <div className="mt-0.5 text-xs text-slate-400">{student.username}</div>
                        </td>

                        {lessonLabels.map((lesson) => {
                          const entry = lessonStatuses.find(
                            (status) => status.lessonId === lesson.id
                          );

                          const status = entry?.status ?? "NOT_STARTED";

                          return (
                            <td key={lesson.id} className="px-4 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${statusStyle(
                                  status
                                )}`}
                              >
                                {statusLabel(status)}
                              </span>
                            </td>
                          );
                        })}

                        <td className="sticky right-0 z-[1] bg-white px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-teal-600"
                                style={{
                                  width: `${studentCompletion}%`,
                                }}
                              />
                            </div>

                            <span className="text-xs font-semibold text-slate-700">
                              {studentCompletion}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </AppLayout>
  );
}

function ProgressStat({
  label,
  value,
  description,
}: {
  label: string;
  value: number | string;
  description: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>

      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>

      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return <span className={`rounded-full px-2.5 py-1 ${className}`}>{label}</span>;
}

export default CourseProgressPage;
