import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
const EmployerDashboard = () => {
  const { user, API_BASE_URL } = useContext(AuthContext);
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/employer/jobs/${user.id}`);
        setJobs(response.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.id) {
      fetchJobs();
    }
  }, [user, API_BASE_URL]);
  const handleViewApplicants = async (job) => {
    setSelectedJob(job);
    setLoadingApplicants(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/applications/job/${job.id}?userId=${user.id}`
      );
      setApplicants(response.data);
    } catch (error) {
      console.error("Error fetching applicants:", error);
      alert("Error fetching applicants");
    } finally {
      setLoadingApplicants(false);
    }
  };
  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/applications/${applicationId}/status`, {
        userId: user.id,
        status: newStatus,
      });
      setApplicants(
        applicants.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      alert(`Application status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating application status");
    }
  };
  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await axios.delete(`${API_BASE_URL}/jobs/${jobId}`, {
          data: { userId: user.id },
        });
        setJobs(jobs.filter((j) => j.id !== jobId));
        setSelectedJob(null);
        alert("Job deleted successfully");
      } catch (error) {
        console.error("Error deleting job:", error);
        alert("Error deleting job");
      }
    }
  };
  const filteredApplicants = applicants.filter((a) => {
    const matchesStatus = statusFilter === "All" || a.status === statusFilter;
    const hay = `${a.name} ${a.email} ${a.phone}`.toLowerCase();
    const matchesSearch = hay.includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });
  const counts = applicants.reduce(
    (acc, a) => {
      acc.total += 1;
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    },
    { total: 0, Pending: 0, Reviewed: 0, Selected: 0, Rejected: 0 }
  );
  const exportCSV = () => {
    const rows = filteredApplicants.map((a) => ({
      Name: a.name,
      Email: a.email,
      Phone: a.phone,
      Status: a.status,
      AppliedAt: a.appliedAt,
      GitHub: a.github || "",
      LinkedIn: a.linkedin || ""
    }));
    const header = Object.keys(rows[0] || { Name:"", Email:"", Phone:"", Status:"", AppliedAt:"", GitHub:"", LinkedIn:"" });
    const csv = [header.join(','), ...rows.map(r => header.map(k => (`${String(r[k]).replace(/"/g,'""')}`)).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applicants-${selectedJob?.id || 'job'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 text-lg">Loading your dashboard...</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Employer Dashboard
          </h1>
          <p className="text-gray-600">Welcome, {user.name}! Manage your jobs and applicants here.</p>
        </div>
        <div className="mb-8">
          <button
            onClick={() => navigate("/post-job")}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition text-lg"
          >
            + Post New Job
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Jobs</h2>
              {jobs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No jobs posted yet</p>
                  <button
                    onClick={() => navigate("/post-job")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Post Your First Job
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {jobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => handleViewApplicants(job)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition ${
                        selectedJob?.id === job.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-400"
                      }`}
                    >
                      <h4 className="font-bold text-gray-800">{job.title}</h4>
                      <p className="text-sm text-gray-600">{job.location}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Posted: {new Date(job.postedAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-2">
            {selectedJob ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-6 pb-4 border-b">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Applicants for {selectedJob.title}
                    </h2>
                    <div className="text-gray-600 flex gap-3 mt-1">
                      <span>Total: {counts.total}</span>
                      <span>Pending: {counts.Pending}</span>
                      <span>Reviewed: {counts.Reviewed}</span>
                      <span>Selected: {counts.Selected}</span>
                      <span>Rejected: {counts.Rejected}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/edit-job/${selectedJob.id}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Edit Job
                    </button>
                    <button
                      onClick={() => handleDeleteJob(selectedJob.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        const url = window.location.origin + `/job/${selectedJob.id}`;
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                          navigator.clipboard.writeText(url);
                        }
                      }}
                      className="border border-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100"
                    >
                      Copy Job Link
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mb-4">
                  <input
                    className="border rounded px-3 py-2 flex-1 min-w-[200px]"
                    placeholder="Search applicants by name/email/phone"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <select
                    className="border rounded px-3 py-2"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option>All</option>
                    <option>Pending</option>
                    <option>Reviewed</option>
                    <option>Selected</option>
                    <option>Rejected</option>
                  </select>
                  <button
                    onClick={exportCSV}
                    className="border border-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100"
                  >
                    Export CSV
                  </button>
                </div>
                {loadingApplicants ? (
                  <p className="text-gray-600 text-center py-8">Loading applicants...</p>
                ) : applicants.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No applicants yet</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredApplicants.map((applicant) => (
                      <div
                        key={applicant.id}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-gray-800 text-lg">
                              {applicant.name}
                            </h4>
                            <p className="text-gray-600">{applicant.email}</p>
                            <p className="text-gray-600 text-sm">📞 {applicant.phone}</p>
                          </div>
                          <div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                applicant.status === "Selected"
                                  ? "bg-green-200 text-green-800"
                                  : applicant.status === "Rejected"
                                  ? "bg-red-200 text-red-800"
                                  : applicant.status === "Reviewed"
                                  ? "bg-blue-200 text-blue-800"
                                  : "bg-yellow-200 text-yellow-800"
                              }`}
                            >
                              {applicant.status}
                            </span>
                          </div>
                        </div>

                        {applicant.github && (
                          <p className="text-sm mb-1">
                            <strong>GitHub:</strong>{" "}
                            <a
                              href={applicant.github}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {applicant.github}
                            </a>
                          </p>
                        )}

                        {applicant.linkedin && (
                          <p className="text-sm mb-2">
                            <strong>LinkedIn:</strong>{" "}
                            <a
                              href={applicant.linkedin}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {applicant.linkedin}
                            </a>
                          </p>
                        )}

                        {applicant.resume && (
                          <p className="text-sm mb-3">
                            <strong>Resume:</strong>{" "}
                            <a
                              href={`http://localhost:5000/uploads/${applicant.resume}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Download
                            </a>
                          </p>
                        )}

                        {applicant.coverLetter && (
                          <p className="text-sm mb-3 p-2 bg-white rounded italic text-gray-700">
                            "{applicant.coverLetter.substring(0, 100)}..."
                          </p>
                        )}

                        <div className="flex gap-2 mt-3 pt-3 border-t">
                          <button
                            onClick={() => handleUpdateStatus(applicant.id, "Reviewed")}
                            disabled={applicant.status === "Reviewed"}
                            className="flex-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(applicant.id, "Selected")}
                            disabled={applicant.status === "Selected"}
                            className="flex-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                          >
                            Select
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(applicant.id, "Rejected")}
                            disabled={applicant.status === "Rejected"}
                            className="flex-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50 text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <p className="text-gray-600 text-lg">
                  Select a job from the list to view applicants
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
