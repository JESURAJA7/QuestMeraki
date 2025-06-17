import { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import BlogCard from '../components/BlogCard';

interface Blog {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  author: {
    name: string;
    email: string;
  };
  createdAt: string;
  imageUrl: string;
  category: string;
}

const API_URL = import.meta.env.VITE_API_URL ;

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    filterBlogsByDate();
  }, [blogs, selectedMonth, selectedYear]);

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${API_URL}/blogs`);
      if (response.ok) {
        const data = await response.json();
        setBlogs(data);
      } else {
        setError('Failed to fetch blogs');
      }
    } catch (error) {
      setError('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const filterBlogsByDate = () => {
    if (!selectedMonth) {
      setFilteredBlogs(blogs);
      return;
    }

    const monthIndex = months.indexOf(selectedMonth);
    const filtered = blogs.filter(blog => {
      const blogDate = new Date(blog.createdAt);
      return blogDate.getMonth() === monthIndex && blogDate.getFullYear() === selectedYear;
    });
    
    setFilteredBlogs(filtered);
  };

  const getAvailableMonths = () => {
    const availableMonths = new Set<string>();
    blogs.forEach(blog => {
      const blogDate = new Date(blog.createdAt);
      if (blogDate.getFullYear() === selectedYear) {
        availableMonths.add(months[blogDate.getMonth()]);
      }
    });
    return Array.from(availableMonths).sort((a, b) => months.indexOf(a) - months.indexOf(b));
  };

  const getAvailableYears = () => {
    const years = new Set<number>();
    blogs.forEach(blog => {
      years.add(new Date(blog.createdAt).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  };

  const recentBlogs = filteredBlogs.slice(0, 6);
  const olderBlogs = filteredBlogs.slice(6);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">All Blog Posts</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover our latest articles, insights, and stories from our community of writers.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content - Recent Blogs */}
        <div className="lg:w-2/3">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {selectedMonth ? `${selectedMonth} ${selectedYear} Posts` : 'Recent Posts'}
            </h2>
            
            {recentBlogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {recentBlogs.map((blog) => (
                  <div key={blog._id} className="transform transition-all duration-300 hover:scale-[1.02]">
                    <BlogCard
                      id={blog._id}
                      title={blog.title}
                      excerpt={blog.excerpt}
                      author={blog.author.name}
                      date={new Date(blog.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      imageUrl={blog.imageUrl}
                      category={blog.category}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600">
                  {selectedMonth ? `No blog posts were published in ${selectedMonth} ${selectedYear}.` : 'No blog posts available.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/3">
          <div className="sticky top-8 space-y-8">
            {/* Date Filter */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                Filter by Date
              </h3>
              
              {/* Year Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedYear(prev => prev - 1)}
                    className="p-1 hover:bg-gray-100 rounded"
                    disabled={selectedYear <= Math.min(...getAvailableYears())}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {getAvailableYears().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setSelectedYear(prev => prev + 1)}
                    className="p-1 hover:bg-gray-100 rounded"
                    disabled={selectedYear >= Math.max(...getAvailableYears())}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Month Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">All Months</option>
                  {getAvailableMonths().map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setSelectedMonth('');
                  setSelectedYear(new Date().getFullYear());
                }}
                className="w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
              >
                Clear Filters
              </button>
            </div>

            {/* Older Posts */}
            {olderBlogs.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                  Older Posts
                </h3>
                <div className="space-y-4">
                  {olderBlogs.slice(0, 10).map((blog) => (
                    <div key={blog._id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                      <h4 className="font-medium text-gray-900 hover:text-indigo-600 transition-colors">
                        <a href={`/blogs/${blog._id}`} className="line-clamp-2">
                          {blog.title}
                        </a>
                      </h4>
                      <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                        <span>{blog.author.name}</span>
                        <span>{new Date(blog.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {olderBlogs.length > 10 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 text-center">
                      And {olderBlogs.length - 10} more posts...
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Blog Stats */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Blog Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Posts</span>
                  <span className="font-semibold text-indigo-600">{blogs.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-semibold text-indigo-600">
                    {blogs.filter(blog => {
                      const blogDate = new Date(blog.createdAt);
                      const now = new Date();
                      return blogDate.getMonth() === now.getMonth() && 
                             blogDate.getFullYear() === now.getFullYear();
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Categories</span>
                  <span className="font-semibold text-indigo-600">
                    {new Set(blogs.map(blog => blog.category)).size}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-8 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}