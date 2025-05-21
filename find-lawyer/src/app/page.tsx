  <Link
    href="/"
    className="px-4 py-2 text-gray-600 hover:text-indigo-600 transition-colors duration-300"
  >
    Home
  </Link>
  <Link
    href="/forum"
    className="px-4 py-2 text-gray-600 hover:text-indigo-600 transition-colors duration-300"
  >
    Forum
  </Link>
  <Link
    href="/chatbot"
    className="px-4 py-2 text-gray-600 hover:text-indigo-600 transition-colors duration-300"
  >
    Chatbot
  </Link>
  <Link
    href="/login"
    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
      transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
  >
    Login
  </Link>

{/* Hero Section */}
<section className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-20">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-6">
        Find Your Perfect Legal Match
      </h1>
      <p className="text-xl md:text-2xl mb-8 text-indigo-50">
        Connect with experienced lawyers who specialize in your specific legal needs
      </p>
    </div>
  </div>
</section>

{/* Search Section */}
<section className="py-12 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Practice Area
          </label>
          <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="">Select Practice Area</option>
            <option value="criminal">Criminal Law</option>
            <option value="civil">Civil Law</option>
            <option value="family">Family Law</option>
            <option value="corporate">Corporate Law</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            placeholder="Enter city or state"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience
          </label>
          <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="">Select Experience</option>
            <option value="0-5">0-5 years</option>
            <option value="5-10">5-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>
      </div>
      <div className="mt-6 flex justify-center">
        <button className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
          transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md">
          Search Lawyers
        </button>
      </div>
    </div>
  </div>
</section>

{/* Lawyer Cards */}
<section className="py-12">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {lawyers.map((lawyer) => (
        <div key={lawyer.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 text-2xl font-semibold">
                  {lawyer.name[0]}
                </span>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold">{lawyer.name}</h3>
                <p className="text-gray-600">{lawyer.specialization}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Experience:</span> {lawyer.experience}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Location:</span> {lawyer.location}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Rating:</span> {lawyer.rating}/5
              </p>
            </div>
            <div className="mt-6 flex justify-between items-center">
              <button className="px-4 py-2 text-indigo-600 hover:text-indigo-700 transition-colors">
                View Profile
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
                transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md">
                Contact
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section> 