import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-200 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-3">💼 JobPortal</h3>
            <p className="text-gray-400">
              Connect talented professionals with amazing job opportunities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-white transition">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-400 hover:text-white transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-400 hover:text-white transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* For Job Seekers */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">For Job Seekers</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-white transition">
                  Browse Jobs
                </a>
              </li>
              <li>
                <a href="/signup" className="text-gray-400 hover:text-white transition">
                  Create Account
                </a>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">For Employers</h4>
            <ul className="space-y-2">
              <li>
                <a href="/signup" className="text-gray-400 hover:text-white transition">
                  Post a Job
                </a>
              </li>
              <li>
                <a href="/signup" className="text-gray-400 hover:text-white transition">
                  Manage Jobs
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>
            © {new Date().getFullYear()} JobPortal. All rights reserved. Built with ❤️ for
            opportunities.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;