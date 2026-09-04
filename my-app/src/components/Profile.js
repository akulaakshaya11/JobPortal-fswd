import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const Profile = () => {
  const { user, API_BASE_URL } = useContext(AuthContext);
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/applications/user/${user.id}`
        );
        setApplications(response.data);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.id) {
      fetchApplications();
    }
  }, [user, API_BASE_URL]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 text-lg">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-6">
        {/* User Info Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-xl shadow-lg mb-8">
          <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
          <p className="text-lg opacity-90">📧 {user.email}</p>
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => navigate("/")}
              className="bg-white text-blue-600 font-semibold px-6 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Browse Jobs
            </button>
          </div>
        </div>

        {/* Applications Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Your Applications ({applications.length})
          </h2>

          {loading ? (
            <p className="text-gray-600 text-center py-8">Loading applications...</p>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-gray-600 text-lg mb-4">
                You haven't applied to any jobs yet.
              </p>
              <button
                onClick={() => navigate("/")}
                className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Browse Available Jobs
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition p-6 border-l-4 border-blue-600"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">
                        {app.jobId} - Application
                      </h3>
                      <p className="text-gray-600 text-lg">
                        Submitted on{" "}
                        <span className="font-semibold">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                          app.status === "Selected"
                            ? "bg-green-100 text-green-800"
                            : app.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : app.status === "Reviewed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 pb-4 border-b">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">EMAIL</p>
                      <p className="text-gray-800">{app.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">PHONE</p>
                      <p className="text-gray-800">{app.phone}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {app.github && (
                      <p className="text-sm">
                        <strong>GitHub:</strong>{" "}
                        <a
                          href={app.github}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Profile →
                        </a>
                      </p>
                    )}
                    {app.linkedin && (
                      <p className="text-sm">
                        <strong>LinkedIn:</strong>{" "}
                        <a
                          href={app.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Profile →
                        </a>
                      </p>
                    )}
                    {app.resume && (
                      <p className="text-sm">
                        <strong>Resume:</strong>{" "}
                        <a
                          href={`http://localhost:5000/uploads/${app.resume}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Download →
                        </a>
                      </p>
                    )}
                  </div>

                  {app.coverLetter && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="text-sm text-gray-600 font-semibold mb-2">
                        COVER LETTER
                      </p>
                      <p className="text-gray-700 italic">"{app.coverLetter}"</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate("/")}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                    >
                      Browse More Jobs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
