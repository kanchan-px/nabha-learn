import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

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
        title: title.trim(),
        description: description.trim() || undefined,
        gradeLevel: gradeLevel.trim() || undefined,
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
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-teal-700"
          >
            ← Back to Dashboard
          </Link>

          <p className="mt-5 text-sm font-medium text-teal-700">Course Management</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Create a New Course
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Add the basic details of your course. You can add modules, lessons, and quizzes after
            creating it.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"
        >
          <div className="space-y-6">
            {/* Course title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-800">
                Course Title
              </label>

              <p className="mt-1 text-xs text-slate-500">
                Choose a clear name that students will easily understand.
              </p>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Basic English Grammar"
                required
                minLength={2}
                className="mt-3 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-800">
                Description
              </label>

              <p className="mt-1 text-xs text-slate-500">
                Briefly describe what students will learn in this course.
              </p>

              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Learn basic grammar concepts, sentence formation and everyday English usage."
                rows={4}
                className="mt-3 w-full resize-none rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />

              <p className="mt-1.5 text-right text-xs text-slate-400">
                {description.length} characters
              </p>
            </div>

            {/* Grade level */}
            <div>
              <label htmlFor="gradeLevel" className="block text-sm font-semibold text-slate-800">
                Grade Level
              </label>

              <p className="mt-1 text-xs text-slate-500">
                Specify the intended class or grade for this course.
              </p>

              <input
                id="gradeLevel"
                type="text"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                placeholder="e.g. Grade 6"
                className="mt-3 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating Course..." : "Create Course"}
            </button>
          </div>
        </form>

        {/* Next steps */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
          <p className="text-sm font-semibold text-slate-700">After creating</p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            You'll be taken to the course page where you can add modules, lessons, and quizzes, and
            publish the course when it is ready.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

export default CreateCoursePage;
