"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { FiSun, FiMoon } from "react-icons/fi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://code-legalist-backend.vercel.app";

interface FormData {
  username: string;
  password: string;
}

export default function Login() {
  const [formData, setFormData] = useState<FormData>({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      // Store token and user data in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid username or password";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-red-50 to-red-100 text-gray-900'
    }`}>
      {/* Header with Dark Mode Toggle */}
      <header className={`sticky top-0 z-50 shadow-sm transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Chat Legalist
              </h1>
              <span className="text-gray-300">|</span>
              <span className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Legal Forum
              </span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full transition duration-300 flex items-center justify-center ${
                darkMode 
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-100'
              }`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <FiSun size={20} className="text-yellow-300" />
              ) : (
                <FiMoon size={20} className="text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-grow flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className={`text-center text-3xl font-extrabold ${
            darkMode ? 'text-red-400' : 'text-red-600'
          }`}>Welcome Back</h2>
          <p className={`mt-2 text-center text-sm ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Sign in to your account
          </p>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
          <div className={`shadow-lg rounded-xl p-6 sm:p-8 border-t-4 border-red-500 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="username"
                  className={`block text-sm font-medium ${
                    darkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm 
                    focus:ring-red-500 focus:border-red-500 text-sm sm:text-base
                    ${darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className={`block text-sm font-medium ${
                    darkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm 
                    focus:ring-red-500 focus:border-red-500 text-sm sm:text-base
                    ${darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-2 px-4 rounded-md text-sm sm:text-base font-medium text-white ${
                  isLoading ? "bg-red-400" : "bg-red-600 hover:bg-red-700"
                } focus:outline-none focus:ring-2 focus:ring-red-500`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
                      />
                    </svg>
                    Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </button>
            </form>

            <div className={`mt-6 text-center text-sm ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Don&apos;t have an account?{" "}
              <a
                href="/signup"
                className={`font-medium ${
                  darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'
                }`}
              >
                Sign up
              </a>
            </div>
          </div>
        </div>
      </div>

      <footer className={`py-6 transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-white border-t border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h4 className={`text-lg font-semibold ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>Code Legalist</h4>
            <p className={`text-sm ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Legal awareness & solutions for everyone</p>
          </div>

          <div className="text-center md:text-right">
            <p className={`text-sm ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            } mb-2`}>Follow us</p>
            <div className="flex justify-center md:justify-end gap-4 text-red-500">
              <a href="#" aria-label="Facebook" className="hover:text-red-700">
                <FaFacebook size={20} />
              </a>
              <a href="#" aria-label="Twitter" className="hover:text-red-700">
                <FaTwitter size={20} />
              </a>
              <a href="#" aria-label="Instagram" className="hover:text-red-700">
                <FaInstagram size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className={`mt-4 text-center text-xs ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          &copy; {new Date().getFullYear()} Code Legalist. All rights reserved.
        </div>
      </footer>
    </div>
  );
} 