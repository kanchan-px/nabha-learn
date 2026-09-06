import { useState } from "react";
import type { FormEvent } from "react";
import { createQuiz } from "../api/quiz.api";
import type { QuizQuestion } from "../api/quiz.api";

interface CreateQuizModalProps {
  lessonId: string;
  lessonTitle: string;
  onClose: () => void;
  onCreated: () => void;
}

function emptyQuestion(): QuizQuestion {
  return {
    text: "",
    options: [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
    ],
  };
}

function CreateQuizModal({ lessonId, lessonTitle, onClose, onCreated }: CreateQuizModalProps) {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([emptyQuestion()]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateQuestionText(index: number, text: string) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, text } : q)));
  }

  function updateOptionText(qIndex: number, oIndex: number, text: string) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, options: q.options.map((o, j) => (j === oIndex ? { ...o, text } : o)) }
          : q
      )
    );
  }

  function setCorrectOption(qIndex: number, oIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, options: q.options.map((o, j) => ({ ...o, isCorrect: j === oIndex })) }
          : q
      )
    );
  }

  function addOption(qIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: [...q.options, { text: "", isCorrect: false }] } : q
      )
    );
  }

  function removeOption(qIndex: number, oIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.filter((_, j) => j !== oIndex) } : q
      )
    );
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await createQuiz(lessonId, { title, questions });
      onCreated();
      onClose();
    } catch {
      setError("Failed to create quiz. Make sure every question has exactly one correct option.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-20">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Add Quiz — {lessonTitle}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Quiz Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {questions.map((question, qIndex) => (
            <div key={qIndex} className="bg-slate-50 rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <input
                  type="text"
                  placeholder={`Question ${qIndex + 1}`}
                  value={question.text}
                  onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                  required
                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-500 hover:text-red-700 text-sm px-2"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-2 pl-2">
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={option.isCorrect}
                      onChange={() => setCorrectOption(qIndex, oIndex)}
                      className="accent-teal-600"
                    />
                    <input
                      type="text"
                      placeholder={`Option ${oIndex + 1}`}
                      value={option.text}
                      onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                      required
                      className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    {question.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(qIndex, oIndex)}
                        className="text-slate-400 hover:text-red-500 text-sm px-1"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(qIndex)}
                  className="text-teal-700 hover:text-teal-800 text-sm font-medium mt-1"
                >
                  + Add Option
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="text-teal-700 hover:text-teal-800 text-sm font-medium"
          >
            + Add Question
          </button>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-md transition-colors"
            >
              {isSubmitting ? "Creating..." : "Create Quiz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateQuizModal;
