import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getSchools, createSchool } from "../api/schools.api";
import type { School } from "../api/schools.api";
import AppLayout from "../components/AppLayout";

function AdminSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  const [udiseCode, setUdiseCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function loadSchools() {
    try {
      const data = await getSchools();
      setSchools(data);
    } catch {
      setError("Failed to load schools");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function fetchSchools() {
      try {
        setIsLoading(true);
        setError("");

        const data = await getSchools();

        if (!ignore) {
          setSchools(data);
        }
      } catch {
        if (!ignore) {
          setError("Failed to load schools.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchSchools();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      await createSchool({
        name: name.trim(),
        district: district.trim(),
        udiseCode: udiseCode.trim() || undefined,
      });
      setName("");
      setDistrict("");
      setUdiseCode("");
      await loadSchools();
    } catch {
      setFormError("Failed to create school. Check the details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Manage Schools</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isLoading && <p className="text-slate-500">Loading schools...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!isLoading && !error && schools.length === 0 && (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-500">
              No schools added yet.
            </div>
          )}

          <div className="space-y-3">
            {schools.map((school) => (
              <div
                key={school.id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{school.name}</p>
                  <p className="text-sm text-slate-500">
                    {school.district}, {school.state}
                    {school.udiseCode ? ` · UDISE: ${school.udiseCode}` : ""}
                  </p>
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
            <h2 className="font-semibold text-slate-900">Add School</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">School Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                UDISE Code (optional)
              </label>
              <input
                type="text"
                value={udiseCode}
                onChange={(e) => setUdiseCode(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-md transition-colors"
            >
              {isSubmitting ? "Adding..." : "Add School"}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

export default AdminSchoolsPage;
