import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Profile from "./components/Profile";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ApplyForm from "./components/ApplyForm";
import JobDetails from "./components/JobDetails";
import EmployerDashboard from "./components/EmployerDashboard";
import JobForm from "./components/JobForm";
import About from "./components/About";
import Contact from "./components/Contact";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import SavedJobs from "./components/SavedJobs";
import JobAlerts from "./components/JobAlerts";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <main style={{ minHeight: "calc(100vh - 200px)" }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Job Seeker Private Routes */}
          <Route
            path="/profile"
            element={
              <PrivateRoute requiredRole="job_seeker">
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/apply/:jobId"
            element={
              <PrivateRoute requiredRole="job_seeker">
                <ApplyForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/saved-jobs"
            element={
              <PrivateRoute requiredRole="job_seeker">
                <SavedJobs />
              </PrivateRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <PrivateRoute requiredRole="job_seeker">
                <JobAlerts />
              </PrivateRoute>
            }
          />
          <Route
            path="/job/:id"
            element={
              <PrivateRoute requiredRole="job_seeker">
                <JobDetails />
              </PrivateRoute>
            }
          />

          {/* Employer Private Routes */}
          <Route
            path="/employer-dashboard"
            element={
              <PrivateRoute requiredRole="employer">
                <EmployerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/post-job"
            element={
              <PrivateRoute requiredRole="employer">
                <JobForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-job/:id"
            element={
              <PrivateRoute requiredRole="employer">
                <JobForm />
              </PrivateRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
