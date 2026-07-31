import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code2, Github, Settings, User } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <nav className="bg-[#0a0a0c]/80 backdrop-blur-md border-b border-gray-900/80 sticky top-0 z-[100] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <Code2 className="h-6 w-6 text-blue-500 transition-transform group-hover:rotate-6 duration-200" />
              <span className="ml-2.5 text-md font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">Codium IDE</span>
            </Link>

            {isLandingPage && (
              <div className="hidden md:flex ml-10 space-x-8 text-[11px] font-bold uppercase tracking-wider">
                <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                  Features
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
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
                  className="text-gray-400 hover:text-white text-xs font-bold transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all shadow-md shadow-blue-500/10"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <button className="text-gray-500 hover:text-white hover:bg-gray-800/40 p-2 rounded-lg transition-all">
                  <Github className="h-4.5 w-4.5" />
                </button>
                <button className="text-gray-500 hover:text-white hover:bg-gray-800/40 p-2 rounded-lg transition-all">
                  <Settings className="h-4.5 w-4.5" />
                </button>
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center border border-blue-500 shadow-lg shadow-blue-600/10 cursor-pointer">
                  <User className="h-4 w-4 text-white" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}