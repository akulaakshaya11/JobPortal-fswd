import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import { Star } from 'lucide-react';

const SavedJobs = () => {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('savedAt_desc');

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const response = await API.get(`/users/${user.id}/saved-jobs`);
        setSavedJobs(response.data);
      } catch (err) {
        setError('Failed to load saved jobs');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSavedJobs();
    }
  }, [user]);

  const handleUnsave = async (jobId) => {
    try {
      await API.delete(`/jobs/${jobId}/save`, { data: { userId: user.id } });
      setSavedJobs((prev) => prev.filter((sj) => sj.jobId !== jobId));
    } catch (err) {
      setError('Failed to remove saved job');
    }
  };

  const handleUpdateMeta = async (jobId, data) => {
    try {
      const res = await API.put(`/users/${user.id}/saved-jobs/${jobId}`, data);
      const updated = res.data.savedJob;
      setSavedJobs((prev) => prev.map(sj => sj.jobId === jobId ? { ...sj, ...updated } : sj));
    } catch (err) {
      setError('Failed to update');
    }
  };

  const exportCSV = () => {
    const rows = savedJobs.map(sj => ({
      JobId: sj.jobId,
      Title: sj.jobDetails?.title || '',
      Company: sj.jobDetails?.company || '',
      Location: sj.jobDetails?.location || '',
      Salary: sj.jobDetails?.salary || '',
      SavedAt: sj.savedAt || '',
      Priority: sj.priority ?? 0,
      Notes: sj.notes || ''
    }));
    const header = Object.keys(rows[0] || {JobId:'',Title:'',Company:'',Location:'',Salary:'',SavedAt:'',Priority:'',Notes:''});
    const csv = [header.join(','), ...rows.map(r => header.map(k => (`${String(r[k]).replace(/"/g,'""')}`)).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'saved-jobs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const sortedJobs = [...savedJobs].sort((a, b) => {
    if (sortBy === 'priority_desc') return (b.priority ?? 0) - (a.priority ?? 0);
    if (sortBy === 'priority_asc') return (a.priority ?? 0) - (b.priority ?? 0);
    const ad = new Date(a.savedAt || 0).getTime();
    const bd = new Date(b.savedAt || 0).getTime();
    return sortBy === 'savedAt_asc' ? ad - bd : bd - ad;
  });

  if (loading) {
    return <div className="text-center py-8">Loading saved jobs...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">📌 Saved Jobs</h1>
        <div className="flex gap-3">
          <select
            className="border rounded px-2 py-1"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="savedAt_desc">Newest</option>
            <option value="savedAt_asc">Oldest</option>
            <option value="priority_desc">Priority ↓</option>
            <option value="priority_asc">Priority ↑</option>
          </select>
          <button
            onClick={exportCSV}
            className="border rounded px-3 py-1 hover:bg-gray-100"
          >
            Export CSV
          </button>
        </div>
      </div>
      
      {savedJobs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">You haven't saved any jobs yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedJobs.map((savedJob) => (
            <div key={savedJob.jobId} className="border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">{savedJob.jobDetails?.title || 'Job Title'}</h2>
              <p className="text-gray-600 mb-2">{savedJob.jobDetails?.company || 'Company'}</p>
              <p className="text-gray-600 mb-4">{savedJob.jobDetails?.location || 'Location'}</p>
              <div className="flex justify-between items-center">
                <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  {savedJob.jobDetails ? 'Saved' : 'Unavailable'}
                </span>
                <span className="text-gray-900 font-medium">
                  {savedJob.jobDetails?.salary || ''}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-3">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => handleUpdateMeta(savedJob.jobId, { priority: n })} className={""}>
                    <Star size={18} className={n <= (savedJob.priority ?? 0) ? 'text-yellow-500' : 'text-gray-300'} />
                  </button>
                ))}
              </div>
              <textarea
                className="mt-3 w-full border rounded p-2"
                placeholder="Add a personal note..."
                defaultValue={savedJob.notes || ''}
                onBlur={(e) => handleUpdateMeta(savedJob.jobId, { notes: e.target.value })}
              />
              <button
                className="mt-4 w-full bg-red-500 text-white rounded-md py-2 hover:bg-red-600"
                onClick={() => handleUnsave(savedJob.jobId)}
              >
                Remove from Saved
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
