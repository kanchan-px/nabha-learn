import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const isDashboard = location.pathname === "/dashboard";
  const isCourses =
    location.pathname.startsWith("/courses") && location.pathname !== "/courses/new";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link
            to={user?.role === "ADMIN" ? "/admin/schools" : "/dashboard"}
            className="text-lg font-bold tracking-tight text-teal-700"
          >
            Shiksha Setu
          </Link>

          {/* Navigation */}
          {user?.role !== "ADMIN" && (
            <nav className="hidden items-center gap-1 md:flex">
              <Link
                to="/dashboard"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isDashboard
                    ? "bg-teal-50 text-teal-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                Dashboard
              </Link>

              <Link
                to="/dashboard"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isCourses
                    ? "bg-teal-50 text-teal-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                Courses
              </Link>
            </nav>
          )}

          {/* User section */}
          <div className="flex items-center gap-4">
            {user?.role === "ADMIN" && (
              <>
                <Link
                  to="/admin/schools"
                  className="hidden sm:inline text-sm font-medium text-slate-600 hover:text-teal-700"
                >
                  Schools
                </Link>

                <Link
                  to="/admin/teachers"
                  className="hidden sm:inline text-sm font-medium text-slate-600 hover:text-teal-700"
                >
                  Teachers
                </Link>
              </>
            )}

            <span className="hidden sm:inline text-sm text-slate-600">
              {user?.name} · {user?.role}
            </span>

            <button
              onClick={handleLogout}
              className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

export default AppLayout;
