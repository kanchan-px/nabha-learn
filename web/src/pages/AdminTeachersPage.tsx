import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getTeachers, createTeacher, setTeacherActive } from "../api/teachers.api";
import type { Teacher } from "../api/teachers.api";
import { getSchools } from "../api/schools.api";
import type { School } from "../api/schools.api";
import AppLayout from "../components/AppLayout";

function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [newCredentials, setNewCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);

  async function loadData() {
    try {
      const [teacherData, schoolData] = await Promise.all([getTeachers(), getSchools()]);

      setTeachers(teacherData);
      setSchools(schoolData);
    } catch {
      setError("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      try {
        const [teacherData, schoolData] = await Promise.all([getTeachers(), getSchools()]);

        if (!ignore) {
          setTeachers(teacherData);
          setSchools(schoolData);
          setIsLoading(false);
        }
      } catch {
        if (!ignore) {
          setError("Failed to load data");
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setNewCredentials(null);
    setIsSubmitting(true);

    try {
      const result = await createTeacher({
        name: name.trim(),
        password,
        schoolId,
      });

      setNewCredentials({
        username: result.teacher.username,
        password: result.generatedPassword,
      });

      setName("");
      setPassword("");
      setSchoolId("");

      await loadData();
    } catch {
      setFormError("Failed to create teacher. Check the details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(teacher: Teacher) {
    try {
      await setTeacherActive(teacher.id, !teacher.isActive);
      await loadData();
    } catch {
      setError("Failed to update teacher status");
    }
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Manage Teachers</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isLoading && <p className="text-slate-500">Loading...</p>}

          {error && <p className="text-red-600">{error}</p>}

          {!isLoading && !error && teachers.length === 0 && (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-500">
              No teachers added yet.
            </div>
          )}

          <div className="space-y-3">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between flex-wrap gap-2"
              >
                <div>
                  <p className="font-semibold text-slate-900">{teacher.name}</p>

                  <p className="text-sm text-slate-500">
                    {teacher.username} · {teacher.school?.name ?? "No school assigned"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      teacher.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {teacher.isActive ? "Active" : "Disabled"}
                  </span>

                  <button
                    onClick={() => handleToggleActive(teacher)}
                    className="text-sm font-medium text-teal-700 hover:text-teal-800"
                  >
                    {teacher.isActive ? "Disable" : "Enable"}
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
            <h2 className="font-semibold text-slate-900">Add Teacher</h2>

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
              <label className="block text-sm font-medium text-slate-700 mb-1">School</label>

              <select
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select a school</option>

                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
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
              {isSubmitting ? "Creating..." : "Create Teacher"}
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

export default AdminTeachersPage;
