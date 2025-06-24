// Utility for tracking blog views
const API_URL = import.meta.env.VITE_API_URL;

export const trackBlogView = async (blogId: string, userId?: string) => {
  try {
    const response = await fetch(`${API_URL}/blogs/${blogId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        userId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to track view');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error tracking blog view:', error);
    return null;
  }
};

export const getBlogViewCount = async (blogId: string) => {
  try {
    const response = await fetch(`${API_URL}/blogs/${blogId}/views`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get view count');
    }

    const data = await response.json();
    return data.viewCount;
  } catch (error) {
    console.error('Error getting blog view count:', error);
    return 0;
  }
};

export const getTrendingBlogs = async (limit: number = 10) => {
  try {
    const response = await fetch(`${API_URL}/blogs/trending?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get trending blogs');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting trending blogs:', error);
    return [];
  }
};

// Hook for tracking page views automatically
export const useViewTracker = (blogId: string, userId?: string) => {
  const trackView = () => {
    if (blogId) {
      trackBlogView(blogId, userId);
    }
  };

  return { trackView };
};