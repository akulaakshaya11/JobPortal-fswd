import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
  const { user, logout, API_BASE_URL } = useContext(AuthContext);
  const navigate = useNavigate();
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    const fetchSavedCount = async () => {
      if (user && user.role === "job_seeker") {
        try {
          const res = await fetch(`${API_BASE_URL}/users/${user.id}/saved-jobs`);
          const data = await res.json();
          setSavedCount(Array.isArray(data) ? data.length : 0);
        } catch (e) {
          setSavedCount(0);
        }
      } else {
        setSavedCount(0);
      }
    };
    fetchSavedCount();
  }, [user, API_BASE_URL]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-indigo-900 text-white flex justify-between items-center px-8 py-4 shadow-lg">
      <Link to="/" className="text-2xl font-bold hover:text-gray-200 transition">
        💼 JobPortal
      </Link>

      <nav className="flex gap-6 items-center">
        {/* Public Navigation */}
        <Link to="/" className="hover:text-gray-300 transition">
          Home
        </Link>
        <Link to="/about" className="hover:text-gray-300 transition">
          About
        </Link>
        <Link to="/contact" className="hover:text-gray-300 transition">
          Contact
        </Link>

        {/* Authenticated Navigation */}
        {user ? (
          <>
            {user.role === "job_seeker" && (
              <>
                <Link to="/profile" className="hover:text-gray-300 transition">
                  My Profile
                </Link>
                <Link to="/saved-jobs" className="hover:text-gray-300 transition flex items-center gap-2">
                  <span>📌 Saved Jobs</span>
                  <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">{savedCount}</span>
                </Link>
                <Link to="/alerts" className="hover:text-gray-300 transition">
                  🔔 Alerts
                </Link>
              </>
            )}

            {user.role === "employer" && (
              <>
                <Link
                  to="/employer-dashboard"
                  className="hover:text-gray-300 transition font-semibold"
                >
                  Dashboard
                </Link>
                <Link to="/post-job" className="hover:text-gray-300 transition">
                  Post Job
                </Link>
              </>
            )}

            {/* USER INFO + LOGOUT BUTTON */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">
                {user.name} ({user.role === "employer" ? "Employer" : "Job Seeker"})
              </span>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded transition"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded transition"
            >
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
