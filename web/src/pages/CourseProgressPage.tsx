import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
      return "bg-green-100 text-green-700";
    case "LESSON_OPENED":
      return "bg-amber-100 text-amber-700";
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
      return "—";
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
    let ignore = false;

    async function load() {
      try {
        const [progressData, courseData] = await Promise.all([
          getCourseProgress(courseId!),
          getCourseById(courseId!),
        ]);

        if (ignore) return;

        const labels = (courseData.modules ?? []).flatMap((m) =>
          m.lessons.map((l) => ({ id: l.id, title: l.title }))
        );

        setProgress(progressData);
        setLessonLabels(labels);
      } catch {
        if (!ignore) setError("Failed to load progress");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [courseId]);

  if (isLoading)
    return (
      <AppLayout>
        <p className="text-slate-500">Loading progress...</p>
      </AppLayout>
    );
  if (error || !progress)
    return (
      <AppLayout>
        <p className="text-red-600">{error}</p>
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <Link
            to={`/courses/${courseId}`}
            className="text-sm text-teal-700 hover:text-teal-800 mb-1 inline-block"
          >
            ← Back to course
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Progress — {progress.course.title}</h1>
        </div>
      </div>

      {progress.progressGrid.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-500">
          No students found.
        </div>
      ) : lessonLabels.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-500">
          This course has no lessons yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left font-semibold text-slate-700 px-4 py-3 sticky left-0 bg-white">
                  Student
                </th>
                {lessonLabels.map((lesson) => (
                  <th
                    key={lesson.id}
                    className="text-left font-medium text-slate-600 px-4 py-3 whitespace-nowrap max-w-[160px]"
                  >
                    {lesson.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {progress.progressGrid.map(({ student, lessonStatuses }) => (
                <tr key={student.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3 font-medium text-slate-900 sticky left-0 bg-white whitespace-nowrap">
                    {student.name}
                  </td>
                  {lessonLabels.map((lesson) => {
                    const entry = lessonStatuses.find((ls) => ls.lessonId === lesson.id);
                    const status = entry?.status ?? "NOT_STARTED";
                    return (
                      <td key={lesson.id} className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${statusStyle(status)}`}
                        >
                          {statusLabel(status)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}

export default CourseProgressPage;
