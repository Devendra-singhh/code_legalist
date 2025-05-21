import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiSearch, FiX, FiMessageSquare, FiHeart, FiShare2 } from "react-icons/fi";
import img from "../assets/img.png";
import axios from "axios";
import { format } from "date-fns";

const API_BASE_URL = "https://code-legalist-backend.vercel.app";

// Mock categories for demonstration
const CATEGORIES = [
  { id: 1, name: "Constitutional Law", color: "bg-blue-50 text-blue-600" },
  { id: 2, name: "Criminal Law", color: "bg-red-50 text-red-600" },
  { id: 3, name: "Civil Rights", color: "bg-green-50 text-green-600" },
  { id: 4, name: "Family Law", color: "bg-purple-50 text-purple-600" },
  { id: 5, name: "Corporate Law", color: "bg-amber-50 text-amber-600" }
];

const PublicFeed = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const POSTS_PER_PAGE = 6;

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MmQ3MjZjYzc2NmU2ZjgxZDYwNWIzNyIsImlhdCI6MTc0NzgwODg3NywiZXhwIjoxNzQ3ODk1Mjc3fQ.WNXz2cMhN2hbN7Yl3La_Lg9N7KDanVyx-an3B_bC77k'
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const postsData = await response.json();
      // Add mock engagement metrics and random categories to posts
      const enhancedPosts = (postsData.posts || postsData).map(post => ({
        ...post,
        likes: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 20),
        shares: Math.floor(Math.random() * 10),
        category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
      }));
      setPosts(enhancedPosts);
    } catch (err) {
      setError(err.message || "Failed to load data");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setIsSearchActive(false);
      setFilteredPosts([]);
      setCurrentPage(0);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = posts.filter((post) => {
      const usernameMatch = post.username.toLowerCase().includes(query);
      const dateMatch = formatDate(post.createdAt).toLowerCase().includes(query);
      const keywordMatch =
        post.description.toLowerCase().includes(query) ||
        (post.city && post.city.toLowerCase().includes(query)) ||
        (post.state && post.state.toLowerCase().includes(query));
      return usernameMatch || dateMatch || keywordMatch;
    });

    setFilteredPosts(filtered);
    setIsSearchActive(true);
    setCurrentPage(0);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const filteredByCategory = (posts) => {
    if (!selectedCategory) return posts;
    return posts.filter(post => post.category.id === selectedCategory);
  };

  const displayedPosts = filteredByCategory(isSearchActive ? filteredPosts : posts);
  const totalPages = Math.ceil(displayedPosts.length / POSTS_PER_PAGE);
  const currentPosts = displayedPosts.slice(
    currentPage * POSTS_PER_PAGE,
    (currentPage + 1) * POSTS_PER_PAGE
  );

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <div className="min-h-screen font-sans bg-black">
      {/* Combined Gradient Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-indigo-900 to-indigo-800"></div>
        
        {/* Navbar */}
        <div className="relative">
          <div className="w-full px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-6">
                <a href="http://localhost:3000" className="relative group text-3xl font-bold text-white hover:text-indigo-300 transition-colors duration-300">
                  <span className="absolute -inset-2 bg-gradient-to-r from-indigo-200/40 to-indigo-400/40 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                  <span className="relative">Code Legalist</span>
                </a>
              </div>

              <div className="flex items-center space-x-4">
                {/* Navigation Links */}
                <Link
                  to="/"
                  className="px-4 py-2 text-gray-200 hover:text-white transition-colors duration-300"
                >
                  Forum Home
                </Link>

                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 w-64
                      font-inter bg-black/30 border-gray-300/30 text-white placeholder-gray-300"
                  />
                  <FiSearch
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300"
                    size={20}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setIsSearchActive(false);
                        setFilteredPosts([]);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors duration-300"
                    >
                      <FiX size={20} />
                    </button>
                  )}
                </div>

                {/* Auth Buttons */}
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-200 hover:text-white transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50
                    transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Content */}
        <div className="relative text-white py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Welcome to the Legal Forum</h2>
            <p className="text-lg mb-6 text-indigo-50">
              Join the conversation on the latest legal developments and insights
            </p>
            <Link
              to="/signup"
              className="inline-block px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50
                transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
            >
              Get Started
            </Link>
          </div>
          {/* Gradient Transition */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 bg-black">
        {/* Categories and Create Post */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Categories</h3>
            <div className="flex flex-wrap gap-3">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                    ${category.color}
                    ${selectedCategory === category.id ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}
                    hover:shadow-md`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          <Link
            to="/create-post"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
              transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
          >
            Create Post
          </Link>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentPosts.map((post) => (
            <div
              key={post._id}
              className="bg-gray-950 border border-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-white">{post.username}</h4>
                    <p className="text-sm text-gray-400">{formatDate(post.createdAt)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${post.category.color}`}>
                    {post.category.name}
                  </span>
                </div>
                <p className="text-gray-300 mb-4">{post.description}</p>
                <div className="flex items-center justify-between text-gray-400">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 hover:text-indigo-400">
                      <FiHeart size={18} />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-indigo-400">
                      <FiMessageSquare size={18} />
                      <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-indigo-400">
                      <FiShare2 size={18} />
                      <span>{post.shares}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-4">
            <button
              onClick={handlePrevPage}
              className="p-2 border border-gray-700 rounded-full hover:bg-indigo-600 hover:text-white transition-colors"
            >
              <FiChevronLeft size={16} />
            </button>
            <span className="text-gray-400">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              className="p-2 border border-gray-700 rounded-full hover:bg-indigo-600 hover:text-white transition-colors"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">&copy; 2025 Chat Legalist. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicFeed; 