import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useParams } from "react-router-dom";
import { getCourseById, updateCourse } from "../api/courses.api";
import type { Course } from "../api/courses.api";
import { createModule, createLesson } from "../api/curriculum.api";

function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshIndex, setRefreshIndex] = useState(0);

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

  if (isLoading) return <p>Loading course...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!course) return <p>Course not found.</p>;

  return (
    <div>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      <p>Status: {course.isPublished ? "Published" : "Draft"}</p>
      <button onClick={handleTogglePublish}>{course.isPublished ? "Unpublish" : "Publish"}</button>

      <h2>Modules</h2>
      {course.modules?.map((module) => (
        <div
          key={module.id}
          style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}
        >
          <h3>{module.title}</h3>
          <ul>
            {module.lessons.map((lesson) => (
              <li key={lesson.id}>{lesson.title}</li>
            ))}
          </ul>
          <AddLessonForm moduleId={module.id} onLessonAdded={refresh} />
        </div>
      ))}

      <AddModuleForm courseId={course.id} onModuleAdded={refresh} />
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
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="New module title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <button type="submit" disabled={isSubmitting}>
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
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="New lesson title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Lesson text (optional)"
        value={bodyText}
        onChange={(e) => setBodyText(e.target.value)}
      />
      <button type="submit" disabled={isSubmitting}>
        Add Lesson
      </button>
    </form>
  );
}

export default CourseDetailPage;
