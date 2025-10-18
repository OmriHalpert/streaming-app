// Register user via API
async function registerUser(email, username, password) {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        username: username,
        password: password,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: result.message,
      };
    } else {
      return {
        success: false,
        error: result.error,
      };
    }
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}

// Login user via API
async function loginUser(username, password) {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        user: result.user,
      };
    } else {
      return {
        success: false,
        error: result.error,
      };
    }
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}

// Fetch user profiles via API
async function fetchUserProfiles(userId) {
  try {
    const response = await fetch(`/api/users/${userId}/profiles`);
    const result = await response.json();

    if (response.ok) {
      return result.profiles;
    } else {
      console.error("Failed to fetch profiles:", result.error);
      return [];
    }
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }
}

// Fetch user details via API
async function fetchUser(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    const result = await response.json();

    if (response.ok) {
      return result.user;
    } else {
      console.error("Failed to fetch user:", result.error);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

// Fetch content via API
async function fetchContent(userId, profileId) {
  try {
    const response = await fetch(
      `/api/content?userId=${userId}&profileId=${profileId}`
    );
    const result = await response.json();

    if (response.ok) {
      return result.data;
    } else {
      console.error("Failed to fetch content:", result.error);
      return null;
    }
  } catch (error) {
    console.error("Error fetching content:", error);
    return null;
  }
}

// Mark content as watched via API
async function markContentAsWatched(userId, profileId, contentId, season = null, episode = null) {
  try {
    // Build request body with all parameters
    const requestBody = {
      userId: parseInt(userId),
      profileId: parseInt(profileId),
    };

    // Add season and episode if provided (for TV shows)
    if (season !== null && episode !== null) {
      requestBody.season = parseInt(season);
      requestBody.episode = parseInt(episode);
    }

    const response = await fetch(
      `/api/content/watch/${encodeURIComponent(contentId)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const result = await response.json();

    if (response.ok) {
      return result;
    } else {
      console.error("Failed to mark as watched:", result.error);
      return null;
    }
  } catch (error) {
    console.error("Error marking content as watched:", error);
    return null;
  }
}

// Get recommendations via API
async function fetchRecommendations(userId, profileId, limit = 10) {
  try {
    const response = await fetch(
      `/api/content/recommendations/${userId}/${profileId}?limit=${limit}`
    );
    const result = await response.json();

    if (response.ok) {
      return result.data;
    } else {
      console.error("Failed to fetch recommendations:", result.error);
      return [];
    }
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
}

// Toggle content like via API
async function toggleContentLike(userId, profileId, contentId) {
  try {
    const response = await fetch("/api/content/like", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentId: parseInt(contentId),
        userId: parseInt(userId),
        profileId: parseInt(profileId),
      }),
    });

    const result = await response.json();

    if (response.ok) {
      return result;
    } else {
      console.error("Failed to toggle like:", result.error);
      return null;
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return null;
  }
}

// Fetch content by genre via API
async function fetchContentByGenre(
  genreName,
  userId = null,
  profileId = null,
  page = 1,
  limit = null
) {
  try {
    let url = `/api/content/${encodeURIComponent(genreName)}`;

    // Create URL params
    const params = new URLSearchParams();

    // Add query parameters if provided
    if (userId && profileId) {
      params.append("userId", userId);
      params.append("profileId", profileId);
    }

    if (page) {
      params.append("page", page);
    }

    if (limit) {
      params.append("limit", limit);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    const result = await response.json();

    if (response.ok && result.success) {
      return {
        content: result.data,
        pagination: result.pagination,
      };
    } else {
      console.error("Failed to fetch content by genre", result.error);
      return {
        content: [],
        pagination: null,
      };
    }
  } catch (error) {
    console.error("Error fetching content by genre:", error);
    return {
      content: [],
      pagination: null,
    };
  }
}

// Add a new profile via API
async function addProfile(userId, profileName) {
  try {
    const response = await fetch("/api/profiles/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        profileName: profileName,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        profile: result.data.profile,
      };
    } else {
      return {
        success: false,
        error: result.error,
      };
    }
  } catch (error) {
    console.error("Error adding profile:", error);
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}

// Update a profile via API
async function updateProfile(userId, profileId, profileName) {
  try {
    const response = await fetch("/api/profiles/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        profileId: profileId,
        profileName: profileName,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: result.message,
      };
    } else {
      return {
        success: false,
        error: result.error,
      };
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}

// Delete a profile via API
async function deleteProfile(userId, profileId) {
  try {
    const response = await fetch("/api/profiles/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        profileId: profileId,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: result.message,
      };
    } else {
      return {
        success: false,
        error: result.error,
      };
    }
  } catch (error) {
    console.error("Error deleting profile:", error);
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}

// Search content via API
async function searchContent(query, userId, profileId) {
  try {
    const response = await fetch(`/api/content/search?q=${encodeURIComponent(query)}&userId=${userId}&profileId=${profileId}`);
    const result = await response.json();

    if (response.ok && result.success) {
      return {
        success: true,
        data: result.data
      };
    } else {
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('Search error:', error);
    return {
      success: false,
      error: 'Network error. Please try again.'
    };
  }
}

async function getSingleContentById(contentId) {
  try {
    const response = await fetch(`/api/content/${encodeURIComponent(contentId)}`);
    const result = await response.json();

    if (response.ok && result.success) {
      return {
        success: true,
        data: result.data
      };
    } else {
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('Search error:', error);
    return {
      success: false,
      error: 'Network error. Please try again.'
    };
  }
}

// Save watch progress
async function saveProgress(userId, profileId, contentId, contentType, lastPositionSec, isCompleted, season, episode) {
  try {
    const data = {
      userId,
      profileId,
      contentId,
      contentType,
      lastPositionSec,
      isCompleted
    };

    if (contentType === 'show') {
      data.season = season;
      data.episode = episode;
    }

    const response = await fetch('/api/progress/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: result.message
      };
    } else {
      return {
        success: false,
        error: result.message
      };
    }
  } catch (error) {
    console.error('Failed to save progress:', error);
    return {
      success: false,
      error: 'Network error. Please try again.'
    };
  }
}

// Clear watch progress (removes ALL episodes for shows)
async function clearProgress(userId, profileId, contentId, contentType) {
  try {
    const data = {
      userId,
      profileId,
      contentId,
      contentType
    };

    const response = await fetch('/api/progress/clear', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: result.message
      };
    } else {
      return {
        success: false,
        error: result.message
      };
    }
  } catch (error) {
    console.error('Failed to clear progress:', error);
    return {
      success: false,
      error: 'Network error. Please try again.'
    };
  }
}

// Get profile interactions (likes and progress)
async function getProfileInteractions(userId, profileId) {
  try {
    const response = await fetch(`/api/progress/interactions?userId=${userId}&profileId=${profileId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: result.data
      };
    } else {
      return {
        success: false,
        error: result.message
      };
    }
  } catch (error) {
    console.error('Failed to get interactions:', error);
    return {
      success: false,
      error: 'Network error. Please try again.'
    };
  }
}

// Add new content (admin only)
async function addContent(formData) {
  try {
    const response = await fetch('/api/content/add', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: result.message,
        data: result.data
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to add content'
      };
    }
  } catch (error) {
    console.error('Failed to add content:', error);
    return {
      success: false,
      error: 'Network error. Please try again.'
    };
  }
}

// Make functions available globally
window.UserAPI = {
  registerUser,
  loginUser,
  fetchUserProfiles,
  fetchUser,
  fetchContent,
  markContentAsWatched,
  fetchRecommendations,
  toggleContentLike,
  fetchContentByGenre,
  addProfile,
  updateProfile,
  deleteProfile,
  searchContent,
  getSingleContentById,
  saveProgress,
  clearProgress,
  getProfileInteractions,
  addContent,
};
