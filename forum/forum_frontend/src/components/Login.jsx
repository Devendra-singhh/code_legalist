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
        setToken(response.token, response.user);
        setIsAuthenticated(true);
        toast.success("Login successful! Redirecting to dashboard...");
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    } catch (err) {
      const message = err.message || "Invalid credentials. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-4 relative overflow-hidden">
      <ToastContainer theme="dark" />
      
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="w-full max-w-md z-10">
        {/* Branding */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="font-bold text-2xl tracking-tight text-white group-hover:text-indigo-400 transition-colors">
              Code Legalist
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-zinc-500 mt-2 text-sm font-medium">Join the legal community discussion</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
              <p className="text-xs font-bold text-red-400 text-center">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
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
                placeholder="Enter your username"
                className="block w-full px-5 py-3 rounded-2xl bg-zinc-900/50 border border-white/5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all font-medium"
              />
            </div>

            <div>
              <label htmlFor="password" title="Password must be at least 6 characters" className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
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
                placeholder="••••••••"
                className="block w-full px-5 py-3 rounded-2xl bg-zinc-900/50 border border-white/5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3.5 px-4 rounded-2xl premium-gradient text-white text-sm font-bold shadow-lg shadow-indigo-500/20 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                "Access Forum"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-zinc-500 font-medium">
            New to the community?{" "}
            <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-bold ml-1 transition-colors">
              Create an account
            </Link>
          </p>
        </div>

        {/* Legal Disclaimer */}
        <p className="mt-12 text-center text-[10px] text-zinc-600 font-bold uppercase tracking-[0.25em]">
          Defining Legal Help for the Digital Age
        </p>
      </main>
    </div>
  );
};

export default Login;
