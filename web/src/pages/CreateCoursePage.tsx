import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createCourse } from "../api/courses.api";
import AppLayout from "../components/AppLayout";

function CreateCoursePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const course = await createCourse({
        title,
        description: description || undefined,
        gradeLevel: gradeLevel || undefined,
      });
      navigate(`/courses/${course.id}`);
    } catch {
      setError("Failed to create course. Please check your input and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Create a New Course</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
        >
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label htmlFor="gradeLevel" className="block text-sm font-medium text-slate-700 mb-1">
              Grade Level
            </label>
            <input
              id="gradeLevel"
              type="text"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-md transition-colors"
          >
            {isSubmitting ? "Creating..." : "Create Course"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}

export default CreateCoursePage;
