import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";

import { getCourseById, updateCourse } from "../api/courses.api";
import type { Course } from "../api/courses.api";
import { createModule, createLesson } from "../api/curriculum.api";
import { checkQuizExists } from "../api/quiz.api";

import AppLayout from "../components/AppLayout";
import CreateQuizModal from "../components/CreateQuizModal";

function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshIndex, setRefreshIndex] = useState(0);

  const [quizModalLesson, setQuizModalLesson] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const [lessonsWithQuiz, setLessonsWithQuiz] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!courseId) return;

    const id = courseId;
    let ignore = false;

    async function fetchCourse() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getCourseById(id);

        if (!ignore) {
          setCourse(data);
        }
      } catch {
        if (!ignore) {
          setError("Failed to load course.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchCourse();

    return () => {
      ignore = true;
    };
  }, [courseId, refreshIndex]);

  useEffect(() => {
    if (!course) return;

    const allLessons = (course.modules ?? []).flatMap((module) => module.lessons);

    async function checkAllQuizzes() {
      const results = await Promise.all(
        allLessons.map(async (lesson) => ({
          id: lesson.id,
          hasQuiz: await checkQuizExists(lesson.id),
        }))
      );

      setLessonsWithQuiz(
        new Set(results.filter((result) => result.hasQuiz).map((result) => result.id))
      );
    }

    checkAllQuizzes();
  }, [course]);

  function refresh() {
    setRefreshIndex((index) => index + 1);
  }

  async function handleTogglePublish() {
    if (!course) return;

    setError("");

    try {
      await updateCourse(course.id, {
        isPublished: !course.isPublished,
      });

      refresh();
    } catch {
      setError("Failed to update publish status.");
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-teal-700" />
            <p className="text-sm text-slate-500">Loading course...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error && !course) {
    return (
      <AppLayout>
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
          <h2 className="text-lg font-semibold text-red-800">Unable to load course</h2>

          <p className="mt-2 text-sm text-red-600">{error}</p>

          <Link
            to="/dashboard"
            className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </AppLayout>
    );
  }

  if (!course) {
    return (
      <AppLayout>
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center">
          <h2 className="text-lg font-semibold text-slate-900">Course not found</h2>

          <Link
            to="/dashboard"
            className="mt-4 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </AppLayout>
    );
  }

  const modules = course.modules ?? [];

  const totalLessons = modules.reduce((total, module) => total + module.lessons.length, 0);

  const totalQuizzes = modules.reduce(
    (total, module) =>
      total + module.lessons.filter((lesson) => lessonsWithQuiz.has(lesson.id)).length,
    0
  );

  return (
    <AppLayout>
      {/* Back navigation */}
      <Link
        to="/dashboard"
        className="mb-5 inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-teal-700"
      >
        ← Back to Dashboard
      </Link>

      {/* Course Header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  course.isPublished
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {course.isPublished ? "Published" : "Draft"}
              </span>

              {course.gradeLevel && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  Grade {course.gradeLevel}
                </span>
              )}

              {course.language && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {course.language === "en" ? "English" : course.language}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{course.title}</h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              {course.description || "No description added for this course yet."}
            </p>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              to={`/courses/${course.id}/progress`}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              View Progress
            </Link>

            <button
              onClick={handleTogglePublish}
              className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                course.isPublished
                  ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                  : "bg-teal-700 text-white hover:bg-teal-800"
              }`}
            >
              {course.isPublished ? "Unpublish" : "Publish Course"}
            </button>
          </div>
        </div>

        {/* Course summary */}
        <div className="mt-7 grid grid-cols-1 gap-3 border-t border-slate-100 pt-6 sm:grid-cols-3">
          <SummaryItem label="Modules" value={modules.length} />
          <SummaryItem label="Lessons" value={totalLessons} />
          <SummaryItem label="Quizzes" value={totalQuizzes} />
        </div>
      </section>

      {/* Error banner */}
      {error && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Course Content */}
      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900">Course Content</h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage modules, lessons and quizzes for this course.
          </p>
        </div>

        {modules.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <h3 className="text-lg font-semibold text-slate-900">No modules yet</h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Start building this course by adding your first module below.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {modules.map((module, moduleIndex) => (
              <div
                key={module.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                {/* Module Header */}
                <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-sm font-bold text-teal-700">
                      {moduleIndex + 1}
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">{module.title}</h3>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {module.lessons.length} {module.lessons.length === 1 ? "lesson" : "lessons"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lessons */}
                <div className="px-5">
                  {module.lessons.length === 0 ? (
                    <div className="py-6 text-sm text-slate-500">
                      No lessons in this module yet.
                    </div>
                  ) : (
                    <div>
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="flex flex-col gap-3 border-b border-slate-100 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex min-w-0 items-start gap-3">
                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-600">
                              {lessonIndex + 1}
                            </span>

                            <div className="min-w-0">
                              <p className="font-medium text-slate-800">{lesson.title}</p>

                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                {lesson.bodyText && <span>Text content</span>}

                                {lesson.videoUrl && <span>Video available</span>}

                                {lesson.pdfUrl && <span>PDF available</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-3 pl-10 sm:pl-0">
                            {lessonsWithQuiz.has(lesson.id) ? (
                              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                Quiz Added ✓
                              </span>
                            ) : (
                              <button
                                onClick={() =>
                                  setQuizModalLesson({
                                    id: lesson.id,
                                    title: lesson.title,
                                  })
                                }
                                className="text-xs font-semibold text-teal-700 transition hover:text-teal-800"
                              >
                                + Add Quiz
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Lesson */}
                  <AddLessonForm moduleId={module.id} onLessonAdded={refresh} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Module */}
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900">Add a new module</h3>

            <p className="mt-1 text-xs text-slate-500">
              Organize lessons into a new section of this course.
            </p>
          </div>

          <AddModuleForm courseId={course.id} onModuleAdded={refresh} />
        </div>
      </section>

      {/* Quiz Modal */}
      {quizModalLesson && (
        <CreateQuizModal
          lessonId={quizModalLesson.id}
          lessonTitle={quizModalLesson.title}
          onClose={() => setQuizModalLesson(null)}
          onCreated={refresh}
        />
      )}
    </AppLayout>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>

      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function AddModuleForm({
  courseId,
  onModuleAdded,
}: {
  courseId: string;
  onModuleAdded: () => void;
}) {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!title.trim()) return;

    setIsSubmitting(true);

    try {
      await createModule(courseId, {
        title: title.trim(),
      });

      setTitle("");
      onModuleAdded();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="text"
        placeholder="e.g. Introduction to Fractions"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Adding..." : "Add Module"}
      </button>
    </form>
  );
}

function AddLessonForm({
  moduleId,
  onLessonAdded,
}: {
  moduleId: string;
  onLessonAdded: () => void;
}) {
  const [title, setTitle] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!title.trim()) return;

    setIsSubmitting(true);

    try {
      await createLesson(moduleId, {
        title: title.trim(),
        bodyText: bodyText.trim() || undefined,
      });

      setTitle("");
      setBodyText("");
      onLessonAdded();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 border-t border-slate-100 py-4 sm:flex-row"
    >
      <input
        type="text"
        placeholder="New lesson title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
      />

      <input
        type="text"
        placeholder="Lesson text (optional)"
        value={bodyText}
        onChange={(e) => setBodyText(e.target.value)}
        className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Adding..." : "Add Lesson"}
      </button>
    </form>
  );
}

export default CourseDetailPage;
