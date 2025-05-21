"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Facebook, Twitter, Instagram, Menu, X, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { FiSearch, FiMessageSquare, FiUsers } from "react-icons/fi";

interface TrendingNewsItem {
  name: string;
  role: string;
  content: string;
  isResource?: boolean;
  isEvent?: boolean;
  isResearch?: boolean;
  isPodcast?: boolean;
  items?: string;
  date?: string;
  location?: string;
  readTime?: string;
  duration?: string;
  category?: string;
}

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

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

  // Auto-scroll effect
  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 10000); // 10 seconds pause

      return () => clearInterval(timer);
    }
  }, [isPaused]);

  // Pause on hover
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  const testimonials = [
    {
      name: "John Doe",
      role: "Business Owner",
      content: "The platform helped me find the perfect lawyer for my business needs. Highly recommended!"
    }
  ];

  const trendingNews: TrendingNewsItem[] = [
    {
      name: "Legal Templates",
      role: "Free Resources",
      content: "Access our collection of free legal document templates and guides for startups and small businesses.",
      isResource: true,
      items: "12 templates",
      category: "Business Law"
    },
    {
      name: "Tech Summit",
      role: "Upcoming Event",
      content: "Join us for the biggest legal technology conference of the year. Network with industry leaders and explore the future of law.",
      isEvent: true,
      date: "June 15-17",
      location: "San Francisco"
    },
    {
      name: "AI in Law",
      role: "Latest Research",
      content: "New study reveals how artificial intelligence is transforming legal services and improving client outcomes.",
      isResearch: true,
      readTime: "8 min read",
      category: "Technology"
    },
    {
      name: "Legal Podcast",
      role: "Featured Episode",
      content: "Listen to our latest episode: 'Navigating Corporate Law in the Digital Age'",
      isPodcast: true,
      duration: "45 min",
      category: "Corporate Law"
    },
    {
      name: "Supreme Court Ruling",
      role: "Breaking News",
      content: "Landmark decision on digital privacy rights sets new precedent for tech companies and user data protection."
    },
    {
      name: "Legal Tech Stats",
      role: "Industry Update",
      content: "78% of law firms now use AI tools for document review, up from 45% last year."
    },
    {
      name: "Global Legal Trends",
      role: "Market Insight",
      content: "Remote legal services market projected to reach $25B by 2025, growing at 15% annually."
    }
  ];

  const testimonialsPerPage = 4;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + testimonialsPerPage) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - testimonialsPerPage + testimonials.length) % testimonials.length);
  };

  const visibleTestimonials = testimonials;

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleQuerySubmit = () => {
    if (query.trim()) {
      const encodedQuery = encodeURIComponent(query.trim());
      const chatbotUrl = `https://frontend-ausqls22f-rxhulshxrmxs-projects.vercel.app/?query=${encodedQuery}`;
      console.log('Redirecting to:', chatbotUrl); // Debug log
      window.location.replace(chatbotUrl);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleQuerySubmit();
    }
  };

  return (
    <div className={`w-full min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-black text-gray-100' : 'bg-white text-gray-900'}`}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-br from-black via-indigo-900 to-indigo-800' : 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700'}`}></div>
        <div className="absolute inset-0 opacity-10">
          <div className={`absolute top-0 left-0 w-96 h-96 ${darkMode ? 'bg-indigo-500' : 'bg-indigo-200'} rounded-full mix-blend-overlay filter blur-3xl transform -translate-x-1/2 -translate-y-1/2`}></div>
          <div className={`absolute bottom-0 right-0 w-96 h-96 ${darkMode ? 'bg-indigo-600' : 'bg-indigo-300'} rounded-full mix-blend-overlay filter blur-3xl transform translate-x-1/2 translate-y-1/2`}></div>
        </div>

        {/* Navbar */}
        <div className={`flex justify-between items-center py-4 px-4 relative z-10 ${darkMode ? 'text-white' : 'text-white'}`}>
          <h1 className="text-2xl font-bold flex-1">Code Legalist</h1>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            <Link
              href="/find-lawyer"
              className="hover:text-indigo-200 hover:border-b transition duration-300"
            >
              Find a Lawyer
            </Link>
            <Link
              href="/forum"
              className="hover:text-indigo-200 hover:border-b transition duration-300"
            >
              Forum
            </Link>
            <Link
              href="/chatbot"
              className="hover:text-indigo-200 hover:border-b transition duration-300"
            >
              Chatbot
            </Link>
            <Link
              href="/login"
              className="hover:text-indigo-200 hover:border-b transition duration-300"
            >
              Login
            </Link>
          </div>
          
          <div className="md:flex space-x-4 ml-6 items-center">
            <button onClick={toggleDarkMode} className="p-2 rounded-full transition duration-300 text-white">
              {darkMode ? <Sun size={20} className="text-yellow-300" /> : <Moon size={20} />}
            </button>
            {isLoggedIn && (
              <a href="http://localhost:5173/create-post" target="_blank" rel="noopener noreferrer">
                <button className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition duration-300">
                  Create Post
                </button>
              </a>
            )}
          </div>

          {/* Hamburger Menu Icon */}
          <button onClick={toggleMenu} className="md:hidden text-2xl ml-4 text-white">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className={`absolute top-full left-0 w-full shadow-md flex flex-col items-center space-y-4 py-4 md:hidden z-10 bg-indigo-600/95 backdrop-blur-sm`}>
              <Link
                href="/find-lawyer"
                className="hover:text-indigo-200"
              >
                Find a Lawyer
              </Link>
              <Link
                href="/forum"
                className="hover:text-indigo-200"
              >
                Forum
              </Link>
              <Link
                href="/chatbot"
                className="hover:text-indigo-200"
              >
                Chatbot
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30
                  transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
              >
                Login
              </Link>
              {isLoggedIn && (
                <a href="http://localhost:5173/create-post" target="_blank" rel="noopener noreferrer">
                  <button className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition duration-300">
                    Create Post
                  </button>
                </a>
              )}
              <button onClick={toggleDarkMode} className="flex items-center space-x-2 text-white">
                {darkMode ? <Sun size={16} className="text-yellow-300" /> : <Moon size={16} />}
                <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-block mb-8">
              <span className={`px-4 py-2 ${darkMode ? 'bg-indigo-900/40 text-indigo-100' : 'bg-white/20 text-white'} rounded-full text-sm font-medium backdrop-blur-sm`}>
                Your Legal Companion
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-tight">
              Your Legal Journey
              <span className={`block ${darkMode ? 'text-indigo-200' : 'text-white'} mt-2`}>Starts Here</span>
            </h1>
            <p className={`text-xl md:text-2xl mb-12 ${darkMode ? 'text-indigo-100' : 'text-white'} max-w-3xl mx-auto leading-relaxed`}>
              Connect with expert lawyers, get instant legal advice, and join our community forum
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link
                href="https://frontend-ausqls22f-rxhulshxrmxs-projects.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-8 py-4 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50
                  transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl
                  font-semibold text-lg relative overflow-hidden"
              >
                <span className="relative z-10">Ask Legal AI</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link
                href="/forum"
                className={`group px-8 py-4 ${darkMode ? 'bg-indigo-900/40 hover:bg-indigo-900/60' : 'bg-white/20 hover:bg-white/30'} text-white rounded-xl
                  transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl
                  font-semibold text-lg backdrop-blur-sm border ${darkMode ? 'border-indigo-700/20' : 'border-white/20'}`}
              >
                Join Forum
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className={`absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t ${darkMode ? 'from-black' : 'from-white'} to-transparent`}></div>
      </section>

      {/* Trending Topics */}
      <div className="py-10 px-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Trending in Law: Verdicts, Voices, and Views</h3>
            <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
              Catch the latest legal breakthroughs, courtroom milestones, and transformative rulings all in one place.
            </p>
          </div>
        </div>

        {/* Grid Layout for Trending News */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingNews.map((item, index) => (
            <div
              key={index}
              className={`${darkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border-gray-200'} p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm`}
            >
              {item.isPodcast && (
                <>
                  <div className="absolute top-4 right-4">
                    <div className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-600'}`}>
                      {item.duration}
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 ${darkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'} rounded-lg flex items-center justify-center`}>
                      <svg className={`w-6 h-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</h4>
                      <p className={`text-sm ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{item.category}</p>
                    </div>
                  </div>
                  <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.content}</p>
                  <button className={`mt-4 w-full py-2 rounded-lg ${darkMode ? 'bg-indigo-900/50 hover:bg-indigo-900/70' : 'bg-indigo-100 hover:bg-indigo-200'} transition-colors duration-300 flex items-center justify-center space-x-2`}>
                    <svg className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={`${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>Listen Now</span>
                  </button>
                </>
              )}

              {item.isEvent && (
                <>
                  <div className="absolute top-4 right-4">
                    <div className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-600'}`}>
                      {item.date}
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 ${darkMode ? 'bg-green-900/50' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
                      <svg className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</h4>
                      <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{item.location}</p>
                    </div>
                  </div>
                  <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.content}</p>
                  <button className={`mt-4 w-full py-2 rounded-lg ${darkMode ? 'bg-green-900/50 hover:bg-green-900/70' : 'bg-green-100 hover:bg-green-200'} transition-colors duration-300 flex items-center justify-center space-x-2`}>
                    <svg className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className={`${darkMode ? 'text-green-300' : 'text-green-600'}`}>Register Now</span>
                  </button>
                </>
              )}

              {item.isResearch && (
                <>
                  <div className="absolute top-4 right-4">
                    <div className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-600'}`}>
                      {item.readTime}
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 ${darkMode ? 'bg-purple-900/50' : 'bg-purple-100'} rounded-lg flex items-center justify-center`}>
                      <svg className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</h4>
                      <p className={`text-sm ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{item.category}</p>
                    </div>
                  </div>
                  <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.content}</p>
                  <button className={`mt-4 w-full py-2 rounded-lg ${darkMode ? 'bg-purple-900/50 hover:bg-purple-900/70' : 'bg-purple-100 hover:bg-purple-200'} transition-colors duration-300 flex items-center justify-center space-x-2`}>
                    <svg className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className={`${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>Read More</span>
                  </button>
                </>
              )}

              {item.isResource && (
                <>
                  <div className="absolute top-4 right-4">
                    <div className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                      {item.items}
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 ${darkMode ? 'bg-blue-900/50' : 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
                      <svg className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</h4>
                      <p className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{item.category}</p>
                    </div>
                  </div>
                  <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.content}</p>
                  <button className={`mt-4 w-full py-2 rounded-lg ${darkMode ? 'bg-blue-900/50 hover:bg-blue-900/70' : 'bg-blue-100 hover:bg-blue-200'} transition-colors duration-300 flex items-center justify-center space-x-2`}>
                    <svg className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className={`${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Download</span>
                  </button>
                </>
              )}

              {!item.isPodcast && !item.isEvent && !item.isResearch && !item.isResource && (
                <>
                  <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.role}</p>
                  <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.content}</p>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center items-center mt-4 space-x-4">
          <button 
            onClick={handlePrev} 
            className={`p-2 border rounded-full hover:bg-indigo-600 hover:text-white transition-colors ${
              darkMode ? 'border-gray-800 text-gray-300' : 'border-gray-300 text-gray-700'
            }`}
          >
            <ArrowLeft size={16} />
          </button>
          <button 
            onClick={handleNext} 
            className={`p-2 border rounded-full hover:bg-indigo-600 hover:text-white transition-colors ${
              darkMode ? 'border-gray-800 text-gray-300' : 'border-gray-300 text-gray-700'
            }`}
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Features Section */}
      <section className={`py-20 ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl font-bold text-center mb-12 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`${darkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm`}>
              <div className="w-12 h-12 bg-indigo-900/50 rounded-lg flex items-center justify-center mb-4">
                <FiSearch className="text-indigo-400" size={24} />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Find the Right Lawyer</h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Connect with experienced lawyers who specialize in your specific
                legal needs
              </p>
            </div>
            <div className={`${darkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm`}>
              <div className="w-12 h-12 bg-indigo-900/50 rounded-lg flex items-center justify-center mb-4">
                <FiMessageSquare className="text-indigo-400" size={24} />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Instant Legal Advice</h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Get quick answers to your legal questions through our AI-powered
                chatbot
              </p>
            </div>
            <div className={`${darkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm`}>
              <div className="w-12 h-12 bg-indigo-900/50 rounded-lg flex items-center justify-center mb-4">
                <FiUsers className="text-indigo-400" size={24} />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Community Support</h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Join our legal community forum to share experiences and get
                insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={`py-20 ${darkMode ? 'bg-black' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl font-bold text-center mb-12 ${darkMode ? 'text-white' : 'text-gray-900'}`}>What Our Users Say</h2>
          <div className="flex justify-center">
            <div className={`max-w-2xl ${darkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white'} p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm`}>
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-indigo-900/50 rounded-full flex items-center justify-center">
                  <span className="text-indigo-400 text-2xl font-semibold">
                    {testimonials[0].name[0]}
                  </span>
                </div>
                <div className="ml-6">
                  <h4 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{testimonials[0].name}</h4>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{testimonials[0].role}</p>
                </div>
              </div>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{testimonials[0].content}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`${darkMode ? 'bg-gradient-to-br from-black via-indigo-900 to-indigo-800' : 'bg-gradient-to-r from-indigo-600 to-indigo-700'} text-white py-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-indigo-50">
            Join our community today and take the first step towards better legal
            support
          </p>
          <Link
            href="/signup"
            className="px-8 py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50
              transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
          >
            Sign Up Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={`mt-2 border-t py-6 text-center ${darkMode ? 'border-gray-800 bg-black' : 'border-gray-200'}`}>
        <div className="flex justify-center items-center space-x-2">
          <h4 className="text-lg font-bold">Code Legalist</h4>
        </div>
        <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
          Defining Legal Help for the Digital Age.
        </p>
        <div className="mt-4 flex justify-center space-x-6 text-indigo-600">
          <Facebook size={24} />
          <Twitter size={24} />
          <Instagram size={24} />
        </div>
        <p className={`mt-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>&copy; 2025 Code Legalist</p>
      </footer>
    </div>
  );
}