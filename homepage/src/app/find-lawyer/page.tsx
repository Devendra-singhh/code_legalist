"use client";

import { useState } from "react";
import { Search, MapPin, Star, Filter } from "lucide-react";

interface Category {
  title: string;
  subcategories: string[];
}

interface Lawyer {
  id: number;
  name: string;
  specialization: string;
  location: string;
  rating: number;
  reviews: number;
  experience: number;
}

export default function FindLawyer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories: Category[] = [
    {
      title: "Personal / Family",
      subcategories: ["Divorce", "Family Dispute", "Child Custody", "Muslim Law", "Medical Negligence", "Motor Accident"]
    },
    {
      title: "Criminal / Property",
      subcategories: ["Criminal", "Property", "Landlord / Tenant", "Cyber Crime", "Wills / Trusts"]
    },
    {
      title: "Labour & Service",
      subcategories: ["Labour Law", "Service Matters", "Employment Disputes"]
    },
    {
      title: "Civil / Debt Matters",
      subcategories: ["Documentation", "Consumer Court", "Civil", "Cheque Bounce", "Recovery"]
    },
    {
      title: "Corporate Law",
      subcategories: ["Arbitration", "Trademark & Copyright", "Customs & Central Excise", "Startup"]
    },
    {
      title: "Banking / Finance",
      subcategories: ["GST", "Corporate", "Tax"]
    },
    {
      title: "Others",
      subcategories: ["Armed Forces Tribunal", "Supreme Court", "Insurance", "Immigration", "International Law"]
    }
  ];

  // Sample data - will be replaced with database data
  const sampleLawyers: Lawyer[] = [
    {
      id: 1,
      name: "Adv. Rajesh Kumar",
      specialization: "Family Law",
      location: "Delhi",
      rating: 4.8,
      reviews: 124,
      experience: 15
    },
    {
      id: 2,
      name: "Adv. Priya Sharma",
      specialization: "Corporate Law",
      location: "Mumbai",
      rating: 4.9,
      reviews: 89,
      experience: 12
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Find a Lawyer</h1>
          <p className="text-gray-700">Connect with experienced legal professionals</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="w-full">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by name, specialization, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 text-gray-900"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Filter size={20} />
                Filters
              </button>
            </div>
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-white shadow-sm">
              {/* Categories */}
              <div>
                <h3 className="font-semibold mb-2 text-gray-900">Practice Area</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedCategory(category.title)}
                      className={`text-left p-2 rounded text-gray-700 ${
                        selectedCategory === category.title
                          ? 'bg-red-50 text-red-600'
                          : 'hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      {category.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div>
                <h3 className="font-semibold mb-2 text-gray-900">Location</h3>
                <div className="grid grid-cols-2 gap-2">
                  {["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad"].map((location) => (
                    <button
                      key={location}
                      onClick={() => setSelectedLocation(location)}
                      className={`text-left p-2 rounded flex items-center gap-2 text-gray-700 ${
                        selectedLocation === location
                          ? 'bg-red-50 text-red-600'
                          : 'hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      <MapPin size={16} />
                      {location}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mt-8">
          <div className="grid gap-4">
            {sampleLawyers.map((lawyer) => (
              <div key={lawyer.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{lawyer.name}</h3>
                    <p className="text-gray-700">{lawyer.specialization}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <MapPin size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-700">{lawyer.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-400" />
                        <span className="text-sm text-gray-900">{lawyer.rating}</span>
                        <span className="text-sm text-gray-600">({lawyer.reviews} reviews)</span>
                      </div>
                      <span className="text-sm text-gray-600">{lawyer.experience} years experience</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 