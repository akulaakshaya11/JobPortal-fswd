import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_BASE_URL = "http://localhost:5000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("currentUser")) || null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch jobs from backend on mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/jobs`);
        setJobs(response.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setJobs([]);
      }
    };
    fetchJobs();
  }, []);

  // Fetch user applications when user changes
  useEffect(() => {
    if (user) {
      const fetchApplications = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/applications/user/${user.id}`);
          setApplications(response.data);
        } catch (error) {
          console.error("Error fetching applications:", error);
          setApplications([]);
        }
      };
      fetchApplications();
    }
  }, [user]);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("currentUser", JSON.stringify(user));
  }, [user]);

  // Register user
  const registerUser = async (name, email, password, role) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, {
        name,
        email,
        password,
        role,
      });
      setUser(response.data.user);
      return { success: true, data: response.data.user };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
      });
      setUser(response.data.user);
      return { success: true, data: response.data.user };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    setUser(null);
    setApplications([]);
  };

  // Apply for job
  const applyForJob = async (jobId, formData) => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append("userId", user.id);
      data.append("jobId", jobId);
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("github", formData.github || "");
      data.append("linkedin", formData.linkedin || "");
      data.append("coverLetter", formData.coverLetter || "");
      if (formData.resume) {
        data.append("resume", formData.resume);
      }

      const response = await axios.post(`${API_BASE_URL}/apply`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Add new application to state
      setApplications((prev) => [...prev, response.data.application]);
      return { success: true, data: response.data.application };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Application failed" };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        jobs,
        setJobs,
        applications,
        setApplications,
        loading,
        registerUser,
        loginUser,
        logout,
        applyForJob,
        API_BASE_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
