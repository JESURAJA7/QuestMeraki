import { Link } from 'react-router-dom';
import { PlusCircle, List, LogOut, FileText, BarChart3, TrendingUp, Eye, Calendar, Activity, Flame, ArrowUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

interface DashboardStats {
  totalBlogs: number;
  publishedBlogs: number;
  totalViews: number;
  trendingPostsCount: number;
}

interface TrendingBlog {
  id: string;
  title: string;
  author: string;
  views: number;
  publishedAt: string;
  category: string;
  growthRate: number;
  excerpt: string;
  readTime: number;
  thumbnail?: string;
}

interface RecentActivity {
  id: string;
  type: 'blog_published' | 'user_registered' | 'blog_viewed';
  title: string;
  time: string;
  user?: string;
}

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBlogs: 0,
    publishedBlogs: 0,
    totalViews: 0,
    trendingPostsCount: 0
  });
  
  const [trendingBlogs, setTrendingBlogs] = useState<TrendingBlog[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch all data in parallel
      const [statsResponse, trendingResponse] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers }),
        fetch(`${API_URL}/admin/trending-blogs?limit=5`, { headers })
      ]);

      // Handle stats response
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
          totalBlogs: statsData.totalBlogs || 0,
          publishedBlogs: statsData.publishedBlogs || 0,
          totalViews: statsData.totalViews || 0,
          trendingPostsCount: statsData.trendingPostsCount || 0
        });
      } else if (statsResponse.status === 401) {
        setError('Authentication failed. Please login again.');
        logout();
        return;
      } else {
        console.error('Failed to fetch stats:', await statsResponse.text());
      }

      // Handle trending blogs response
      if (trendingResponse.ok) {
        const trendingData = await trendingResponse.json();
        setTrendingBlogs(trendingData || []);
      } else if (trendingResponse.status === 401) {
        setError('Authentication failed. Please login again.');
        logout();
        return;
      } else {
        console.error('Failed to fetch trending blogs:', await trendingResponse.text());
      }

      // Mock recent activity (you can create a backend endpoint for this too)
      setRecentActivity([
        { id: '1', type: 'blog_published', title: 'New article published', time: '2 hours ago', user: 'John Doe' },
        { id: '2', type: 'blog_viewed', title: 'Article got 100+ views', time: '4 hours ago', user: 'AI Article' },
        { id: '3', type: 'blog_viewed', title: 'Trending post milestone reached', time: '6 hours ago', user: 'React Guide' }
      ]);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
    trend?: number;
  }) => (
    <div className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
      <div className={`absolute top-0 right-0 w-20 h-20 ${color} opacity-5 rounded-full transform translate-x-8 -translate-y-8`}></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
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
          <p className="text-3xl font-bold text-gray-900 mb-1">{value.toLocaleString()}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const ActionCard = ({ to, icon: Icon, title, description, color, badge }: {
    to: string;
    icon: any;
    title: string;
    description: string;
    color: string;
    badge?: string;
  }) => (
    <Link
      to={to}
      className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
    >
      <div className={`absolute inset-0 ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300`}>
            <Icon className={`w-7 h-7 ${color.replace('bg-', 'text-')} group-hover:scale-110 transition-transform duration-300`} />
          </div>
          {badge && (
            <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full font-medium">
              {badge}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </Link>
  );

  const TrendingBlogCard = ({ blog, rank }: { blog: TrendingBlog; rank: number }) => (
    <div className="group relative bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          rank === 1 ? 'bg-yellow-100 text-yellow-800' :
          rank === 2 ? 'bg-gray-100 text-gray-800' :
          rank === 3 ? 'bg-orange-100 text-orange-800' :
          'bg-blue-50 text-blue-800'
        }`}>
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2">
            {blog.title}
          </h4>
          <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
            <span>by {blog.author}</span>
            <span>{blog.category}</span>
            <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">{blog.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1 text-green-600">
                <ArrowUp className="w-3 h-3" />
                <span className="text-xs font-medium">+{blog.growthRate.toFixed(1)}%</span>
              </div>
            </div>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
    const getActivityIcon = () => {
      switch (activity.type) {
        case 'blog_published': return <FileText className="w-4 h-4 text-green-600" />;
        case 'user_registered': return <Activity className="w-4 h-4 text-blue-600" />;
        case 'blog_viewed': return <Eye className="w-4 h-4 text-orange-600" />;
      }
    };

    return (
      <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
        <div className="flex-shrink-0">
          {getActivityIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
          {activity.user && (
            <p className="text-xs text-gray-500">by {activity.user}</p>
          )}
        </div>
        <div className="flex-shrink-0">
          <p className="text-xs text-gray-400">{activity.time}</p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-yellow-300/20 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-pink-300/20 rounded-full animate-ping"></div>
        <div className="absolute top-20 right-1/4 w-12 h-12 bg-blue-300/30 rounded-full animate-pulse delay-1000"></div>
        
        <div className="relative z-10 container mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    Quest Meraki
                  </h1>
                  <p className="text-xl text-purple-100 font-medium">Admin Dashboard</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-purple-100">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-300 group"
            >
              <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Updated Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FileText}
            title="Total Articles"
            value={stats.totalBlogs}
            subtitle="Published content"
            color="bg-blue-500"
            trend={8.2}
          />
          <StatCard
            icon={Eye}
            title="Total Views"
            value={stats.totalViews}
            subtitle="All time views"
            color="bg-green-500"
            trend={15.7}
          />
          <StatCard
            icon={Flame}
            title="Trending Posts"
            value={stats.trendingPostsCount}
            subtitle="Hot content"
            color="bg-orange-500"
            trend={22.3}
          />
          <StatCard
            icon={BarChart3}
            title="Published"
            value={stats.publishedBlogs}
            subtitle="Live articles"
            color="bg-purple-500"
            trend={12.5}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Actions */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h2>
              <p className="text-gray-600">Manage your content and track performance</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ActionCard
                to="/admin/create-post"
                icon={PlusCircle}
                title="Create New Post"
                description="Write and publish fresh content for your audience"
                color="bg-indigo-500"
              />
              
              <ActionCard
                to="/admin/trending-blogs"
                icon={Flame}
                title="Trending Blogs"
                description="View top performing posts and trending content"
                color="bg-orange-500"
                badge="Hot"
              />
              
              <ActionCard
                to="/admin/manage-posts"
                icon={List}
                title="Manage Content"
                description="Edit, organize, and maintain your published articles"
                color="bg-green-500"
              />
              
              {/* <ActionCard
                to="/my-blogs"
                icon={BarChart3}
                title="Analytics"
                description="Track performance and engagement metrics"
                color="bg-purple-500"
              /> */}
            </div>

            {/* Trending Blogs Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Flame className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Top 5 Trending Blogs</h3>
                    <p className="text-sm text-gray-600">Most viewed content this week</p>
                  </div>
                </div>
                <Link
                  to="/admin/trending-blogs"
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
                >
                  View all →
                </Link>
              </div>
              
              <div className="space-y-4">
                {trendingBlogs.length > 0 ? (
                  trendingBlogs.map((blog, index) => (
                    <TrendingBlogCard key={blog.id} blog={blog} rank={index + 1} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Flame className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No trending blogs yet</p>
                    <p className="text-sm text-gray-400">Blogs will appear here as they gain views</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Activity className="w-4 h-4 text-gray-600" />
                </div>
              </div>
              
              <div className="space-y-2">
                {recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <Link
                  to="/admin/activity-log"
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
                >
                  View all activity →
                </Link>
              </div>
            </div>

            {/* Performance Cards */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Today's Views</p>
                    <p className="text-2xl font-bold">{Math.floor(stats.totalViews * 0.1).toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 opacity-80" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Avg. Read Time</p>
                    <p className="text-2xl font-bold">4.2m</p>
                  </div>
                  <BarChart3 className="w-8 h-8 opacity-80" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}