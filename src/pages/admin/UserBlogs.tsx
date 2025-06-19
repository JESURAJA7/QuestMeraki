import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Download, Eye, Calendar, User } from 'lucide-react';

interface UserBlog {
  _id: string;
  title: string;
  category: string;
  status: 'pending' | 'published' | 'rejected';
  createdAt: string;
  author: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  excerpt: string;
  imageUrl: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function UserBlogs() {
  const [blogs, setBlogs] = useState<UserBlog[]>([]);
  console.log(blogs.length);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'published' | 'rejected'>('pending');

  useEffect(() => {
    fetchUserBlogs();
  }, [filter]);

const fetchUserBlogs = async () => {
  try {
    setLoading(true);

    const endpoint = `${API_URL}/blogs/admin/all?status=${filter === 'all' ? '' : filter}`;

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const blogs = Array.isArray(data) ? data : data.blogs;

      // Filter only user blogs
      const userBlogs = blogs.filter((blog: UserBlog) => blog.author?.role === 'user');

      setBlogs(userBlogs);
    } else {
      setError('Failed to fetch user blogs');
    }
  } catch (error) {
    setError('Failed to fetch user blogs');
  } finally {
    setLoading(false);
  }
};




  const handleStatusChange = async (blogId: string, newStatus: 'published' | 'rejected') => {
    try {
      const response = await fetch(`${API_URL}/blogs/${blogId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setBlogs(blogs.map(blog =>
          blog._id === blogId ? { ...blog, status: newStatus } : blog
        ));
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update blog status');
      }
    } catch (error) {
      setError('Failed to update blog status');
    }
  };

  const downloadBlogData = async (blog: UserBlog) => {
    try {
      const response = await fetch(`${API_URL}/blogs/${blog._id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Create downloadable content
        const blogContent = {
          title: data.title,
          author: data.author.name,
          email: data.author.email,
          category: data.category,
          status: data.status,
          createdAt: data.createdAt,
          content: data.content,
          imageUrl: data.imageUrl
        };

        // Create and download JSON file
        const dataStr = JSON.stringify(blogContent, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `blog-${blog.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      } else {
        setError('Failed to download blog data');
      }
    } catch (error) {
      setError('Failed to download blog data');
    }
  };

  const viewBlogDetails = (blog: UserBlog) => {
    // Open blog details in a modal or new window
    window.open(`/blogs/${blog._id}`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
    <div className="container mx-auto px-4 py-8 bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">User Blog Management</h1>
        <p className="text-gray-600 mb-6">Review, approve, reject, and download user-submitted blog posts</p>

        {/* Filter Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'pending', label: 'Pending Review', count: blogs.filter(b => b.status === 'pending').length },
              { key: 'published', label: 'Published', count: blogs.filter(b => b.status === 'published').length },
              { key: 'rejected', label: 'Rejected', count: blogs.filter(b => b.status === 'rejected').length },
              { key: 'all', label: 'All Blogs', count: blogs.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    filter === tab.key ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No blogs found for the selected filter.</div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {blogs.map((blog) => (
              <li key={blog._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {blog.title}
                        </h3>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            <span>{blog.author.name}</span>
                            <span className="ml-1 text-gray-400">({blog.author.email})</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                          </div>
                          <span className="text-indigo-600">{blog.category}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {blog.excerpt}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(blog.status)}`}>
                          {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => viewBlogDetails(blog)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => downloadBlogData(blog)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                  </div>

                  {blog.status === 'pending' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleStatusChange(blog._id, 'rejected')}
                        className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleStatusChange(blog._id, 'published')}
                        className="inline-flex items-center px-3 py-1 border border-green-300 shadow-sm text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                    </div>
                  )}

                  {blog.status === 'rejected' && (
                    <button
                      onClick={() => handleStatusChange(blog._id, 'published')}
                      className="inline-flex items-center px-3 py-1 border border-green-300 shadow-sm text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </button>
                  )}

                  {blog.status === 'published' && (
                    <button
                      onClick={() => handleStatusChange(blog._id, 'rejected')}
                      className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Unpublish
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}