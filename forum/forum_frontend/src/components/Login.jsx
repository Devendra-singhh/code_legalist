import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = ({ setIsAuthenticated, setToken }) => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await login(formData);
      if (response.token) {
        setToken(response.token);
        setIsAuthenticated(true);
        toast.success("Login successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 2000);
      }
    } catch (err) {
      const message = err.message || "Invalid username or password";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-black">
      <ToastContainer />

      <main className="flex-grow flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-6">
            Welcome Back
          </h2>

          <div className="bg-gray-950 shadow-lg rounded-xl p-6 sm:p-8 border-t-4 border-indigo-500">
            {error && (
              <div className="mb-4 bg-red-900/50 border-l-4 border-red-500 p-3 rounded">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-200"
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
                  className="mt-1 block w-full px-4 py-2 border border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-gray-900 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-200"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength="6"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className="mt-1 block w-full px-4 py-2 border border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-gray-900 text-white placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-2 px-4 rounded-md text-sm font-medium text-white transition ${
                  isLoading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
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

            <div className="mt-6 text-center text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-indigo-400 hover:text-indigo-300"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-black border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-white">Code Legalist</h4>
            <p className="text-sm text-gray-400">Legal awareness & solutions for everyone</p>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Code Legalist. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Login;
