import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import { Bookmark, BookmarkCheck } from 'lucide-react';

const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check if job is saved when component mounts or job changes
  useEffect(() => {
    const checkIfSaved = async () => {
      if (user) {
        try {
          const response = await API.get(`/users/${user.id}/saved-jobs`);
          const savedJob = response.data.find(j => j.jobId === job.id);
          setIsSaved(!!savedJob);
        } catch (error) {
          console.error('Error checking saved status:', error);
        }
      }
    };
    
    checkIfSaved();
  }, [user, job.id]);

  const handleViewDetails = () => {
    navigate(`/job/${job.id}`, { state: { job } });
  };

  const handleSaveJob = async (e) => {
    e.stopPropagation(); // Prevent triggering the card click
    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    setIsSaving(true);
    try {
      if (isSaved) {
        await API.delete(`/jobs/${job.id}/save`, { 
          data: { userId: user.id } 
        });
        setIsSaved(false);
      } else {
        await API.post(`/jobs/${job.id}/save`, { 
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

  return (
    <div 
      className="border rounded-xl p-4 shadow hover:shadow-lg transition cursor-pointer relative"
      onClick={handleViewDetails}
    >
      {/* Save Button */}
      <button
        onClick={handleSaveJob}
        disabled={isSaving}
        className={`absolute top-4 right-4 p-2 rounded-full ${isSaved ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'} transition-colors`}
        title={isSaved ? 'Remove from saved' : 'Save job'}
        aria-label={isSaved ? 'Remove from saved' : 'Save job'}
      >
        {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
      </button>

      <div className="flex items-center mb-3 gap-4">
        <img 
          src={job.logo || '/default-company.png'} 
          alt={`${job.company} logo`} 
          className="w-16 h-16 object-contain rounded-lg border" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/default-company.png';
          }}
        />
        <div>
          <h2 className="text-xl font-semibold">{job.title}</h2>
          <p className="text-gray-600">{job.company || 'Company Name'}</p>
        </div>
      </div>

      <p><strong>Location:</strong> {job.location || 'Not specified'}</p>
      <p><strong>Salary:</strong> {job.salary || 'Negotiable'}</p>
      <p><strong>Experience:</strong> {job.experience || 'Not specified'}</p>
      {job.skills && job.skills.length > 0 && (
        <p className="mb-2"><strong>Skills:</strong> {job.skills.join(", ")}</p>
      )}

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          onClick={handleViewDetails}
          className="w-full bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-gray-200 transition"
        >
          View Details
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/apply/${job.id}`); }}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default JobCard;
