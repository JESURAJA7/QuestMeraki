import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, X, User as UserIcon, Sparkles, Crown, Plus, Settings, LogOut, Home, FileText, Info, Mail } from 'lucide-react';
import SearchBar from './SearchBar';
import { useAuth } from '../hooks/useAuth';
import logoimg from '../assets/images/QuestMeraki_Logo_Recreated-01-removebg-preview.png';


const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const categories = ['Technology', 'Travel', 'Food', 'Lifestyle','Ideating Zone'];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActivePath = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20'
          : 'bg-white/95 backdrop-blur-sm'
        }`}>
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex justify-between items-center h-20">
           
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img src={logoimg} alt="Logo" className="h-24[rem] w-32 " />
              <div className="flex items-center space-x-2">

                {/* <span className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent animate-pulse">
                  QuestMeraki
                </span> */}
              </div>
            </Link>


            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {[
                { path: '/', label: 'Home', icon: Home },
                { path: '/blogs', label: 'Blogs', icon: FileText },
                { path: '/about', label: 'About', icon: Info },
                { path: '/contact', label: 'Contact', icon: Mail }
              ].map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 group relative ${isActivePath(path)
                      ? 'text-indigo-600 bg-indigo-50 shadow-sm'
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  {isActivePath(path) && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>

            {/* Search and Profile */}
            <div className="flex items-center space-x-2">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-3 rounded-xl transition-all duration-200 relative group ${isSearchOpen
                    ? 'bg-indigo-100 text-indigo-600 shadow-sm'
                    : 'hover:bg-gray-100 text-gray-600'
                  }`}
              >
                <Search className="w-5 h-5" />
                <div className="absolute inset-0 rounded-xl bg-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
              </button>

              {/* Profile Menu */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 group relative"
                >
                  {isAuthenticated && user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-transparent group-hover:border-indigo-200 transition-all duration-200"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                  {isAuthenticated && user?.role === 'admin' && (
                    <Crown className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
                  )}
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 py-2 z-50 transform transition-all duration-200 origin-top-right">
                    {isAuthenticated ? (
                      <>
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            {user?.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-12 h-12 rounded-full"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-white" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                                {user?.role === 'admin' && (
                                  <Crown className="w-4 h-4 text-yellow-500" />
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{user?.email}</p>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${user?.role === 'admin'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                                }`}>
                                {user?.role === 'admin' ? 'Administrator' : 'User'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Admin Menu Items */}
                        {user?.role === 'admin' && (
                          <div className="py-2 border-b border-gray-100">
                            <Link
                              to="/admin"
                              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <Settings className="w-5 h-5 group-hover:text-indigo-500" />
                              <span>Admin Dashboard</span>
                            </Link>
                            <Link
                              to="/admin/create-post"
                              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <Plus className="w-5 h-5 group-hover:text-indigo-500" />
                              <span>Create Post</span>
                            </Link>
                            <Link
                              to="/my-blogs"
                              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors group"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <FileText className="w-5 h-5 group-hover:text-emerald-500" />
                              <span>My Blogs</span>
                            </Link>
                          </div>
                        )}

                        {/* User Menu Items */}
                        {/* <div className="py-2 border-b border-gray-100">
                          <Link
                            to="/create-blog"
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors group"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <Plus className="w-5 h-5 group-hover:text-emerald-500" />
                            <span>Create Blog</span>
                          </Link>
                          <Link
                            to="/my-blogs"
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors group"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <FileText className="w-5 h-5 group-hover:text-emerald-500" />
                            <span>My Blogs</span>
                          </Link>
                        </div> */}

                        {/* Logout */}
                        <div className="py-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors group"
                          >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="py-2">
                          <Link
                            to="/login"
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <UserIcon className="w-5 h-5" />
                            <span>Login</span>
                          </Link>
                          <Link
                            to="/register"
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <Plus className="w-5 h-5" />
                            <span>Register</span>
                          </Link>
                        </div>
                        <div className="py-2 border-t border-gray-100">
                          <Link
                            to="/admin/login"
                            className="flex items-center space-x-3 px-4 py-3 text-yellow-700 hover:bg-yellow-50 transition-colors"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <Crown className="w-5 h-5" />
                            <span>Admin Login</span>
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden p-3 rounded-xl hover:bg-gray-100 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col space-y-2">
                {[
                  { path: '/', label: 'Home', icon: Home },
                  { path: '/blogs', label: 'Blogs', icon: FileText },
                  { path: '/about', label: 'About', icon: Info },
                  { path: '/contact', label: 'Contact', icon: Mail }
                ].map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActivePath(path)
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </Link>
                ))}

                {/* Categories in mobile menu */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Categories
                  </h3>
                  {categories.map((category) => (
                    <Link
                      key={category}
                      to={`/category/${category.toLowerCase()}`}
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-start justify-center pt-32">
          <div className="w-full max-w-2xl mx-4 relative">
            <SearchBar
              onClose={() => setIsSearchOpen(false)}
            />
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-20"></div>
    </>
  );
};

export default Navbar;