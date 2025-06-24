import { useState, useEffect } from 'react';
import { trackBlogView, getBlogViewCount } from '../../src/utils/viewTracker';

export const useBlogViews = (blogId: string, userId?: string) => {
  const [viewCount, setViewCount] = useState<number>(0);
  const [hasTracked, setHasTracked] = useState<boolean>(false);

  useEffect(() => {
    if (blogId) {
      // Get initial view count
      getBlogViewCount(blogId).then(count => {
        setViewCount(count);
      });
    }
  }, [blogId]);

  const incrementView = async () => {
    if (!hasTracked && blogId) {
      try {
        await trackBlogView(blogId, userId);
        setViewCount(prev => prev + 1);
        setHasTracked(true);
      } catch (error) {
        console.error('Failed to track view:', error);
      }
    }
  };

  // Auto-track view when component mounts (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasTracked) {
        incrementView();
      }
    }, 2000); // Track after 2 seconds of viewing

    return () => clearTimeout(timer);
  }, [blogId, hasTracked]);

  return {
    viewCount,
    incrementView,
    hasTracked
  };
};