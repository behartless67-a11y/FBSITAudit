"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuditForm } from "@/components/AuditForm";

const CORRECT_PASSWORD = "GarrettHall235!";

export default function Home() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  // Simple mock user for now - will be replaced with Entra later
  const getUserName = () => 'Batten IT User';
  const getUserEmail = () => 'user@virginia.edu';
  const getUserId = () => 'temp-user-id';

  // Show password form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-uva-navy to-uva-blue-light">
        <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-uva-navy mb-2">
              Batten School IT Audit
            </h1>
            <p className="text-gray-600">Please enter the password to continue</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uva-orange focus:border-transparent"
                placeholder="Enter password"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-uva-orange hover:bg-uva-orange-light text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Batten School of Leadership and Public Policy</p>
            <p>University of Virginia</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Image */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: 'url(/garrett-hall-sunset.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          filter: 'grayscale(100%)',
        }}
      ></div>
      {/* Background Overlay */}
      <div className="fixed inset-0 bg-white/85 -z-10"></div>

      <Header userName={getUserName()} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-12">
        <AuditForm
          userName={getUserName()}
          userEmail={getUserEmail()}
          userId={getUserId()}
        />
      </main>

      <Footer />
    </div>
  );
}
