import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiSearch,
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

const News = () => {
  const [activeCategory, setActiveCategory] = useState("Latest");
  const [activeLanguage, setActiveLanguage] = useState("en-US");
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const NEWS_PER_PAGE = 9;
  const MAX_PAGINATION_ITEMS = 6;
  const categories = [
    "Latest",
    "Entertainment",
    "World",
    "Business",
    "Health",
    "Sport",
    "Science",
    "Technology",
  ];

  const languages = [
    { name: "English", code: "en-US" },
    { name: "Hindi", code: "hi-IN" },
    { name: "Marathi", code: "mr-IN" },
    { name: "Tamil", code: "ta-IN" },
    { name: "Telugu", code: "te-IN" },
    { name: "Punjabi", code: "pa-IN" },
    { name: "Bengali", code: "bn-IN" },
    { name: "Gujarati", code: "gu-IN" },
  ];

  const fetchNews = async (
    category = "Latest",
    query = "",
    language = "en-US"
  ) => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);

    try {
      let endpoint = "search";
      let keyword = category.toLowerCase();

      if (query) {
        keyword = query.toLowerCase();
      }

      const url = `https://google-news13.p.rapidapi.com/${endpoint}?keyword=${keyword}&lr=${language}`;
      const options = {
        method: "GET",
        headers: {
          "x-rapidapi-key":
            "40c5526a22mshadecf3687054b3ep1f00b3jsnb941f35fc819",
          "x-rapidapi-host": "google-news13.p.rapidapi.com",
        },
      };

      const response = await axios.request({ url, ...options });
      setNewsData(response.data.items || []);
      setTotalPages(
        Math.ceil((response.data.items?.length || 0) / NEWS_PER_PAGE)
      );
    } catch (err) {
      setError("Failed to fetch news. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(activeCategory, searchQuery, activeLanguage);
  }, [activeCategory, activeLanguage]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchNews("", searchQuery, activeLanguage);
    } else {
      fetchNews(activeCategory, "", activeLanguage);
    }
  };

  const getNewsImage = (newsItem) => {
    if (newsItem.images?.thumbnailProxied) {
      return newsItem.images.thumbnailProxied;
    }
    if (newsItem.images?.thumbnail) {
      return newsItem.images.thumbnail;
    }
    if (newsItem.subnews?.[0]?.images?.thumbnailProxied) {
      return newsItem.subnews[0].images.thumbnailProxied;
    }
    if (newsItem.subnews?.[0]?.images?.thumbnail) {
      return newsItem.subnews[0].images.thumbnail;
    }
    return "https://via.placeholder.com/600x400/f5f5f5/cccccc?text=No+Image";
  };

  const getCurrentNews = () => {
    const startIndex = (currentPage - 1) * NEWS_PER_PAGE;
    const endIndex = startIndex + NEWS_PER_PAGE;
    return newsData.slice(startIndex, endIndex);
  };

  const getPaginationRange = () => {
    const range = [];
    const half = Math.floor(MAX_PAGINATION_ITEMS / 2);
    let start = Math.max(currentPage - half, 1);
    let end = Math.min(start + MAX_PAGINATION_ITEMS - 1, totalPages);

    if (end - start + 1 < MAX_PAGINATION_ITEMS) {
      start = Math.max(end - MAX_PAGINATION_ITEMS + 1, 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center text-red-600 hover:text-red-800 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Latest News <span className="text-red-600">Updates</span>
            </h1>
            <div className="w-8"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-3 pr-12 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-3 text-gray-500 hover:text-red-600"
                >
                  <FiSearch size={24} />
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={activeLanguage}
                  onChange={(e) => setActiveLanguage(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Loading and Error States */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
              <p>{error}</p>
            </div>
          )}

          {/* News Grid */}
          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {getCurrentNews().length > 0 ? (
                  getCurrentNews().map((newsItem, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
                    >
                      <div className="h-48 overflow-hidden relative">
                        <img
                          src={getNewsImage(newsItem)}
                          alt={newsItem.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/600x400/f5f5f5/cccccc?text=No+Image";
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <span className="text-xs font-medium text-white">
                            {newsItem.publisher || "Unknown Source"}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 flex-grow flex flex-col">
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <span>
                            {new Date(
                              parseInt(newsItem.timestamp)
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2">
                          {newsItem.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                          {newsItem.snippet || newsItem.description}
                        </p>
                        <a
                          href={newsItem.newsUrl || newsItem.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          Read Full Story
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 text-lg">
                      No news found for this category/search.
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex justify-center">
                  <nav className="flex items-center space-x-1">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-full ${
                        currentPage === 1
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <FiChevronLeft size={20} />
                    </button>

                    {getPaginationRange().map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          currentPage === page
                            ? "bg-red-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-full ${
                        currentPage === totalPages
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <FiChevronRight size={20} />
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Code Legalist
              </h3>
              <p className="text-gray-600">
                Providing legal awareness and solutions for everyone through
                innovative technology.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Connect With Us
              </h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-600 hover:text-red-600">
                  <FaFacebook size={20} />
                </a>
                <a href="#" className="text-gray-600 hover:text-red-600">
                  <FaTwitter size={20} />
                </a>
                <a href="#" className="text-gray-600 hover:text-red-600">
                  <FaInstagram size={20} />
                </a>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Subscribe to our newsletter for updates
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Code Legalist. All rights
            reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default News;
