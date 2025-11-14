import React from 'react';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FiBookOpen } from 'react-icons/fi';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-secondary-900 dark:to-secondary-800 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary items-center justify-center p-12">
        <div className="text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <FiBookOpen className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold mb-4">EdTech Platform</h1>
          <p className="text-xl text-white/90 mb-8">
            Empowering educators and students with cutting-edge learning technology
          </p>
          <div className="space-y-4 text-left max-w-md">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Interactive video lessons</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Live classes and real-time collaboration</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Comprehensive progress tracking</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Automated assessments and grading</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <FiBookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">EdTech</span>
            </Link>
          </div>

          {/* Auth Form */}
          <div className="card p-8">
            <Outlet />
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-secondary-600 dark:text-secondary-400">
            <p>
              By continuing, you agree to our{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
