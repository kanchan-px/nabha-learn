import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getStudents, createStudent, setStudentGrade, setStudentActive } from "../api/students.api";
import type { Student } from "../api/students.api";
import AppLayout from "../components/AppLayout";

const gradeOptions = Array.from({ length: 12 }, (_, i) => String(i + 1));

function ManageStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [newCredentials, setNewCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);

  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function fetchStudents() {
      setIsLoading(true);

      try {
        const data = await getStudents();

        if (!ignore) {
          setStudents(data);
        }
      } catch {
        if (!ignore) {
          setError("Failed to load students");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchStudents();

    return () => {
      ignore = true;
    };
  }, [refreshIndex]);

  function refresh() {
    setRefreshIndex((i) => i + 1);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setNewCredentials(null);
    setIsSubmitting(true);

    try {
      const result = await createStudent({
        name: name.trim(),
        password,
      });

      setNewCredentials({
        username: result.student.username,
        password: result.generatedPassword,
      });

      setName("");
      setPassword("");
      refresh();
    } catch {
      setFormError("Failed to create student. Check the details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGradeChange(student: Student, newGrade: string) {
    try {
      await setStudentGrade(student.id, newGrade);
      refresh();
    } catch {
      setError("Failed to update student's grade");
    }
  }

  async function handleToggleActive(student: Student) {
    try {
      await setStudentActive(student.id, !student.isActive);
      refresh();
    } catch {
      setError("Failed to update student status");
    }
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Manage Students</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isLoading && <p className="text-slate-500">Loading students...</p>}

          {error && <p className="text-red-600">{error}</p>}

          {!isLoading && !error && students.length === 0 && (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-500">
              No students in your grade yet.
            </div>
          )}

          <div className="space-y-3">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between flex-wrap gap-3"
              >
                <div>
                  <p className="font-semibold text-slate-900">{student.name}</p>
                  <p className="text-sm text-slate-500">{student.username}</p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={student.gradeLevel ?? ""}
                    onChange={(e) => handleGradeChange(student, e.target.value)}
                    className="text-sm rounded-md border border-slate-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {gradeOptions.map((g) => (
                      <option key={g} value={g}>
                        Grade {g}
                      </option>
                    ))}
                  </select>

                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      student.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {student.isActive ? "Active" : "Disabled"}
                  </span>

                  <button
                    onClick={() => handleToggleActive(student)}
                    className="text-sm font-medium text-teal-700 hover:text-teal-800"
                  >
                    {student.isActive ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl border border-slate-200 p-5 space-y-4"
          >
            <h2 className="font-semibold text-slate-900">Add Student</h2>

            <p className="text-xs text-slate-500">
              New students are automatically assigned to your school and grade.
            </p>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Temporary Password
              </label>

              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-md transition-colors"
            >
              {isSubmitting ? "Creating..." : "Create Student"}
            </button>
          </form>

          {newCredentials && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-800 mb-2">
                Save these credentials now — the password won't be shown again.
              </p>

              <p className="text-sm text-amber-900">
                Username: <span className="font-mono font-semibold">{newCredentials.username}</span>
              </p>

              <p className="text-sm text-amber-900">
                Password: <span className="font-mono font-semibold">{newCredentials.password}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default ManageStudentsPage;
