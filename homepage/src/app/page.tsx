"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Facebook, Twitter, Instagram, Menu, X, Sun, Moon } from "lucide-react";

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [darkMode, setDarkMode] = useState(false);

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

  const testimonials = [
    {
      title: "Supreme Court Expands Right to Privacy",
      authority: "New Delhi, India",
      description: "In a landmark judgment, the Supreme Court ruled that digital privacy is a fundamental right under Article 21, influencing data protection laws nationwide."
    },
    {
      title: "Delhi High Court Bans Instant Triple Talaq",
      authority: "Delhi High Court",
      description: "Reinforcing the Muslim Women (Protection of Rights) Act, 2019, the court emphasized that verbal triple talaq is unconstitutional and void."
    },
    {
      title: "Maternity Leave Extended to 26 Weeks",
      authority: "Ministry of Labour & Employment",
      description: "The Maternity Benefit (Amendment) Act now allows 26 weeks of paid leave, promoting workplace equality for working mothers in both public and private sectors."
    },
    {
      title: "Supreme Court Issues Notice on Waqf Act Validity",
      authority: "Supreme Court of India, New Delhi",
      description: "In a major move, the apex court questioned the constitutional validity of the Waqf Act, 1995, following petitions that alleged misuse of public property and lack of accountability by Waqf Boards."
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

  return (
    <div className={`w-full min-h-screen font-sans px-4 transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      {/* Navbar */}
      <div className={`flex justify-between items-center py-4 border-b relative ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h1 className="text-2xl font-bold flex-1">Chat Legalist</h1>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          <a href="#" className={`hover:text-red-500 hover:border-b transition duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Dashboard</a>
          <a href="#" className={`hover:text-red-500 hover:border-b transition duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Database</a>
          <a href="#" className={`hover:text-red-500 hover:border-b transition duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Document Analysis</a>
        </div>
        
        <div className="md:flex space-x-4 ml-6 items-center">
          <button onClick={toggleDarkMode} className="p-2 rounded-full transition duration-300">
            {darkMode ? <Sun size={20} className="text-yellow-300" /> : <Moon size={20} className="text-gray-700" />}
          </button>
          {isLoggedIn && (
            <a href="http://localhost:3001/create-post" target="_blank" rel="noopener noreferrer">
              <button className="px-4 py-2 border rounded-lg bg-red-500 text-white hover:bg-red-700 transition duration-300">
                Create Post
              </button>
            </a>
          )}
        </div>

        {/* Hamburger Menu Icon */}
        <button onClick={toggleMenu} className="md:hidden text-2xl ml-4">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className={`absolute top-full left-0 w-full shadow-md flex flex-col items-center space-y-4 py-4 md:hidden z-10 ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}>
            <a href="#" className="hover:text-red-500">Dashboard</a>
            <a href="#" className="hover:text-red-500">Database</a>
            <a href="#" className="hover:text-red-500">Document Analysis</a>
            {isLoggedIn && (
              <a href="http://localhost:3001/create-post" target="_blank" rel="noopener noreferrer">
                <button className="px-4 py-2 border rounded-lg bg-red-500 text-white hover:bg-red-700 transition duration-300">
                  Create Post
                </button>
              </a>
            )}
            <button onClick={toggleDarkMode} className="flex items-center space-x-2">
              {darkMode ? <Sun size={16} className="text-yellow-300" /> : <Moon size={16} />}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Hero Section */}
      <div className="text-center py-12">
        <h2 className="text-4xl font-bold">Smart Legal Companion Ask, Learn, Act.</h2>
        <div className="mt-6 flex justify-center">
          <input 
            type="text" 
            placeholder="Write your Queries here" 
            className={`px-4 py-3 w-full max-w-md rounded-l-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} 
          />
          <button className="bg-red-500 hover:bg-red-700 text-white px-6 py-3 rounded-r-lg transition duration-300">Get Started</button>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="py-10 px-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold">Trending in Law: Verdicts, Voices, and Views</h3>
            <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
              Catch the latest legal breakthroughs, courtroom milestones, and transformative rulings all in one place.
            </p>
          </div>
          <a href="http://localhost:3002" target="_blank" rel="noopener noreferrer">
            <button className="px-6 py-3 rounded-lg bg-red-500 text-white hover:bg-red-700 transition duration-300">
              Join Forum
            </button>
          </a>
        </div>

        {/* Grid Layout for Testimonials */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleTestimonials.map((item, index) => (
            <div
              key={index}
              className={`border p-6 rounded-lg shadow-lg hover:shadow-2xl hover:border-red-500 transition duration-300 ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
                  : 'bg-white border-gray-200 hover:bg-red-50'
              }`}
            >
              <h4 className="font-bold">{item.title}</h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.authority}</p>
              <p className="mt-4">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center items-center mt-4 space-x-4">
          <button 
            onClick={handlePrev} 
            className={`p-2 border rounded-full hover:bg-red-500 hover:text-white transition-colors ${
              darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
            }`}
          >
            <ArrowLeft size={16} />
          </button>
          <button 
            onClick={handleNext} 
            className={`p-2 border rounded-full hover:bg-red-500 hover:text-white transition-colors ${
              darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
            }`}
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className={`mt-2 border-t py-6 text-center ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex justify-center items-center space-x-2">
          <h4 className="text-lg font-bold">Chat Legalist</h4>
        </div>
        <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
          Defining Legal Help for the Digital Age.
        </p>
        <div className="mt-4 flex justify-center space-x-6 text-red-500">
          <Facebook size={24} />
          <Twitter size={24} />
          <Instagram size={24} />
        </div>
        <p className={`mt-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>&copy; 2025 Chat Legalist</p>
      </footer>
    </div>
  );
}
