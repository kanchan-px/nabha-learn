import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createCourse } from "../api/courses.api";

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
    <div>
      <h1>Create a New Course</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="gradeLevel">Grade Level</label>
          <input
            id="gradeLevel"
            type="text"
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Course"}
        </button>
      </form>
    </div>
  );
}

export default CreateCoursePage;
