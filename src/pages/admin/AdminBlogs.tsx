//to view only admin blogs
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react'; 
const API_URL = import.meta.env.VITE_API_URL;

interface Blog {
  _id: string;
  title: string;
  category: string;
  status: 'draft' | 'published' | 'rejected';
  createdAt: string;
}
export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch(`${API_URL}/blogs/admin`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setBlogs(data);
        } else {
          setError('Failed to fetch blogs');
        }
      } catch (error) {
        setError('Failed to fetch blogs');
      }
    };

    fetchBlogs();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
        try {
        const response = await fetch(`${API_URL}/blogs/${id}`, {
            method: 'DELETE',
            headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });
    
        if (response.ok) {
            setBlogs(blogs.filter(blog => blog._id !== id));
        } else {
            alert('Failed to delete blog');
        }
        } catch (error) {
        alert('Failed to delete blog');
        }
    }
    }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Blogs</h1>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {blogs.map(blog => (
              <tr key={blog._id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{blog.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{blog.category}</td>
                <td className={`px-6 py-4 whitespace-nowrap ${
                  blog.status === 'published' ? 'text-green-600' :
                  blog.status === 'draft' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <Link to={`/admin/edit-blog/${blog._id}`} className="text-indigo-600 hover:text-indigo-900">
                      <Edit2 className="inline-block" />
                    </Link>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="inline-block" />
                    </button>
                  </div>
                </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>    
    </div>
  );
}


