import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">About JobPortal</h1>
          <p className="text-xl text-gray-600">
            Connecting Talent with Opportunities
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              JobPortal is a modern job portal designed to connect skilled
              candidates with top companies. We believe in simplifying the hiring
              process for both employers and job seekers.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Whether you're looking for your dream job or your next great hire —
              JobPortal makes it possible with a seamless, user-friendly platform.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-xl text-white">
            <h3 className="text-2xl font-bold mb-6">Why Choose JobPortal?</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <span>Easy-to-use platform for both job seekers and employers</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <span>Wide range of job opportunities across industries</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <span>Fast and secure application process</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <span>Advanced job tracking and status updates</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <p className="text-4xl font-bold text-blue-600 mb-2">1000+</p>
            <p className="text-gray-600 text-lg">Jobs Posted</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <p className="text-4xl font-bold text-green-600 mb-2">5000+</p>
            <p className="text-gray-600 text-lg">Active Users</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <p className="text-4xl font-bold text-purple-600 mb-2">500+</p>
            <p className="text-gray-600 text-lg">Companies</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-blue-50 p-12 rounded-xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 text-lg mb-6">
            Join thousands of professionals and companies already using JobPortal
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
