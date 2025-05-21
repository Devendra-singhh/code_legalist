import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { toast as toastify } from 'react-toastify';
import { toast as hotToast } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';

import { API_BASE_URL } from "../config";

// Categories for post creation
const CATEGORIES = [
  { id: 1, name: "Constitutional Law", color: "bg-blue-50 text-blue-600" },
  { id: 2, name: "Criminal Law", color: "bg-red-50 text-red-600" },
  { id: 3, name: "Civil Rights", color: "bg-green-50 text-green-600" },
  { id: 4, name: "Family Law", color: "bg-purple-50 text-purple-600" },
  { id: 5, name: "Corporate Law", color: "bg-amber-50 text-amber-600" }
];

const PostForm = ({ username }) => {
  const [formData, setFormData] = useState({ 
    city: '', 
    state: '', 
    description: '',
    categoryId: '' // Added category field
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
      // Find the selected category
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
          category: selectedCategory // Include the full category object
        })
      });

      if (!response.ok) throw new Error('Failed to create post');

      // Show hot toast for "Thanks for your thoughts"
      hotToast.success('Thanks for your thoughts', {
        duration: 2000,
        position: 'top-right',
      });

      // Show react-toastify toast for success
      toastify.success('Post created successfully!');

      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      toastify.error(err.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-red-600 hover:text-red-800 mb-6 hover:cursor-pointer"
        >
          <FiArrowLeft className="mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-red-600 px-6 py-3">
            <h2 className="text-xl font-bold text-white">Share Your Thoughts</h2>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Username</label>
                <input
                  placeholder='Autofilled with your username'
                  value={username}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 border rounded-md"
                />
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Category</label>
                <select
                  name="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md bg-white"
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
                  <label className="block text-sm text-gray-600 mb-1">City</label>
                  <input
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">State</label>
                  <input
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Description</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Share your thoughts..."
                />
              </div>

              {/* Preview Category Badge */}
              {formData.categoryId && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Selected Category:</span>
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
                className={`w-full py-2 px-4 rounded-md text-white ${isSubmitting ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'}`}
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
