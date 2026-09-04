import React, { useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const ApplyForm = () => {
  const { user, applyForJob, API_BASE_URL, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    github: "",
    linkedin: "",
    resume: null,
    coverLetter: "",
  });

  React.useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/jobs/${jobId}`);
        setJob(response.data);
      } catch (error) {
        setError("Job not found");
      } finally {
        setLoadingJob(false);
      }
    };

    if (jobId) {
      fetchJob();
    } else {
      setLoadingJob(false);
      setError("No job selected");
    }
  }, [jobId, API_BASE_URL]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "resume") {
      setFormData({ ...formData, resume: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.phone || !formData.resume || !formData.coverLetter) {
      setError("Phone, resume, and cover letter are required");
      return;
    }

    const result = await applyForJob(parseInt(jobId), formData);

    if (result.success) {
      alert("Application submitted successfully! 🎉");
      navigate("/profile");
    } else {
      setError(result.error);
    }
  };

  if (loadingJob) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 text-lg">Loading job details...</p>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-10 rounded-2xl shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-start py-10 bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-2xl shadow-md w-full max-w-xl border border-gray-100 space-y-4"
      >
        {job && (
          <div className="mb-6 pb-4 border-b">
            <h2 className="text-2xl font-bold text-blue-600 mb-2">
              {job.title}
            </h2>
            <p className="text-gray-600">
              at <span className="font-semibold">{job.company}</span>
            </p>
            <p className="text-gray-500 text-sm">📍 {job.location}</p>
          </div>
        )}

        <h3 className="text-xl font-bold text-center">Application Form</h3>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <input
          type="url"
          name="github"
          placeholder="GitHub Profile URL (optional)"
          value={formData.github}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="url"
          name="linkedin"
          placeholder="LinkedIn Profile URL (optional)"
          value={formData.linkedin}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block">
          <span className="text-gray-700 font-semibold mb-1 block">
            Upload Resume (PDF) *
          </span>
          <input
            type="file"
            name="resume"
            accept=".pdf,.doc,.docx"
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Accepted: PDF, DOC, DOCX</p>
        </label>

        <textarea
          name="coverLetter"
          placeholder="Cover Letter - Tell us why you're a great fit for this role..."
          value={formData.coverLetter}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={5}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default ApplyForm;
