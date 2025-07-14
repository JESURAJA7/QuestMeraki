import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  FileText, 
  TrendingUp, 
  Eye, 
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Trash2,
  Mail,
  User,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  ExternalLink,
  Star,
  Award,
  Target,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL;

interface DownloadRecord {
  _id: string;
  name: string;
  email: string;
  purpose?: string;
  remarks?: string;
  blogId: string;
  blogTitle: string;
  downloadedAt: string;
  userAgent?: string;
  ipAddress?: string;
}

interface DownloadStats {
  totalDownloads: number;
  downloadsLast30Days: number;
  mostDownloaded: Array<{
    _id: string;
    blogTitle: string;
    count: number;
  }>;
  downloadsByPurpose: Array<{
    _id: string;
    count: number;
  }>;
  timelineData: Array<{
    _id: string;
    count: number;
  }>;
}

interface Filters {
  search: string;
  purpose: string;
  dateFrom: string;
  dateTo: string;
}

const MotionTR = motion('tr');
const MotionTD = motion('td');
const MotionTH = motion('th');

export default function ManageDownloads() {
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [stats, setStats] = useState<DownloadStats>({
    totalDownloads: 0,
    downloadsLast30Days: 0,
    mostDownloaded: [],
    downloadsByPurpose: [],
    timelineData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    purpose: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDownloads, setSelectedDownloads] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchDownloads();
    fetchStats();
  }, [currentPage, filters]);

  const fetchDownloads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.purpose !== 'all' && { purpose: filters.purpose }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo })
      });

      const response = await fetch(`${API_URL}/blogs/downloads?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDownloads(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        setError('Failed to fetch downloads');
      }
    } catch (error) {
      console.error('Failed to fetch downloads:', error);
      setError('Failed to load downloads');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/blogs/downloads/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          totalDownloads: data.totalDownloads || 0,
          downloadsLast30Days: data.downloadsLast30Days || 0,
          mostDownloaded: data.mostDownloaded || [],
          downloadsByPurpose: data.downloadsByPurpose || [],
          timelineData: data.timelineData || []
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDownloads(), fetchStats()]);
    setRefreshing(false);
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      purpose: 'all',
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(1);
  };

  const handleSelectDownload = (id: string) => {
    setSelectedDownloads(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedDownloads.length === downloads.length) {
      setSelectedDownloads([]);
    } else {
      setSelectedDownloads(downloads.map(d => d._id));
    }
  };

  const exportToCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        ...(filters.purpose !== 'all' && { purpose: filters.purpose }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo })
      });

      const response = await fetch(`${API_URL}/blogs/downloads/export?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `downloads-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  const getPurposeColor = (purpose: string) => {
    const colors: Record<string, string> = {
      education: 'bg-blue-100 text-blue-800',
      research: 'bg-green-100 text-green-800',
      personal: 'bg-purple-100 text-purple-800',
      professional: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[purpose?.toLowerCase()] || colors.other;
  };

  const getPurposeIcon = (purpose: string) => {
    const icons: Record<string, string> = {
      education: '🎓',
      research: '🔬',
      personal: '👤',
      professional: '💼',
      other: '📄'
    };
    return icons[purpose?.toLowerCase()] || icons.other;
  };

  const getShortId = (id: any) => {
    if (!id) return 'N/A';
    const idStr = typeof id === 'string' ? id : String(id);
    return idStr.length > 8 ? idStr.slice(-8) : idStr;
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
    trend?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 w-20 h-20 ${color} opacity-5 rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300`}></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')} group-hover:scale-110 transition-transform duration-300`} />
          </div>
          {trend && (
            <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {trend > 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );

  if (loading && downloads.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-100"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-600 border-t-transparent absolute top-0 left-0"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Download className="w-8 h-8 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600 mt-4">Loading download analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-yellow-300/20 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-pink-300/20 rounded-full animate-ping"></div>
        
        <div className="relative z-10 container mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <Link
                  to="/admin/downloads"
                  className="p-3 bg-white/20 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
                >
                  <ArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform duration-300" />
                </Link>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Download className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    Download Analytics
                  </h1>
                  <p className="text-xl text-purple-100 font-medium">Track user engagement and downloads</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-300 group disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-300`} />
                <span className="font-medium">Refresh</span>
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-300 group"
              >
                <Download className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">Export CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Download}
            title="Total Downloads"
            value={stats.totalDownloads}
            subtitle="All time downloads"
            color="bg-blue-500"
          />
          <StatCard
            icon={Activity}
            title="Last 30 Days"
            value={stats.downloadsLast30Days}
            subtitle="Recent downloads"
            color="bg-green-500"
          />
          <StatCard
            icon={TrendingUp}
            title="Top Blog"
            value={stats.mostDownloaded[0]?.count || 0}
            subtitle={stats.mostDownloaded[0]?.blogTitle || 'N/A'}
            color="bg-purple-500"
          />
          <StatCard
            icon={BarChart3}
            title="Top Purpose"
            value={stats.downloadsByPurpose[0]?.count || 0}
            subtitle={stats.downloadsByPurpose[0]?._id || 'N/A'}
            color="bg-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filters and Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-gray-900">Download Records</h2>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                    {stats.totalDownloads} total
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      showFilters 
                        ? 'bg-indigo-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                  {(filters.search || filters.purpose !== 'all' || filters.dateFrom || filters.dateTo) && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or blog title..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                />
              </div>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
                      <select
                        value={filters.purpose}
                        onChange={(e) => handleFilterChange('purpose', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                      >
                        <option value="all">All Purposes</option>
                        <option value="education">Education</option>
                        <option value="research">Research</option>
                        <option value="personal">Personal</option>
                        <option value="professional">Professional</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                      <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                      <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Downloads Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedDownloads.length === downloads.length && downloads.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {selectedDownloads.length > 0 ? `${selectedDownloads.length} selected` : 'Select all'}
                    </span>
                  </div>
                  {selectedDownloads.length > 0 && (
                    <button className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Selected</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto">
                {downloads.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <MotionTH className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</MotionTH>
                        <MotionTH className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blog</MotionTH>
                        <MotionTH className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</MotionTH>
                        <MotionTH className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloaded</MotionTH>
                        <MotionTH className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</MotionTH>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {downloads.map((download, index) => (
                        <MotionTR
                          key={download._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors duration-200"
                        >
                          <MotionTD className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={selectedDownloads.includes(download._id)}
                                onChange={() => handleSelectDownload(download._id)}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                              <div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                    {download.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">{download.name}</p>
                                    <p className="text-xs text-gray-500 flex items-center">
                                      <Mail className="w-3 h-3 mr-1" />
                                      {download.email}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </MotionTD>
                          <MotionTD className="px-6 py-4">
                            <div className="max-w-xs">
                              <p className="text-sm font-medium text-gray-900 truncate" title={download.blogTitle}>
                                {download.blogTitle}
                              </p>
                              <p className="text-xs text-gray-500">Blog ID: {getShortId(download.blogId)}</p>
                            </div>
                          </MotionTD>
                          <MotionTD className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPurposeColor(download.purpose || 'other')}`}>
                              <span className="mr-1">{getPurposeIcon(download.purpose || 'other')}</span>
                              {download.purpose ? download.purpose.charAt(0).toUpperCase() + download.purpose.slice(1) : 'Unknown'}
                            </span>
                          </MotionTD>
                          <MotionTD className="px-6 py-4">
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(download.downloadedAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-gray-400">
                              {new Date(download.downloadedAt).toLocaleTimeString()}
                            </p>
                          </MotionTD>
                          <MotionTD className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200">
                                <ExternalLink className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200">
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </MotionTD>
                        </MotionTR>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <Download className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No downloads yet</h3>
                    <p className="text-gray-500">Downloads will appear here when users download your blog posts.</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </button>
                      <span className="px-4 py-2 text-sm font-medium text-gray-700">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Analytics */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Purpose Distribution */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Downloads by Purpose</h3>
                  <PieChart className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {stats.downloadsByPurpose?.length > 0 ? (
                    stats.downloadsByPurpose.map(({ _id: purpose, count }) => (
                      <div key={purpose || 'unknown'} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{getPurposeIcon(purpose)}</span>
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {purpose || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(count / stats.totalDownloads) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{count}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No purpose distribution data available</p>
                  )}
                </div>
              </div>

              {/* Top Downloaded Blogs */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Top Downloads</h3>
                  <Star className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {stats.mostDownloaded?.length > 0 ? (
                    stats.mostDownloaded.map((blog, index) => (
                      <div key={blog._id} className="flex items-start space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-50 text-blue-800'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate" title={blog.blogTitle}>
                            {blog.blogTitle}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">Downloads</span>
                            <span className="text-sm font-semibold text-gray-900">{blog.count}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No download data available</p>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Avg. Downloads/Day</p>
                      <p className="text-2xl font-bold">
                        {Math.round(stats.downloadsLast30Days / 30)}
                      </p>
                    </div>
                    <Target className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Recent Downloads</p>
                      <p className="text-2xl font-bold">
                        {stats.timelineData[0]?.count || 0}
                      </p>
                    </div>
                    <Zap className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Top Purpose</p>
                      <p className="text-2xl font-bold">
                        {stats.downloadsByPurpose[0]?._id || 'N/A'}
                      </p>
                    </div>
                    <Award className="w-8 h-8 opacity-80" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}