import { Search, X, Filter, Calendar } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface BlogResult {
  _id: string;
  title: string;
  category: string;
  imageUrl?: string;
  createdAt?: string;
}

interface SearchBarProps {
  onClose: () => void;
}

export default function SearchBar({ onClose }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<BlogResult[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useState({
    category: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'recent',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const params = {
        query: searchQuery,
        ...(searchParams.category && { category: searchParams.category }),
        ...(searchParams.dateFrom && { dateFrom: searchParams.dateFrom }),
        ...(searchParams.dateTo && { dateTo: searchParams.dateTo }),
        sortBy: searchParams.sortBy,
      };

      const res = await axios.get(`${API_URL}/blogs/search`, {
        params,
      });
      setResults(res.data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdvancedSearch = async () => {
    setIsSearching(true);
    try {
      const params = {
        ...(searchQuery && { query: searchQuery }),
        ...(searchParams.category && { category: searchParams.category }),
        ...(searchParams.dateFrom && { dateFrom: searchParams.dateFrom }),
        ...(searchParams.dateTo && { dateTo: searchParams.dateTo }),
        sortBy: searchParams.sortBy,
      };

      const res = await axios.get(`${API_URL}/blogs/search`, {
        params,
      });
      setResults(res.data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const resetSearch = () => {
    setSearchQuery('');
    setResults([]);
    setSearchParams({
      category: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'recent',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-2xl w-full mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-10 pr-16 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <div className="absolute right-3 flex space-x-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-gray-400 hover:text-indigo-600"
              title="Advanced search"
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              title="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Advanced Search Options */}
        {showAdvanced && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={searchParams.category}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, category: e.target.value })
                  }
                  placeholder="e.g. Technology, Business"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={searchParams.sortBy}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, sortBy: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={searchParams.dateFrom}
                    onChange={(e) =>
                      setSearchParams({ ...searchParams, dateFrom: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={searchParams.dateTo}
                    onChange={(e) =>
                      setSearchParams({ ...searchParams, dateTo: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={resetSearch}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleAdvancedSearch}
                disabled={isSearching}
                className="px-4 py-2 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Apply Filters'}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Display Search Results */}
      {isSearching && (
        <div className="mt-4 p-4 text-center text-gray-500">Searching...</div>
      )}
      
      {results.length > 0 && !isSearching && (
        <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
          <div className="text-sm text-gray-500 mb-2">
            Found {results.length} {results.length === 1 ? 'result' : 'results'}
          </div>
          {results.map((blog) => (
            <div
              key={blog._id}
              className="p-3 border rounded hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => {
                // You might want to navigate to the blog post here
                console.log('Navigate to blog:', blog._id);
              }}
            >
              <h3 className="font-semibold text-indigo-700">{blog.title}</h3>
              <div className="flex justify-between mt-1 text-sm">
                <span className="text-gray-600">{blog.category}</span>
                {blog.createdAt && (
                  <span className="text-gray-400">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {results.length === 0 && !isSearching && searchQuery && (
        <div className="mt-4 p-4 text-center text-gray-500">
          No results found. Try different search terms.
        </div>
      )}
    </div>
  );
}