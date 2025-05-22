"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Facebook, Twitter, Instagram, Menu, X } from "lucide-react";
import Link from "next/link";
import { FiSearch, FiMessageSquare, FiUsers } from "react-icons/fi";
import ContentCards from './components/ContentCards';

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
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

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

  const testimonialsPerPage = 4;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + testimonialsPerPage) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - testimonialsPerPage + testimonials.length) % testimonials.length);
  };

  const visibleTestimonials = testimonials;

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
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-indigo-900 to-indigo-800"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600 rounded-full mix-blend-overlay filter blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Navbar */}
        <div className="flex justify-between items-center py-4 px-4 relative z-10 text-white">
          <h1 className="text-4xl md:text-5xl font-black flex-1 tracking-tight relative group">
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-indigo-200 via-indigo-300 to-indigo-400 bg-clip-text text-transparent transition-all duration-500 group-hover:from-indigo-300 group-hover:to-indigo-500">Code</span>
              <span className="absolute -inset-1 bg-gradient-to-r from-indigo-200/20 to-indigo-400/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            </span>
            <span className="text-white relative inline-block ml-1">
              Legalist
              <span className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/5 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            </span>
          </h1>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            <Link
              href="/find-lawyer"
              className="hover:text-indigo-200 hover:border-b transition duration-300"
            >
              Find a Lawyer
            </Link>
          </div>
          
          <div className="md:flex space-x-4 ml-6 items-center">
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
            <div className="absolute top-full left-0 w-full shadow-md flex flex-col items-center space-y-4 py-4 md:hidden z-10 bg-indigo-600/95 backdrop-blur-sm">
              <Link
                href="/find-lawyer"
                className="hover:text-indigo-200"
              >
                Find a Lawyer
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
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-block mb-8">
              <span className="px-4 py-2 bg-indigo-900/40 text-indigo-100 rounded-full text-sm font-medium backdrop-blur-sm">
                Your Legal Companion
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-tight">
              Your Legal Journey
              <span className="block text-indigo-200 mt-2">Starts Here</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-indigo-100 max-w-3xl mx-auto leading-relaxed">
              Connect with expert lawyers, get instant legal advice, and join our community forum
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link
                href="https://frontend-ausqls22f-rxhulshxrmxs-projects.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-8 py-4 bg-white text-indigo-600 rounded-2xl hover:bg-indigo-50
                  transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl
                  font-semibold text-lg overflow-visible"
              >
                <span className="relative z-10">Ask Legal AI</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                {/* Message bubble tail */}
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white rotate-45 group-hover:bg-indigo-50 transition-colors duration-300"></div>
              </Link>
              <Link
                href="https://forumfrontend-kzyqs2twi-rxhulshxrmxs-projects.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-8 py-4 bg-indigo-900/40 hover:bg-indigo-900/60 text-white rounded-xl
                  transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl
                  font-semibold text-lg backdrop-blur-sm border border-indigo-700/20"
              >
                Join Forum
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black"></div>
      </section>

      {/* Content Cards Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Trending in Law: Verdicts, Voices, and Views
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            Catch the latest legal breakthroughs, courtroom milestones, and transformative rulings all in one place.
          </p>
          <ContentCards />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-950 border border-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm">
              <div className="w-12 h-12 bg-indigo-900/50 rounded-lg flex items-center justify-center mb-4">
                <FiSearch className="text-indigo-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Find the Right Lawyer</h3>
              <p className="text-gray-300">
                Connect with experienced lawyers who specialize in your specific
                legal needs
              </p>
            </div>
            <div className="bg-gray-950 border border-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm">
              <div className="w-12 h-12 bg-indigo-900/50 rounded-lg flex items-center justify-center mb-4">
                <FiMessageSquare className="text-indigo-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Instant Legal Advice</h3>
              <p className="text-gray-300">
                Get quick answers to your legal questions through our AI-powered
                chatbot
              </p>
            </div>
            <div className="bg-gray-950 border border-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm">
              <div className="w-12 h-12 bg-indigo-900/50 rounded-lg flex items-center justify-center mb-4">
                <FiUsers className="text-indigo-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Community Support</h3>
              <p className="text-gray-300">
                Join our legal community forum to share experiences and get
                insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-black via-indigo-900 to-indigo-800 text-white py-32">
        {/* Top decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent"></div>
        <div className="absolute top-0 left-0 right-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl transform -translate-y-1/2"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-overlay filter blur-3xl transform -translate-y-1/2"></div>
        </div>

        {/* Decorative bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* Decorative circles */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl transform translate-y-1/2"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-600 rounded-full mix-blend-overlay filter blur-3xl transform translate-y-1/2"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Your Legal Solution, One Click Away</h2>
          <p className="text-xl mb-8 text-indigo-50">
            Discover answers, connect with legal experts, and get guidance for any legal challenge. Fast, easy, and personalized. Your journey to clarity starts here.
          </p>
          <Link
            href="/find-lawyer"
            className="px-8 py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50
              transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
          >
            Find a Lawyer
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center border-gray-800 bg-black">
        <div className="flex justify-center items-center space-x-2">
          <h4 className="text-lg font-bold">Code Legalist</h4>
        </div>
        <p className="text-gray-400">
          Defining Legal Help for the Digital Age.
        </p>
        <p className="mt-4 text-gray-400">&copy; 2025 Code Legalist</p>
      </footer>
    </div>
  );
}
