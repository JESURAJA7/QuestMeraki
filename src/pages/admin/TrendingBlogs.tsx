import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Flame, Eye, TrendingUp, Calendar, User, Clock } from 'lucide-react';
import { getTrendingBlogs } from '../../../src/utils/viewTracker';

interface TrendingBlog {
  id: string; // Mapped from _id
  title: string;
  subtitle: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  category: string;
  views: number;
  growthRate: number;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string; // Mapped from imageUrl
}

export default function TrendingBlogsPage() {
  const [trendingBlogs, setTrendingBlogs] = useState<TrendingBlog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('week');

  useEffect(() => {
    fetchTrendingBlogs();
  }, [selectedPeriod]);

  const fetchTrendingBlogs = async () => {
    try {
      const blogsFromApi = await getTrendingBlogs(20);

      // Map API data to match the component structure
      const blogs = blogsFromApi.map((blog: any) => ({
        id: blog._id,
        title: blog.title,
        subtitle: blog.subtitle,
        content: blog.content,
        author: blog.author,
        category: blog.category,
        views: blog.views,
        growthRate: blog.growthRate,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
        thumbnail: blog.imageUrl
      }));

      setTrendingBlogs(blogs);
    } catch (error) {
      console.error('Failed to fetch trending blogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const TrendingBlogCard = ({ blog, rank }: { blog: TrendingBlog; rank: number }) => (
    <div className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
      <div className="absolute top-4 left-4 z-10">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
          rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg' :
          rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-white shadow-lg' :
          rank === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-lg' :
          'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg'
        }`}>
          {rank}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {blog.thumbnail && (
          <div className="relative w-full md:w-48 h-32 rounded-xl overflow-hidden">
            <img
              src={blog.thumbnail}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        )}

        <div className={`flex-1 ${blog.thumbnail ? 'pt-0' : 'pt-8'}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                blog.category === 'Technology' ? 'bg-purple-100 text-purple-800' :
                blog.category === 'Development' ? 'bg-blue-100 text-blue-800' :
                blog.category === 'Design' ? 'bg-pink-100 text-pink-800' :
                blog.category === 'Backend' ? 'bg-green-100 text-green-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {blog.category}
              </span>
              <div className="flex items-center space-x-1 text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span className="text-xs font-medium">+{blog.growthRate.toFixed(1)}%</span>
              </div>
            </div>
            <Flame className="w-5 h-5 text-orange-500" />
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300 line-clamp-2">
            {blog.title}
          </h3>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {blog.subtitle}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{blog.author?.name || 'Unknown Author'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{Math.ceil(blog.content.split(' ').length / 200)} min read</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-gray-700 font-medium">
              <Eye className="w-4 h-4" />
              <span>{blog.views.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Flame className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Trending Blogs</h1>
                  <p className="text-sm text-gray-600">Most popular content by views and engagement</p>
                </div>
              </div>
            </div>

            {/* Period Filter */}
            <div className="flex items-center space-x-2">
              {['today', 'week', 'month', 'all'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    selectedPeriod === period
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trending Blogs List */}
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Top Performing Content
              </h2>
              <p className="text-sm text-gray-600">
                Showing {trendingBlogs.length} trending blogs for {selectedPeriod}
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span>Sorted by views and growth rate</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {trendingBlogs.map((blog, index) => (
            <TrendingBlogCard key={blog.id} blog={blog} rank={index + 1} />
          ))}
        </div>

        {trendingBlogs.length === 0 && (
          <div className="text-center py-12">
            <Flame className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trending blogs found</h3>
            <p className="text-gray-600">Check back later for trending content.</p>
          </div>
        )}
      </div>
    </div>
  );
}
