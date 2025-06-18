import { Link } from 'react-router-dom';
import { Menu, Search, X, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import SearchBar from './SearchBar';
import { useAuth } from '../hooks/useAuth';
import logoimg from '../assets/images/image.png'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const categories = ['Technology', 'Travel', 'Food', 'Lifestyle'];

  return (
    <nav className="bg-white shadow-lg ">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
           <img src={logoimg} alt="Logo" className="h-18 w-12 " />
              <div className="flex items-center space-x-2">
            
            <span className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent animate-pulse">
              QuestMeraki
            </span>
          </div>
          </Link>

          {/* Desktop Navigation */}
           <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-indigo-600 transition-colors">Home</Link>
            <Link to="/blogs" className="text-gray-700 hover:text-indigo-600 transition-colors">Blogs</Link>
             <Link to="/about" className="text-gray-700 hover:text-indigo-600 transition-colors">About</Link>
            <Link to="/contact" className="text-gray-700 hover:text-indigo-600 transition-colors">Contact</Link>
          </div>

        

          {/* Search and Profile */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="p-2 hover:bg-gray-100 rounded-full flex items-center"
              >
                <UserIcon className="w-5 h-5" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        {user?.name}
                      </div>
                      {user?.role === 'admin' && (
                        <>
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Admin Dashboard
                          </Link>
                          {/* <Link
                            to="/admin/create-posts"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            create Posts
                          </Link> */}
                        </>
                      )}
                      <Link
                        to="/create-blog"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Create Blog
                      </Link>
                      <Link
                        to="/my-blogs"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        My Blogs
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Register
                      </Link>
                      <Link
                        to="/admin/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Admin Login
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-indigo-600">Home</Link>
              {categories.map((category) => (
                <Link
                  key={category}
                  to={`/category/${category.toLowerCase()}`}
                  className="text-gray-700 hover:text-indigo-600"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4">
            <SearchBar onClose={() => setIsSearchOpen(false)} />
          </div>
        )}
      </div>
    
    </nav>
  );
}