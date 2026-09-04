import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const JobAlerts = () => {
  const { user, API_BASE_URL } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ keywords: "", location: "", frequency: "daily" });

  const fetchAlerts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users/${user.id}/alerts`);
      setAlerts(res.data);
    } catch (e) {
      setError("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAlerts();
  }, [user]);

  const createAlert = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post(`${API_BASE_URL}/alerts`, { userId: user.id, ...form });
      setForm({ keywords: "", location: "", frequency: "daily" });
      await fetchAlerts();
    } catch (e) {
      setError("Failed to create alert");
    }
  };

  const deleteAlert = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/alerts/${id}`);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      setError("Failed to delete alert");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading alerts...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">🔔 Job Alerts</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={createAlert} className="bg-white p-6 rounded-xl shadow mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          className="border rounded px-3 py-2"
          placeholder="Keywords (e.g., React, Node)"
          value={form.keywords}
          onChange={(e) => setForm({ ...form, keywords: e.target.value })}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <select
          className="border rounded px-3 py-2"
          value={form.frequency}
          onChange={(e) => setForm({ ...form, frequency: e.target.value })}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <button className="bg-blue-600 text-white rounded px-4 py-2">Create Alert</button>
      </form>

      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No alerts yet. Create one above.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {alerts.map((a) => (
            <div key={a.id} className="bg-white p-4 rounded-xl shadow flex items-center justify-between">
              <div>
                <div className="font-semibold">{a.keywords || "Any"} {a.location ? `• ${a.location}` : ""}</div>
                <div className="text-sm text-gray-600">{a.frequency} • {new Date(a.createdAt).toLocaleDateString()}</div>
              </div>
              <button onClick={() => deleteAlert(a.id)} className="text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-50">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobAlerts;
