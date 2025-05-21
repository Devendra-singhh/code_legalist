"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Facebook, Twitter, Instagram, Menu, X } from "lucide-react";
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
            <a
              href="https://forumfrontend-kzyqs2twi-rxhulshxrmxs-projects.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-200 hover:border-b transition duration-300"
            >
              Forum
            </a>
            <Link
              href="/login"
              className="hover:text-indigo-200 hover:border-b transition duration-300"
            >
              Login
            </Link>
          </div>
          
          <div className="md:flex space-x-4 ml-6 items-center">
            {isLoggedIn && (
              <a href={`${process.env.NEXT_PUBLIC_FORUM_URL || 'https://forumfrontend-kzyqs2twi-rxhulshxrmxs-projects.vercel.app'}/create-post`} target="_blank" rel="noopener noreferrer">
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
              <a
                href="https://forumfrontend-kzyqs2twi-rxhulshxrmxs-projects.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-200"
              >
                Forum
              </a>
              <Link
                href="/login"
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30
                  transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
              >
                Login
              </Link>
              {isLoggedIn && (
                <a href={`${process.env.NEXT_PUBLIC_FORUM_URL || 'https://forumfrontend-kzyqs2twi-rxhulshxrmxs-projects.vercel.app'}/create-post`} target="_blank" rel="noopener noreferrer">
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
                href={process.env.NEXT_PUBLIC_FORUM_URL || 'https://forumfrontend-kzyqs2twi-rxhulshxrmxs-projects.vercel.app'}
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

      {/* Trending Topics */}
      <div className="py-10 px-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-white">Trending in Law: Verdicts, Voices, and Views</h3>
            <p className="text-gray-400">
              Catch the latest legal breakthroughs, courtroom milestones, and transformative rulings all in one place.
            </p>
          </div>
        </div>

        {/* Grid Layout for Trending News */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingNews.map((item, index) => (
            <div
              key={index}
              className="bg-gray-900/50 border border-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm"
            >
              {item.isPodcast && (
                <>
                  <div className="absolute top-4 right-4">
                    <div className="px-3 py-1 rounded-full text-sm bg-indigo-900/50 text-indigo-300">
                      {item.duration}
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-indigo-900/50 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-white">
                        {item.name}
                      </h4>
                      <p className="text-sm text-indigo-400">
                        {item.category}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-300">
                    {item.content}
                  </p>
                  <button className="mt-4 w-full py-2 rounded-lg bg-indigo-900/50 hover:bg-indigo-900/70 transition-colors duration-300 flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-indigo-300">Listen Now</span>
                  </button>
                </>
              )}

              {item.isEvent && (
                <>
                  <div className="absolute top-4 right-4">
                    <div className="px-3 py-1 rounded-full text-sm bg-green-900/50 text-green-300">
                      {item.date}
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-white">
                        {item.name}
                      </h4>
                      <p className="text-sm text-green-400">
                        {item.location}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-300">
                    {item.content}
                  </p>
                  <button className="mt-4 w-full py-2 rounded-lg bg-green-900/50 hover:bg-green-900/70 transition-colors duration-300 flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-green-300">Register Now</span>
                  </button>
                </>
              )}

              {item.isResearch && (
                <>
                  <div className="absolute top-4 right-4">
                    <div className="px-3 py-1 rounded-full text-sm bg-purple-900/50 text-purple-300">
                      {item.readTime}
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-white">
                        {item.name}
                      </h4>
                      <p className="text-sm text-purple-400">
                        {item.category}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-300">
                    {item.content}
                  </p>
                  <button className="mt-4 w-full py-2 rounded-lg bg-purple-900/50 hover:bg-purple-900/70 transition-colors duration-300 flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-purple-300">Read More</span>
                  </button>
                </>
              )}

              {item.isResource && (
                <>
                  <div className="absolute top-4 right-4">
                    <div className="px-3 py-1 rounded-full text-sm bg-blue-900/50 text-blue-300">
                      {item.items}
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-white">
                        {item.name}
                      </h4>
                      <p className="text-sm text-blue-400">
                        {item.category}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-300">
                    {item.content}
                  </p>
                  <button className="mt-4 w-full py-2 rounded-lg bg-blue-900/50 hover:bg-blue-900/70 transition-colors duration-300 flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="text-blue-300">Download</span>
                  </button>
                </>
              )}

              {!item.isPodcast && !item.isEvent && !item.isResearch && !item.isResource && (
                <>
                  <h4 className="font-bold text-white">
                    {item.name}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {item.role}
                  </p>
                  <p className="mt-4 text-gray-300">
                    {item.content}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center items-center mt-4 space-x-4">
          <button 
            onClick={handlePrev} 
            className="p-2 border rounded-full hover:bg-indigo-600 hover:text-white transition-colors border-gray-800 text-gray-300"
          >
            <ArrowLeft size={16} />
          </button>
          <button 
            onClick={handleNext} 
            className="p-2 border rounded-full hover:bg-indigo-600 hover:text-white transition-colors border-gray-800 text-gray-300"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

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