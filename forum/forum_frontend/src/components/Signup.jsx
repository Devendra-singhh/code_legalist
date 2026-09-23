import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signup = ({ setIsAuthenticated, setToken }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
  });
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
      const response = await signup(formData);
      toast.success("Account created successfully! Redirecting...");
      
      localStorage.setItem("token", response.token);
      setToken(response.token, response.user);
      setIsAuthenticated(true);

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      const message = err.message || "Registration failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { id: "firstName", label: "First Name", type: "text", placeholder: "e.g. Rajesh" },
    { id: "lastName", label: "Last Name", type: "text", placeholder: "e.g. Sharma" },
    { id: "username", label: "Username", type: "text", placeholder: "e.g. rajesh_legal" },
    { id: "password", label: "Password", type: "password", placeholder: "•••••••• (min 6 chars)" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-4 relative overflow-hidden">
      <ToastContainer theme="dark" />
      
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="w-full max-w-lg z-10">
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
          <h2 className="text-3xl font-bold text-white tracking-tight">Create your account</h2>
          <p className="text-zinc-500 mt-2 text-sm font-medium">Join 5,000+ members in the legal network</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
              <p className="text-xs font-bold text-red-400 text-center">{error}</p>
            </div>
          )}

          <form className="grid grid-cols-1 sm:grid-cols-2 gap-5" onSubmit={handleSubmit}>
            {fields.map((field) => (
              <div key={field.id} className={field.id === "username" || field.id === "password" ? "sm:col-span-2" : ""}>
                <label htmlFor={field.id} className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
                  {field.label}
                </label>
                <input
                  id={field.id}
                  name={field.id}
                  type={field.type}
                  required
                  minLength={field.id === "password" ? 6 : undefined}
                  value={formData[field.id]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="block w-full px-5 py-3 rounded-2xl bg-zinc-900/50 border border-white/5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all font-medium"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={isLoading}
              className="sm:col-span-2 mt-2 w-full flex justify-center items-center py-3.5 px-4 rounded-2xl premium-gradient text-white text-sm font-bold shadow-lg shadow-indigo-500/20 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Sign up"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-zinc-500 font-medium">
            Already a member?{" "}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold ml-1 transition-colors">
              Access your account
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

export default Signup;
