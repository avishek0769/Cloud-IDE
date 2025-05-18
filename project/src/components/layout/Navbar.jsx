import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code2, Github, Settings, User } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <nav className="bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Code2 className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold text-white">Avishek's IDE</span>
            </Link>

            {isLandingPage && (
              <div className="hidden md:flex ml-10 space-x-8">
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                  Features
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Pricing
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Docs
                </a>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isLandingPage ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Github className="h-5 w-5" />
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Settings className="h-5 w-5" />
                </button>
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}