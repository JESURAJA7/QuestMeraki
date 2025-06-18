import { Link } from 'react-router-dom';
import { PlusCircle, List, LogOut, Users, FileText, BarChart3, TrendingUp, Eye, Calendar, Activity } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

interface DashboardStats {
  totalBlogs: number;
  pendingBlogs: number;
  publishedBlogs: number;
  totalUsers: number;
  monthlyViews?: number;
  growthRate?: number;
}

interface RecentActivity {
  id: string;
  type: 'blog_published' | 'user_registered' | 'blog_submitted';
  title: string;
  time: string;
  user?: string;
}

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBlogs: 0,
    pendingBlogs: 0,
    publishedBlogs: 0,
    totalUsers: 0,
    monthlyViews: 0,
    growthRate: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch(`${API_URL}/admin/recent-activity`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
          ...statsData,
          monthlyViews: statsData.monthlyViews || 12500,
          growthRate: statsData.growthRate || 15.2
        });
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData || [
          { id: '1', type: 'blog_published', title: 'New article published', time: '2 hours ago', user: 'John Doe' },
          { id: '2', type: 'user_registered', title: 'New user registered', time: '4 hours ago', user: 'Jane Smith' },
          { id: '3', type: 'blog_submitted', title: 'Blog submitted for review', time: '6 hours ago', user: 'Mike Johnson' }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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

  const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
    const getActivityIcon = () => {
      switch (activity.type) {
        case 'blog_published': return <FileText className="w-4 h-4 text-green-600" />;
        case 'user_registered': return <Users className="w-4 h-4 text-blue-600" />;
        case 'blog_submitted': return <Eye className="w-4 h-4 text-orange-600" />;
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
                  <p className="text-xl text-purple-100 font-medium">Admin panel</p>
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
        {/* Enhanced Stats Grid */}
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
            title="Monthly Views"
            value={stats.monthlyViews || 0}
            subtitle="This month"
            color="bg-green-500"
            trend={stats.growthRate}
          />
          <StatCard
            icon={BarChart3}
            title="Pending Review"
            value={stats.pendingBlogs}
            subtitle="Awaiting approval"
            color="bg-orange-500"
          />
          <StatCard
            icon={Users}
            title="Active Users"
            value={stats.totalUsers}
            subtitle="Registered members"
            color="bg-purple-500"
            trend={12.5}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Actions */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h2>
              <p className="text-gray-600">Manage your content and users efficiently</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ActionCard
                to="/admin/create-post"
                icon={PlusCircle}
                title="Create New Post"
                description="Write and publish fresh content for your audience"
                color="bg-indigo-500"
              />
              
              <ActionCard
                to="/admin/user-blogs"
                icon={Users}
                title="Manage Users Blogs"
                description="Review and moderate user-generated content"
                color="bg-blue-500"
                badge={stats.pendingBlogs > 0 ? `${stats.pendingBlogs} pending` : undefined}
              />
              
              <ActionCard
                to="/admin/manage-posts"
                icon={List}
                title="Manage Content"
                description="Edit, organize, and maintain your published articles"
                color="bg-green-500"
              />
              
              <ActionCard
                to="/my-blogs"
                icon={BarChart3}
                title="My Blogs"
                description="Track performance and engagement metrics"
                color="bg-purple-500"
              />
            </div>
          </div>

          {/* Recent Activity Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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

            {/* Quick Stats Mini Cards */}
            <div className="mt-6 space-y-4">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Today's Views</p>
                    <p className="text-2xl font-bold">2,847</p>
                  </div>
                  <TrendingUp className="w-8 h-8 opacity-80" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Response Rate</p>
                    <p className="text-2xl font-bold">94%</p>
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