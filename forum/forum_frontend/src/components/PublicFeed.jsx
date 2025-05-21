import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiSearch, FiX, FiMessageSquare, FiHeart, FiShare2, FiSun, FiMoon } from "react-icons/fi";
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
  const [darkMode, setDarkMode] = useState(false);

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

  // Effect to initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme === 'dark');
  }, []);

  // Effect to apply dark mode class and save to localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

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
    <div className="min-h-screen font-sans bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <a href="http://localhost:3000" className="text-2xl font-bold flex-1">Code Legalist</a>
              <span className="text-gray-300">|</span>
              <span className="text-lg text-gray-600">
                Legal Forum
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Navigation Links */}
              <Link
                to="/"
                className="px-4 py-2 text-gray-600 hover:text-red-500 transition-colors duration-300"
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
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 w-64
                    font-inter bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                />
                <FiSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setIsSearchActive(false);
                      setFilteredPosts([]);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                  >
                    <FiX size={20} />
                  </button>
                )}
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full transition duration-300 flex items-center justify-center hover:bg-gray-100"
                aria-label="Toggle dark mode"
              >
                <FiMoon size={20} className="text-gray-700" />
              </button>

              {/* Auth Buttons */}
              <Link
                to="/login"
                className="px-4 py-2 text-gray-600 hover:text-red-500 transition-colors duration-300"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600
                  transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-red-400 to-red-500 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Welcome to the Legal Forum</h2>
          <p className="text-lg mb-6 text-red-50">
            Join the conversation on the latest legal developments and insights
          </p>
          <Link
            to="/signup"
            className="inline-block px-6 py-3 bg-white text-red-500 rounded-lg hover:bg-red-50
              transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 bg-white">
        {/* Categories and Create Post */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Categories</h3>
            <div className="flex flex-wrap gap-3">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                    ${category.color}
                    ${selectedCategory === category.id ? 'ring-2 ring-offset-2 ring-red-500' : ''}
                    hover:shadow-md`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          <Link
            to="/create-post"
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600
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
              className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={img}
                      alt={post.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{post.username}</h4>
                      <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${post.category.color}`}>
                    {post.category.name}
                  </span>
                </div>
                <p className="text-gray-700 mb-4">{post.description}</p>
                <div className="flex items-center justify-between text-gray-500">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 hover:text-red-500">
                      <FiHeart size={18} />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-red-500">
                      <FiMessageSquare size={18} />
                      <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-red-500">
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
              className="p-2 border border-gray-300 rounded-full hover:bg-red-500 hover:text-white transition-colors"
            >
              <FiChevronLeft size={16} />
            </button>
            <span className="text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              className="p-2 border border-gray-300 rounded-full hover:bg-red-500 hover:text-white transition-colors"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">&copy; 2025 Chat Legalist. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicFeed; 