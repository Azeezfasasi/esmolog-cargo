'use client';

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useProfile } from '@/components/context-api/ProfileContext';

function LoginMain() {
  const navigate = useNavigate();
  const { login, clearError, error: contextError } = useProfile();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); 
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(''); 
  const [successMessage, setSuccessMessage] = useState(''); 

  // Effect to clear messages when form fields change or component mounts
  useEffect(() => {
    setLocalError('');
    setSuccessMessage('');
    clearError();
  }, [email, password, clearError]); 

  // React Query useMutation hook for the login process
  const loginMutation = useMutation({
    mutationFn: login, 
    onSuccess: (data) => {
      if (data.success) {
        setSuccessMessage('Login successful! Redirecting to dashboard...');
        setLocalError(''); 
        clearError();

        // Clear form fields on success
        setEmail('');
        setPassword('');
        setRememberMe(false); 

        // Redirect after a short delay
        setTimeout(() => {
          navigate('/app/dashboard');
        }, 500);
      } else {
        setLocalError(data.error || 'Login failed due to an unexpected response.');
        setSuccessMessage('');
      }
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'An unexpected error occurred during login.';
      setLocalError(errorMessage);
      setSuccessMessage('');
      clearError(); 
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(''); 
    setSuccessMessage('');
    clearError();

    // Basic client-side validation
    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    // Call the mutate function from useMutation
    loginMutation.mutate({ email, password });
  };

  // Only show an error if there's no success message
  const displayError = successMessage ? null : (localError || contextError);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-inter">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Welcome Back!
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Sign in to your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display Error Message */}
          {displayError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative" role="alert">
              <span className="block sm:inline">{displayError}</span>
            </div>
          )}
          {/* Display Success Message */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative" role="alert">
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-400 transition duration-200"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-400 transition duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition duration-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
            <Link href="/forgetpassword" className="text-sm font-medium text-green-600 hover:text-green-500 transition duration-200">
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? ( // Use isPending for loading state
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-green-600 hover:text-green-500 transition duration-200">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginMain;
