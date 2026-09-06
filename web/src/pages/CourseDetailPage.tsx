import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useParams } from "react-router-dom";
import { getCourseById, updateCourse } from "../api/courses.api";
import type { Course } from "../api/courses.api";
import { createModule, createLesson } from "../api/curriculum.api";
import AppLayout from "../components/AppLayout";
import CreateQuizModal from "../components/CreateQuizModal";
import { checkQuizExists } from "../api/quiz.api";

function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [quizModalLesson, setQuizModalLesson] = useState<{ id: string; title: string } | null>(
    null
  );
  const [lessonsWithQuiz, setLessonsWithQuiz] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!courseId) return;
    let ignore = false;

    async function fetchCourse() {
      setIsLoading(true);
      try {
        const data = await getCourseById(courseId!);
        if (!ignore) setCourse(data);
      } catch {
        if (!ignore) setError("Failed to load course");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    fetchCourse();

    return () => {
      ignore = true;
    };
  }, [courseId, refreshIndex]);

  useEffect(() => {
    if (!course) return;

    const allLessons = (course.modules ?? []).flatMap((m) => m.lessons);

    async function checkAll() {
      const results = await Promise.all(
        allLessons.map(async (lesson) => ({
          id: lesson.id,
          hasQuiz: await checkQuizExists(lesson.id),
        }))
      );
      setLessonsWithQuiz(new Set(results.filter((r) => r.hasQuiz).map((r) => r.id)));
    }

    checkAll();
  }, [course]);

  function refresh() {
    setRefreshIndex((i) => i + 1);
  }

  async function handleTogglePublish() {
    if (!course) return;
    try {
      await updateCourse(course.id, { isPublished: !course.isPublished });
      refresh();
    } catch {
      setError("Failed to update publish status");
    }
  }

  if (isLoading)
    return (
      <AppLayout>
        <p className="text-slate-500">Loading course...</p>
      </AppLayout>
    );
  if (error)
    return (
      <AppLayout>
        <p className="text-red-600">{error}</p>
      </AppLayout>
    );
  if (!course)
    return (
      <AppLayout>
        <p className="text-slate-500">Course not found.</p>
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
          <button
            onClick={handleTogglePublish}
            className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${
              course.isPublished
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {course.isPublished ? "Unpublish" : "Publish"}
          </button>
        </div>
        {course.description && <p className="text-slate-500 mt-1">{course.description}</p>}
      </div>

      <div className="space-y-4">
        {course.modules?.map((module) => (
          <div key={module.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-3">{module.title}</h3>
            <ul className="space-y-2 mb-4">
              {module.lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="text-sm text-slate-600 flex items-center justify-between gap-2 py-1.5 border-t border-slate-100 first:border-t-0"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                    {lesson.title}
                  </span>
                  {lessonsWithQuiz.has(lesson.id) ? (
                    <span className="text-xs text-green-700 font-medium">Quiz Added ✓</span>
                  ) : (
                    <button
                      onClick={() => setQuizModalLesson({ id: lesson.id, title: lesson.title })}
                      className="text-xs text-teal-700 hover:text-teal-800 font-medium"
                    >
                      + Add Quiz
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <AddLessonForm moduleId={module.id} onLessonAdded={refresh} />
          </div>
        ))}

        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-5">
          <AddModuleForm courseId={course.id} onModuleAdded={refresh} />
        </div>
      </div>
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
    setIsSubmitting(true);
    try {
      await createModule(courseId, { title });
      setTitle("");
      onModuleAdded();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder="New module title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors whitespace-nowrap"
      >
        Add Module
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
    setIsSubmitting(true);
    try {
      await createLesson(moduleId, { title, bodyText: bodyText || undefined });
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
      className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-100"
    >
      <input
        type="text"
        placeholder="New lesson title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
      />
      <input
        type="text"
        placeholder="Lesson text (optional)"
        value={bodyText}
        onChange={(e) => setBodyText(e.target.value)}
        className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors whitespace-nowrap"
      >
        Add Lesson
      </button>
    </form>
  );
}

export default CourseDetailPage;
