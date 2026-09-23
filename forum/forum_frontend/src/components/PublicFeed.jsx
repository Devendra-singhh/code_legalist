import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiSearch, FiX, FiHeart, FiMessageSquare, FiShare2, FiPlus } from "react-icons/fi";
import { API_BASE_URL } from "../config";

// Premium categories with refined colors
const CATEGORIES = [
  { id: 1, name: "Constitutional Law", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { id: 2, name: "Criminal Law", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  { id: 3, name: "Civil Rights", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { id: 4, name: "Family Law", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  { id: 5, name: "Corporate Law", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" }
];

const PublicFeed = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const POSTS_PER_PAGE = 6;

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/posts`);
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      const rawPosts = Array.isArray(data) ? data : (data.posts || []);
      
      // Inject premium metadata for demo consistency
      const enhancedPosts = rawPosts.map(post => ({
        ...post,
        likes: post.likes ?? Math.floor(Math.random() * 50),
        comments: post.comments ?? Math.floor(Math.random() * 20),
        shares: post.shares ?? Math.floor(Math.random() * 10),
        category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
      }));
      
      setPosts(enhancedPosts);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load community discussions. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Recently";
    }
  };

  // Search & Filter Logic
  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery.trim() || 
      post.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || post.category.id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const currentPosts = filteredPosts.slice(
    currentPage * POSTS_PER_PAGE,
    (currentPage + 1) * POSTS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      
      {/* ── Glass Header ── */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                Code Legalist <span className="text-zinc-500 font-medium">Forum</span>
              </span>
            </a>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium text-indigo-400 border-b-2 border-indigo-500 pb-5 translate-y-[10px]">
                Public Feed
              </Link>
              <a href="/chat" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                AI Consultant
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group hidden sm:block">
              <input
                type="text"
                placeholder="Search legal topics..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(0); }}
                className="w-64 bg-zinc-900/50 border border-white/10 rounded-full px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all placeholder-zinc-500"
              />
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <FiX />
                </button>
              )}
            </div>
            
            <Link to="/login" className="text-sm font-semibold text-zinc-400 hover:text-white px-4">
              Login
            </Link>
            <Link to="/signup" className="px-5 py-2 premium-gradient text-white text-sm font-bold rounded-full shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
              Join Community
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero/Banner ── */}
      <section className="relative pt-12 pb-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Legal Wisdom, <span className="text-indigo-400">Crowdsourced.</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Collaborate with legal experts, law students, and fellow seekers. 
            Discuss Indian statutes, landmark judgments, and procedural queries.
          </p>
        </div>
      </section>

      {/* ── Filters & Action ── */}
      <div className="max-w-7xl mx-auto px-4 w-full mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(selectedCategory === cat.id ? null : cat.id); setCurrentPage(0); }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selectedCategory === cat.id 
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : `${cat.color} hover:bg-white/5`
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          
          <Link to="/create-post" className="flex items-center justify-center gap-2 bg-zinc-900 border border-white/10 px-5 py-2.5 rounded-xl hover:bg-zinc-800 transition-colors">
            <FiPlus className="text-indigo-400" />
            <span className="text-sm font-bold">Start a Discussion</span>
          </Link>
        </div>
      </div>

      {/* ── Post Feed ── */}
      <main className="flex-1 max-w-7xl mx-auto px-4 w-full pb-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-zinc-900/50 rounded-2xl border border-white/5" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={fetchPosts} className="text-sm font-bold text-red-400 underline hvr-grow">Retry Loading</button>
          </div>
        ) : currentPosts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-zinc-500">No discussions found matching your filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPosts.map((post) => (
              <article 
                key={post._id} 
                className="premium-card p-6 rounded-2xl flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center font-bold text-xs text-zinc-300">
                      {post.username?.charAt(0).toUpperCase() || "L"}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{post.username || "Legalist User"}</p>
                      <p className="text-[10px] text-zinc-500 font-medium">{formatDate(post.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${post.category.color}`}>
                    {post.category.name}
                  </span>
                </div>

                <p className="text-zinc-300 text-sm leading-relaxed flex-1 line-clamp-4">
                  {post.description}
                </p>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-zinc-500">
                    <button className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                      <FiHeart className="w-4 h-4" />
                      <span className="text-xs font-medium">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                      <FiMessageSquare className="w-4 h-4" />
                      <span className="text-xs font-medium">{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                      <FiShare2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest hover:text-indigo-300">
                    Read More
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-4">
            <button 
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="p-2.5 rounded-full bg-zinc-900 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-zinc-500">
              Page <span className="text-white">{currentPage + 1}</span> of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="p-2.5 rounded-full bg-zinc-900 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>

      {/* ── Mini Footer ── */}
      <footer className="py-8 border-t border-white/5 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
            Defining Legal Help for the Digital Age · © 2025 Code Legalist
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicFeed;