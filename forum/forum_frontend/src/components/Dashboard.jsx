import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getDashboard, getPostsByUsername } from "../utils/api";
import {
  FiUser,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiTrash2,
  FiSearch,
  FiX,
  FiArrowLeft,
  FiSun,
  FiMoon,
  FiMessageSquare,
  FiHeart,
  FiShare2
} from "react-icons/fi";
import { CgProfile } from "react-icons/cg";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import img from "../assets/img.png";
import toast, { Toaster } from "react-hot-toast";
import news from "../assets/news.jpg";
import Rights from "./Rights"

const API_BASE_URL = "https://code-legalist-backend.vercel.app";

// Mock categories for demonstration
const CATEGORIES = [
  { id: 1, name: "Constitutional Law", color: "bg-blue-50 text-blue-600" },
  { id: 2, name: "Criminal Law", color: "bg-red-50 text-red-600" },
  { id: 3, name: "Civil Rights", color: "bg-green-50 text-green-600" },
  { id: 4, name: "Family Law", color: "bg-purple-50 text-purple-600" },
  { id: 5, name: "Corporate Law", color: "bg-amber-50 text-amber-600" }
];

const Dashboard = ({ token, setIsAuthenticated, view = "all" }) => {
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const POSTS_PER_PAGE = 6;
  const MAX_DESCRIPTION_LENGTH = 100;

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

  const fetchAllPosts = async () => {
    try {
      setIsLoading(true);
      const userData = await getDashboard(token);
      setUserData(userData.user);

      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      if (err.response?.status === 401) {
        setIsAuthenticated(false);
        navigate("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyPosts = async () => {
    try {
      setIsLoading(true);
      const userData = await getDashboard(token);
      setUserData(userData.user);

      const myPosts = await getPostsByUsername(userData.user.username);
      // Add mock engagement metrics and random categories to posts
      const enhancedPosts = myPosts.posts.map(post => ({
        ...post,
        likes: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 20),
        shares: Math.floor(Math.random() * 10),
        category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
      }));
      setPosts(enhancedPosts);
    } catch (err) {
      setError(err.message || "Failed to load your posts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (view === "myposts") {
      fetchMyPosts();
    } else {
      fetchAllPosts();
    }
  }, [token, navigate, setIsAuthenticated, view]);

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

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/delete-account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete account");
      }

      toast.success("Account deleted successfully");
      setIsAuthenticated(false);
      navigate("/");
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
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
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-red-50 to-red-100 text-gray-900'
    }`}>
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <header className={`sticky top-0 z-50 shadow-sm transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              {view === "myposts" && (
                <button
                  onClick={() => navigate("/dashboard")}
                  className={`mr-4 ${darkMode ? 'text-gray-300 hover:text-red-400' : 'text-gray-600 hover:text-red-600'}`}
                >
                  <FiArrowLeft size={24} />
                </button>
              )}
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

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-2"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-red-100 text-red-600'
                  }`}>
                    <FiUser size={20} />
                  </div>
                </button>

                {showProfileDropdown && (
                  <div className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 z-50 ${
                    darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
                  }`}>
                    {userData && (
                      <span className={`flex text-left items-center px-4 py-2 text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      } font-bold`}>
                        <CgProfile className="mr-2 h-4 w-4" />
                        {userData.firstName} {userData.lastName}
                      </span>
                    )}
                    <button
                      onClick={handleLogout}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        darkMode 
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      } flex items-center`}
                    >
                      <FiLogOut className="mr-2" /> Logout
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className={`w-full text-left px-4 py-2 text-sm text-red-600 ${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-red-100'
                      } flex items-center`}
                    >
                      <FiTrash2 className="mr-2" /> Delete Account
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Banner */}
      <div className="bg-red-500 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h2 className="text-3xl font-bold">Every post builds a stronger legal community. Make yours today.</h2>
          <Link
            to="/create-post"
            className="px-6 py-3 bg-white text-red-500 rounded-lg hover:bg-red-50 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
          >
            Create Post
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
        {error && (
          <div className={`mb-4 p-4 ${
            darkMode ? 'bg-red-900/50' : 'bg-red-50'
          } border-l-4 border-red-500`}>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading posts...
            </p>
          </div>
        ) : (
          <>
            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPosts.map((post) => (
                <div
                  key={post._id}
                  className={`rounded-lg shadow-sm hover:shadow-md
                    transition-all duration-300 transform hover:scale-102 hover:border-red-200
                    border ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 hover:border-red-800'
                        : 'bg-white border-gray-100'
                    }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className={`text-xl font-semibold mb-2 ${
                          darkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                          {post.username}
                        </h3>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {formatDate(post.createdAt)}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${post.category.color}`}>
                        {post.category.name}
                      </span>
                    </div>
                    <p className={`mb-4 ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {post.description}
                    </p>
                    {post.city && post.state && (
                      <p className={`text-sm mb-4 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {post.city}, {post.state}
                      </p>
                    )}
                    {/* Engagement Metrics */}
                    <div className={`flex items-center justify-between pt-4 border-t ${
                      darkMode ? 'border-gray-700' : 'border-gray-100'
                    }`}>
                      <button className={`flex items-center space-x-2 ${
                        darkMode 
                          ? 'text-gray-400 hover:text-red-400'
                          : 'text-gray-500 hover:text-red-500'
                        } transition-colors duration-300 group`}>
                        <FiHeart size={18} className="group-hover:scale-110 transition-transform duration-300" />
                        <span>{post.likes}</span>
                      </button>
                      <button className={`flex items-center space-x-2 ${
                        darkMode 
                          ? 'text-gray-400 hover:text-red-400'
                          : 'text-gray-500 hover:text-red-500'
                        } transition-colors duration-300 group`}>
                        <FiMessageSquare size={18} className="group-hover:scale-110 transition-transform duration-300" />
                        <span>{post.comments}</span>
                      </button>
                      <button className={`flex items-center space-x-2 ${
                        darkMode 
                          ? 'text-gray-400 hover:text-red-400'
                          : 'text-gray-500 hover:text-red-500'
                        } transition-colors duration-300 group`}>
                        <FiShare2 size={18} className="group-hover:scale-110 transition-transform duration-300" />
                        <span>{post.shares}</span>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-md shadow-md w-96 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Are you sure you want to delete your account?
            </h3>
            <p className={`text-sm mb-6 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`px-4 py-2 rounded ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Rights />

      {/* Footer */}
      <footer className="border-t border-gray-300 py-6 bg-gray-100 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Main footer content */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Left side - Branding */}
            <div className="text-center md:text-left mb-6 md:mb-0">
              <h4 className="text-lg sm:text-xl font-bold text-gray-800">
                Code Legalist
              </h4>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Providing legal awareness and solutions for everyone
              </p>
            </div>

            {/* Right side - Social media */}
            <div className="text-center md:text-right">
              <p className="text-gray-700 font-medium mb-2 text-sm sm:text-base">
                Follow us on social media
              </p>
              <div className="flex justify-center md:justify-end space-x-4 text-red-500">
                <a
                  href="#"
                  className="hover:text-red-700 transition-colors duration-200"
                  aria-label="Facebook"
                >
                  <FaFacebook size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
                <a
                  href="#"
                  className="hover:text-red-700 transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <FaTwitter size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
                <a
                  href="#"
                  className="hover:text-red-700 transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <FaInstagram size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-center text-gray-600 text-xs sm:text-sm">
              &copy; {new Date().getFullYear()} Chat Legalist. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
