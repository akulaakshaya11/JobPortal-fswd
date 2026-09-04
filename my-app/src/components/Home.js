import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const Home = () => {
  const { user, API_BASE_URL } = useContext(AuthContext);
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/jobs`);
        setJobs(response.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [API_BASE_URL]);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      (job.skills && job.skills.some((skill) =>
        skill.toLowerCase().includes(search.toLowerCase())
      ))
  );

  const handleViewDetails = (jobId) => {
    if (!user) {
      alert("Please login to view job details");
      navigate("/login");
      return;
    }
    navigate(`/job/${jobId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Welcome Section */}
        {user ? (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-xl shadow-lg mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name}! 👋</h2>
            <p className="text-lg opacity-90">
              {user.role === "employer"
                ? "Manage your job postings and review applicants"
                : "Find and apply for your next opportunity"}
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 rounded-xl shadow-lg mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome to JobPortal 💼</h2>
            <p className="text-lg opacity-90">
              Discover thousands of job opportunities and start your career journey today!
            </p>
            <div className="mt-4 flex gap-4">
              <button
                onClick={() => navigate("/login")}
                className="bg-white text-green-600 font-semibold px-6 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="bg-green-500 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-600 transition"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex justify-center">
            <input
              type="text"
              placeholder="Search jobs by title, company, or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-2 border-gray-300 px-6 py-3 w-full md:w-3/5 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="text-center text-gray-600 mt-2 text-sm">
            {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading jobs...</p>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-200"
                >
                  {job.logo && (
                    <img
                      src={job.logo}
                      alt={job.company}
                      className="w-16 h-16 object-contain mb-4 mx-auto"
                    />
                  )}
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{job.title}</h3>
                  <p className="text-gray-600 font-medium mb-1">{job.company}</p>
                  <p className="text-gray-500 text-sm mb-3">📍 {job.location}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-blue-600 font-semibold">{job.salary}</span>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                      {job.experience}
                    </span>
                  </div>

                  {job.skills && job.skills.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {job.skills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 3 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            +{job.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleViewDetails(job.id)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    {user && user.role === "job_seeker" ? "View & Apply" : "View Details"}
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600 text-lg">No jobs found matching your search.</p>
                <button
                  onClick={() => setSearch("")}
                  className="text-blue-600 hover:underline mt-2 font-medium"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
