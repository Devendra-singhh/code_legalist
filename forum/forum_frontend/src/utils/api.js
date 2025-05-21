const API_BASE_URL = "https://code-legalist-backend.vercel.app";


export const signup = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        password: formData.password
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    return data;
  } catch (error) {
    console.error("Signup API Error:", error);
    throw error;
  }
};

export const login = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: formData.username,
        password: formData.password
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Invalid credentials");
    }

    return data;
  } catch (error) {
    console.error("Login API Error:", error);
    throw error;
  }
};

export const getDashboard = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/dashboard`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch user data");
    }

    return data;
  } catch (err) {
    console.error("Dashboard API error:", err);
    throw err;
  }
};


// Add this to your utils/api.js
export const getPostsByUsername = async (username) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts/user/${username}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch user posts');
    }

    return data;
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
};