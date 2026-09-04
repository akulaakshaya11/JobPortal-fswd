import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import JobCard from "./JobCard";

const JobList = ({ search }) => {
  const { jobs } = useContext(AuthContext);

  // Filter jobs based on search term
  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase())
  );

  if (filteredJobs.length === 0) {
    return <p className="text-center text-gray-600 mt-6">No jobs found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredJobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
};

export default JobList;
