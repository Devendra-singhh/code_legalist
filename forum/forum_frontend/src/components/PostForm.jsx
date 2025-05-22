import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { toast as toastify } from 'react-toastify';
import { toast as hotToast } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';

import { API_BASE_URL } from "../config";

// Categories for post creation
const CATEGORIES = [
  { id: 1, name: "Constitutional Law", color: "bg-blue-900/50 text-blue-300" },
  { id: 2, name: "Criminal Law", color: "bg-red-900/50 text-red-300" },
  { id: 3, name: "Civil Rights", color: "bg-green-900/50 text-green-300" },
  { id: 4, name: "Family Law", color: "bg-purple-900/50 text-purple-300" },
  { id: 5, name: "Corporate Law", color: "bg-amber-900/50 text-amber-300" }
];

const PostForm = ({ username }) => {
  const [formData, setFormData] = useState({ 
    city: '', 
    state: '', 
    description: '',
    categoryId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedCategory = CATEGORIES.find(cat => cat.id === parseInt(formData.categoryId));
      
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          ...formData, 
          username,
          category: selectedCategory
        })
      });

      if (!response.ok) throw new Error('Failed to create post');

      hotToast.success('Thanks for your thoughts', {
        duration: 2000,
        position: 'top-right',
      });

      toastify.success('Post created successfully!');

      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      toastify.error(err.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-blue-400 hover:text-blue-300 mb-6 hover:cursor-pointer transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden border border-gray-800">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Share Your Thoughts</h2>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Username</label>
                <input
                  placeholder='Autofilled with your username'
                  value={username}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Category</label>
                <select
                  name="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">City</label>
                  <input
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">State</label>
                  <input
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Description</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Share your thoughts..."
                />
              </div>

              {formData.categoryId && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Selected Category:</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    CATEGORIES.find(cat => cat.id === parseInt(formData.categoryId))?.color
                  }`}>
                    {CATEGORIES.find(cat => cat.id === parseInt(formData.categoryId))?.name}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2 px-4 rounded-md text-white transition-all duration-300 ${
                  isSubmitting 
                    ? 'bg-blue-800 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02]'
                }`}
              >
                {isSubmitting ? 'Creating...' : 'Create Post'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostForm;
