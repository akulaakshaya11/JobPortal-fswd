import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Bookmark, BookmarkCheck } from 'lucide-react';

const JobDetails = () => {
  const { API_BASE_URL } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useContext(AuthContext);

  const checkIfSaved = async () => {
    if (user) {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/${user.id}/saved-jobs`);
        const savedJob = response.data.find(j => j.jobId === parseInt(id));
        setIsSaved(!!savedJob);
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    }
  };

  const handleSaveJob = async () => {
    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    setIsSaving(true);
    try {
      if (isSaved) {
        await axios.delete(`${API_BASE_URL}/jobs/${id}/save`, { 
          data: { userId: user.id } 
        });
        setIsSaved(false);
      } else {
        await axios.post(`${API_BASE_URL}/jobs/${id}/save`, { 
          userId: user.id 
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving job:', error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/jobs/${id}`);
        setJob(response.data);
        await checkIfSaved();
      } catch (error) {
        setError("Job not found");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, API_BASE_URL, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 text-lg">Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-10 rounded-2xl shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Job Not Found</h2>
          <p className="text-gray-700 mb-4">The job you're looking for doesn't exist.</p>
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                <p className="mt-1 text-xl text-gray-600">{job.company}</p>
              </div>
              <button
                onClick={handleSaveJob}
                disabled={isSaving}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isSaved ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-colors`}
              >
                {isSaving ? (
                  <span>Saving...</span>
                ) : isSaved ? (
                  <>
                    <BookmarkCheck size={20} />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark size={20} />
                    <span>Save Job</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  const url = window.location.origin + `/job/${id}`;
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(url);
                  }
                }}
                className="ml-3 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {/* Key Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm font-semibold">SALARY</p>
              <p className="text-blue-600 text-2xl font-bold">{job.salary}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm font-semibold">EXPERIENCE</p>
              <p className="text-green-600 text-2xl font-bold">{job.experience}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm font-semibold">POSTED</p>
              <p className="text-purple-600 font-bold">
                {new Date(job.postedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">About the Role</h3>
            <p className="text-gray-700 text-lg leading-relaxed">{job.description}</p>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Requirements</h3>
              <p className="text-gray-700 text-lg leading-relaxed">{job.requirements}</p>
            </div>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="pt-6 border-t flex gap-4">
            <button
              onClick={() => navigate(`/apply/${id}`)}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition text-lg"
            >
              Apply Now
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-400 transition text-lg"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
