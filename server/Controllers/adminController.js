import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants.js';
import User from '../model/User.js';
import Blog from '../model/Blog.js';

export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role: 'admin' 
    });
    await admin.save();
    
    const token = jwt.sign({ userId: admin._id }, JWT_SECRET);
    res.status(201).json({ 
      token, 
      user: { 
        id: admin._id, 
        name, 
        email, 
        role: admin.role 
      } 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      throw new Error('Invalid credentials');
    } 
    const token = jwt.sign({ userId: admin._id }, JWT_SECRET);
    res.json({ 
      token, 
      user: { 
        id: admin._id, 
        name: admin.name, 
        email, 
        role: admin.role 
      } 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//get admin stats for dashboard
export const stateAdmin = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalBlogs = await Blog.countDocuments();
    const pendingBlogs = await Blog.countDocuments({ status: 'pending' });
    const publishedBlogs = await Blog.countDocuments({ status: 'published' });

     const viewsAggregation = await Blog.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const totalViews = viewsAggregation[0]?.totalViews || 0;

    const avgViewsAggregation = await Blog.aggregate([
      { $group: { _id: null, avgViews: { $avg: '$views' } } }
    ]);
    const avgViews = avgViewsAggregation[0]?.avgViews || 0;

    const trendingPostsCount = await Blog.countDocuments({ views: { $gt: avgViews } });

    res.json({
      totalBlogs,
      publishedBlogs,
      totalViews,
      trendingPostsCount
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Error fetching admin stats' });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ status: 'published' });

    const viewsAggregation = await Blog.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const totalViews = viewsAggregation[0]?.totalViews || 0;

    const avgViewsAggregation = await Blog.aggregate([
      { $group: { _id: null, avgViews: { $avg: '$views' } } }
    ]);
    const avgViews = avgViewsAggregation[0]?.avgViews || 0;

    const trendingPostsCount = await Blog.countDocuments({ views: { $gt: avgViews } });

    res.json({
      totalBlogs,
      publishedBlogs,
      totalViews,
      trendingPostsCount
    });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ message: 'Failed to get stats' });
  }
};

// Get trending blogs for admin
export const getTrendingBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const blogs = await Blog.find({ status: 'published' })
      .populate('author', 'name email')
      .sort({ views: -1, createdAt: -1 })
      .limit(limit);

    const trendingBlogs = blogs.map(blog => ({
      id: blog._id,
      title: blog.title,
      author: blog.author.name,
      views: blog.views || 0,
      publishedAt: blog.createdAt,
      category: blog.category || 'Uncategorized',
      growthRate: Math.random() * 50 + 5, // Mock growth rate
      excerpt: blog.excerpt || blog.content.substring(0, 150) + '...',
      readTime: Math.ceil(blog.content.split(' ').length / 200),
      thumbnail: blog.imageUrl
    }));

    res.json(trendingBlogs);
  } catch (error) {
    console.error('Error getting trending blogs:', error);
    res.status(500).json({ message: 'Failed to get trending blogs' });
  }
};

export const fetchRecentActivity = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/recent-activity`, {
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      return await response.json();
    }
    
    // Return mock data if endpoint doesn't exist yet
    return [
      { id: '1', type: 'blog_published', title: 'New article published', time: '2 hours ago', user: 'John Doe' },
      { id: '2', type: 'blog_viewed', title: 'Article got 100+ views', time: '4 hours ago', user: 'AI Article' },
      { id: '3', type: 'blog_viewed', title: 'Trending post milestone reached', time: '6 hours ago', user: 'React Guide' }
    ];
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    // Return mock data on error
    return [
      { id: '1', type: 'blog_published', title: 'New article published', time: '2 hours ago', user: 'John Doe' },
      { id: '2', type: 'blog_viewed', title: 'Article got 100+ views', time: '4 hours ago', user: 'AI Article' },
      { id: '3', type: 'blog_viewed', title: 'Trending post milestone reached', time: '6 hours ago', user: 'React Guide' }
    ];
  }
};