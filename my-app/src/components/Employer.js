import React from "react";
import { Link } from "react-router-dom";

const Employer = () => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user || user.role !== "employer") {
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Only employers can access this page. Please login as an employer.</p>;
  }

  return (
    <div className="employer-container">
      <h2>Welcome, {user.name}!</h2>
      <Link to="/employer/dashboard" className="btn-apply">Go to Dashboard</Link>
    </div>
  );
};

export default Employer;
