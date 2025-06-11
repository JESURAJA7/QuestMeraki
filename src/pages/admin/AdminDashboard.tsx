import { Link } from 'react-router-dom';
import { PlusCircle, List, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function AdminDashboard() {
  const { logout } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <button
          onClick={logout}
          className="flex items-center text-red-600 hover:text-red-800"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/admin/create-post"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center text-indigo-600">
            <PlusCircle className="w-8 h-8 mr-3" />
            <div>
              <h2 className="text-xl font-semibold">Create New Post</h2>
              <p className="text-gray-600 mt-1">Write and publish a new blog post</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/manage-posts"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center text-indigo-600">
            <List className="w-8 h-8 mr-3" />
            <div>
              <h2 className="text-xl font-semibold">Manage Posts</h2>
              <p className="text-gray-600 mt-1">Edit, delete, or review existing posts</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}