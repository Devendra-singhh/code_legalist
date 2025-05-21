import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiSearch, FiX, FiMessageSquare, FiHeart, FiShare2, FiSun, FiMoon } from "react-icons/fi";
import img from "../assets/img.png";

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

  const POSTS_PER_PAGE = 6; // Increased from 3 to 6

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
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 shadow-sm transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <Link
                to="http://localhost:3000"
                className={`text-2xl font-bold ${darkMode ? 'text-white hover:text-red-400' : 'text-gray-800 hover:text-red-600'} transition-colors duration-300`}
              >
                Chat Legalist
              </Link>
              <span className="text-gray-300">|</span>
              <span className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Legal Forum
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={`pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 w-64
                    font-inter transition-colors duration-300 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                    }`}
                />
                <FiSearch
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    darkMode ? 'text-gray-400' : 'text-gray-400'
                  }`}
                  size={20}
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setIsSearchActive(false);
                      setFilteredPosts([]);
                    }}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      darkMode 
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-400 hover:text-gray-600'
                    } transition-colors duration-300`}
                  >
                    <FiX size={20} />
                  </button>
                )}
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

              {/* Auth Buttons */}
              <Link
                to="/login"
                className={`px-4 py-2 transition-colors duration-300 ${
                  darkMode 
                    ? 'text-gray-300 hover:text-red-400'
                    : 'text-gray-600 hover:text-red-500'
                }`}
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
            className={`inline-block px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md ${
              darkMode 
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'bg-white text-red-500 hover:bg-red-50'
            }`}
          >
            Join the Community
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
              !selectedCategory
                ? 'bg-red-500 text-white'
                : darkMode 
                  ? 'bg-gray-800 text-gray-200'
                  : 'bg-gray-100 text-gray-700'
            }`}
          >
            All Topics
          </button>
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-red-500 text-white'
                  : darkMode
                    ? 'bg-gray-800 text-gray-200'
                    : category.color
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading posts...
            </p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <>
            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPosts.map((post) => (
                <div
                  key={post._id}
                  className={`rounded-lg shadow-sm hover:shadow-md
                    transition-all duration-300 transform hover:scale-102
                    border h-full flex flex-col ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-100'
                    }`}
                >
                  <div className="p-6 flex flex-col flex-grow">
                    {/* Header: User Info and Category */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          darkMode ? 'bg-gray-700' : 'bg-red-50'
                        }`}>
                          <span className="text-lg font-bold text-red-500">
                            {post.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className={`font-semibold ${
                            darkMode ? 'text-white' : 'text-gray-800'
                          }`}>
                            {post.username}
                          </h3>
                          <p className={`text-xs ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {formatDate(post.createdAt)}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${post.category.color}`}>
                        {post.category.name}
                      </span>
                    </div>

                    {/* Post Content */}
                    <div className="flex-grow">
                      <p className={`mb-4 text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {post.description}
                      </p>
                      {post.city && post.state && (
                        <p className={`text-xs mb-4 flex items-center ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {post.city}, {post.state}
                        </p>
                      )}
                    </div>

                    {/* Engagement Metrics */}
                    <div className={`flex items-center justify-start space-x-6 pt-4 mt-4 border-t ${
                      darkMode ? 'border-gray-700' : 'border-gray-100'
                    }`}>
                      <button className={`flex items-center space-x-1 ${
                        darkMode 
                          ? 'text-gray-400 hover:text-red-400'
                          : 'text-gray-500 hover:text-red-500'
                        } transition-colors duration-300 group`}>
                        <FiHeart size={16} className="group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-xs">{post.likes}</span>
                      </button>
                      <button className={`flex items-center space-x-1 ${
                        darkMode 
                          ? 'text-gray-400 hover:text-red-400'
                          : 'text-gray-500 hover:text-red-500'
                        } transition-colors duration-300 group`}>
                        <FiMessageSquare size={16} className="group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-xs">{post.comments}</span>
                      </button>
                      <button className={`flex items-center space-x-1 ${
                        darkMode 
                          ? 'text-gray-400 hover:text-red-400'
                          : 'text-gray-500 hover:text-red-500'
                        } transition-colors duration-300 group`}>
                        <FiShare2 size={16} className="group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-xs">{post.shares}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {displayedPosts.length > POSTS_PER_PAGE && (
              <div className="flex justify-center items-center mt-8 space-x-4">
                <button
                  onClick={handlePrevPage}
                  className={`p-2 border rounded-full transition-all duration-300 transform hover:scale-105
                    hover:bg-red-500 hover:text-white hover:border-red-500
                    disabled:opacity-50 disabled:cursor-not-allowed ${
                      darkMode 
                        ? 'border-gray-600 text-gray-300'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  disabled={currentPage === 0}
                >
                  <FiChevronLeft size={20} />
                </button>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  className={`p-2 border rounded-full transition-all duration-300 transform hover:scale-105
                    hover:bg-red-500 hover:text-white hover:border-red-500
                    disabled:opacity-50 disabled:cursor-not-allowed ${
                      darkMode 
                        ? 'border-gray-600 text-gray-300'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  disabled={currentPage === totalPages - 1}
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default PublicFeed; 